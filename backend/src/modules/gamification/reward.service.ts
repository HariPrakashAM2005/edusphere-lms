import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RewardDefinition {
  name: string;
  description: string;
  category: string;
  xpCost: number;
  icon: string;
  stock?: number;
}

export const DEFAULT_REWARDS: RewardDefinition[] = [
  { name: 'EduSphere Laptop Sticker Pack', description: 'Show off your skills with 5 premium vinyl stickers.', category: 'merchandise', xpCost: 300, icon: '🎨', stock: 100 },
  { name: 'Official Course Certificate PDF', description: 'A verifiable, high-resolution certificate for your completed course.', category: 'certificate', xpCost: 1000, icon: '📜' },
  { name: 'EduSphere Coffee Mug', description: 'Ceramic matte black mug to power your morning study sessions.', category: 'merchandise', xpCost: 3000, icon: '☕', stock: 25 },
  { name: '10% Next Course Discount Code', description: 'Get 10% off any premium certification course on EduSphere.', category: 'discount', xpCost: 2000, icon: '🎟️' },
  { name: '50% Next Course Discount Code', description: 'Get 50% off any premium certification course on EduSphere.', category: 'discount', xpCost: 8000, icon: '🎟️' },
  { name: 'EduSphere Champion Hoodie', description: 'Limited edition ultra-soft organic cotton hoodie.', category: 'merchandise', xpCost: 12000, icon: '👕', stock: 10 },
  { name: '1-on-1 Faculty Mentorship Session (45m)', description: 'Schedule a private call with a course instructor for project help or career guidance.', category: 'perk', xpCost: 15000, icon: '🎓', stock: 5 },
  { name: 'Custom Profile Frame & Badges', description: 'Stand out on the leaderboard with a rare golden border around your avatar.', category: 'perk', xpCost: 1500, icon: '👑' }
];

/**
 * Seed default rewards in the database.
 */
export const seedDefaultRewards = async (): Promise<void> => {
  for (const rewardDef of DEFAULT_REWARDS) {
    const existing = await prisma.reward.findFirst({
      where: { name: rewardDef.name },
    });

    if (!existing) {
      await prisma.reward.create({
        data: {
          name: rewardDef.name,
          description: rewardDef.description,
          category: rewardDef.category,
          xpCost: rewardDef.xpCost,
          icon: rewardDef.icon,
          stock: rewardDef.stock ?? null,
        },
      });
    }
  }
  console.log('✅ Default rewards verified/seeded');
};

/**
 * Lists all available rewards.
 */
export const listRewards = async (): Promise<any[]> => {
  await seedDefaultRewards();
  return prisma.reward.findMany({
    where: {
      isActive: true,
    },
    orderBy: { xpCost: 'asc' },
  });
};

/**
 * Checks if a user is eligible to redeem a reward.
 */
export const checkEligibility = async (userId: string, rewardId: string): Promise<{ eligible: boolean; error?: string; reward?: any; userLevel?: any }> => {
  const reward = await prisma.reward.findUnique({
    where: { id: rewardId },
  });

  if (!reward || !reward.isActive) {
    return { eligible: false, error: 'Reward not found or inactive' };
  }

  if (reward.stock !== null && reward.stock <= 0) {
    return { eligible: false, error: 'Reward is out of stock' };
  }

  const userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  if (!userLevel || userLevel.currentXP < reward.xpCost) {
    return { eligible: false, error: 'Insufficient XP balance', reward, userLevel };
  }

  return { eligible: true, reward, userLevel };
};

/**
 * Redeems a reward, deducting XP and registering redemption history.
 */
export const processRedemption = async (userId: string, rewardId: string): Promise<any> => {
  const { eligible, error, reward, userLevel } = await checkEligibility(userId, rewardId);

  if (!eligible) {
    throw new Error(error || 'Failed redemption eligibility check');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Deduct XP
    await tx.userLevel.update({
      where: { userId },
      data: {
        currentXP: userLevel.currentXP - reward.xpCost,
      },
    });

    // 2. Decrement stock if applicable
    if (reward.stock !== null) {
      await tx.reward.update({
        where: { id: rewardId },
        data: {
          stock: reward.stock - 1,
        },
      });
    }

    // 3. Create redemption record
    const redemption = await tx.redemption.create({
      data: {
        userId,
        rewardId,
        xpSpent: reward.xpCost,
        status: 'completed',
      },
      include: {
        reward: true,
      },
    });

    // Create an XPRecord reflecting redemption deduction (negative XP)
    await tx.xPRecord.create({
      data: {
        userId,
        action: `redeem_reward_${reward.name.replace(/\s+/g, '_').toLowerCase()}`,
        xpAmount: -reward.xpCost,
        sourceId: reward.id,
      },
    });

    return redemption;
  });
};

/**
 * Returns redemption logs for a user.
 */
export const trackRedemptions = async (userId: string): Promise<any[]> => {
  return prisma.redemption.findMany({
    where: { userId },
    include: {
      reward: true,
    },
    orderBy: { redeemedAt: 'desc' },
  });
};
