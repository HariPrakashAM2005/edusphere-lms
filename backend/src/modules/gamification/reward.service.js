"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackRedemptions = exports.processRedemption = exports.checkEligibility = exports.listRewards = exports.seedDefaultRewards = exports.DEFAULT_REWARDS = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.DEFAULT_REWARDS = [
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
const seedDefaultRewards = async () => {
    for (const rewardDef of exports.DEFAULT_REWARDS) {
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
exports.seedDefaultRewards = seedDefaultRewards;
/**
 * Lists all available rewards.
 */
const listRewards = async () => {
    await (0, exports.seedDefaultRewards)();
    return prisma.reward.findMany({
        where: {
            isActive: true,
        },
        orderBy: { xpCost: 'asc' },
    });
};
exports.listRewards = listRewards;
/**
 * Checks if a user is eligible to redeem a reward.
 */
const checkEligibility = async (userId, rewardId) => {
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
exports.checkEligibility = checkEligibility;
/**
 * Redeems a reward, deducting XP and registering redemption history.
 */
const processRedemption = async (userId, rewardId) => {
    const { eligible, error, reward, userLevel } = await (0, exports.checkEligibility)(userId, rewardId);
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
exports.processRedemption = processRedemption;
/**
 * Returns redemption logs for a user.
 */
const trackRedemptions = async (userId) => {
    return prisma.redemption.findMany({
        where: { userId },
        include: {
            reward: true,
        },
        orderBy: { redeemedAt: 'desc' },
    });
};
exports.trackRedemptions = trackRedemptions;
