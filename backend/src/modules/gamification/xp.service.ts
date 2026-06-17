import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Level formula: total XP required to reach a level
// Level 1: 0 XP
// Level 2: 100 XP
// Level 3: 282 XP
// Level 4: 519 XP, etc.
export const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
};

export const getLevelFromXP = (totalXP: number): number => {
  let level = 1;
  while (totalXP >= getXPForLevel(level + 1)) {
    level++;
  }
  return level;
};

export interface XPAwardResult {
  xpAwarded: number;
  newTotalXP: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

/**
 * Award XP to a user, checking for level-up thresholds and daily quests.
 */
export const awardXP = async (
  userId: string,
  action: string,
  baseAmount: number,
  sourceId?: string,
  multiplier = 1.0
): Promise<XPAwardResult> => {
  const finalXP = Math.floor(baseAmount * multiplier);

  // Use transaction to ensure consistency
  return await prisma.$transaction(async (tx) => {
    // 1. Log the XP record
    await tx.xPRecord.create({
      data: {
        userId,
        action,
        xpAmount: finalXP,
        sourceId,
        multiplier,
      },
    });

    // 2. Get or create the UserLevel
    let userLevel = await tx.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) {
      userLevel = await tx.userLevel.create({
        data: {
          userId,
          currentXP: 0,
          level: 1,
          totalXP: 0,
        },
      });
    }

    const oldLevel = userLevel.level;
    const newTotalXP = userLevel.totalXP + finalXP;
    const newLevel = getLevelFromXP(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    // Remaining XP in current level
    const xpNeededForNewLevelStart = getXPForLevel(newLevel);
    const currentXP = newTotalXP - xpNeededForNewLevelStart;

    // 3. Update UserLevel
    await tx.userLevel.update({
      where: { userId },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
        currentXP: currentXP >= 0 ? currentXP : 0,
      },
    });

    // 4. Update Leaderboard score
    await updateLeaderboardScore(tx, userId, finalXP);

    // 5. Update quest progress if applicable
    await updateQuestProgress(tx, userId, action);

    return {
      xpAwarded: finalXP,
      newTotalXP,
      oldLevel,
      newLevel,
      leveledUp,
    };
  });
};

/**
 * Helper to update/create LeaderboardEntry for the user for daily, weekly, monthly, and all_time periods.
 */
const updateLeaderboardScore = async (tx: any, userId: string, xpAmount: number) => {
  const periods = ['daily', 'weekly', 'all_time'];

  for (const period of periods) {
    const entry = await tx.leaderboardEntry.findUnique({
      where: {
        userId_period: { userId, period },
      },
    });

    if (entry) {
      await tx.leaderboardEntry.update({
        where: { id: entry.id },
        data: {
          score: entry.score + xpAmount,
        },
      });
    } else {
      await tx.leaderboardEntry.create({
        data: {
          userId,
          period,
          score: xpAmount,
        },
      });
    }
  }
};

/**
 * Helper to update daily quest progress.
 */
const updateQuestProgress = async (tx: any, userId: string, action: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find daily quests for today that match this action
  const quest = await tx.dailyQuest.findFirst({
    where: {
      activeDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      action,
    },
  });

  if (!quest) return;

  // Find or create progress
  const progress = await tx.userQuestProgress.findUnique({
    where: {
      userId_questId: { userId, questId: quest.id },
    },
  });

  if (progress) {
    if (progress.completed) return; // already done

    const newCount = progress.progress + 1;
    const completed = newCount >= quest.targetCount;

    await tx.userQuestProgress.update({
      where: { id: progress.id },
      data: {
        progress: newCount,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    // Award bonus XP if completed!
    if (completed) {
      await tx.xPRecord.create({
        data: {
          userId,
          action: `quest_complete_${quest.action}`,
          xpAmount: quest.xpReward,
          sourceId: quest.id,
        },
      });

      const userLevelObj = await tx.userLevel.findUnique({ where: { userId } });
      if (userLevelObj) {
        const questTotalXP = userLevelObj.totalXP + quest.xpReward;
        const questNewLevel = getLevelFromXP(questTotalXP);
        const questNewLevelStart = getXPForLevel(questNewLevel);
        const questCurrentXP = questTotalXP - questNewLevelStart;

        await tx.userLevel.update({
          where: { userId },
          data: {
            totalXP: questTotalXP,
            level: questNewLevel,
            currentXP: questCurrentXP >= 0 ? questCurrentXP : 0,
          },
        });

        // Also update leaderboard score
        for (const period of ['daily', 'weekly', 'all_time']) {
          await tx.leaderboardEntry.updateMany({
            where: { userId, period },
            data: { score: { increment: quest.xpReward } },
          });
        }
      }
    }
  } else {
    const completed = 1 >= quest.targetCount;
    await tx.userQuestProgress.create({
      data: {
        userId,
        questId: quest.id,
        progress: 1,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    if (completed) {
      await tx.xPRecord.create({
        data: {
          userId,
          action: `quest_complete_${quest.action}`,
          xpAmount: quest.xpReward,
          sourceId: quest.id,
        },
      });

      const userLevelObj = await tx.userLevel.findUnique({ where: { userId } });
      if (userLevelObj) {
        const questTotalXP = userLevelObj.totalXP + quest.xpReward;
        const questNewLevel = getLevelFromXP(questTotalXP);
        const questNewLevelStart = getXPForLevel(questNewLevel);
        const questCurrentXP = questTotalXP - questNewLevelStart;

        await tx.userLevel.update({
          where: { userId },
          data: {
            totalXP: questTotalXP,
            level: questNewLevel,
            currentXP: questCurrentXP >= 0 ? questCurrentXP : 0,
          },
        });

        // Also update leaderboard score
        for (const period of ['daily', 'weekly', 'all_time']) {
          await tx.leaderboardEntry.updateMany({
            where: { userId, period },
            data: { score: { increment: quest.xpReward } },
          });
        }
      }
    }
  }
};
