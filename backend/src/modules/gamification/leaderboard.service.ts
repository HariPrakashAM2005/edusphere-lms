import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LeaderboardUser {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  score: number;
  level: number;
  isCurrentUser: boolean;
}

/**
 * Returns top users ranked by score for a given period.
 * Supports filtering by course.
 */
export const getTopUsers = async (
  period: string,
  userId?: string,
  courseId?: string,
  limit = 100
): Promise<LeaderboardUser[]> => {
  // If courseId is provided, we want to rank based on enrollments in that course
  let entries;
  if (courseId) {
    // Fetch users enrolled in this course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, isActive: true },
      select: { userId: true },
    });
    const userIds = enrollments.map(e => e.userId);

    entries = await prisma.leaderboardEntry.findMany({
      where: {
        period,
        userId: { in: userIds },
      },
      orderBy: { score: 'desc' },
      include: {
        user: {
          include: {
            userLevel: true,
          },
        },
      },
      take: limit,
    });
  } else {
    entries = await prisma.leaderboardEntry.findMany({
      where: { period },
      orderBy: { score: 'desc' },
      include: {
        user: {
          include: {
            userLevel: true,
          },
        },
      },
      take: limit,
    });
  }

  // Map into LeaderboardUser format with ranks
  return entries.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    firstName: entry.user.firstName,
    lastName: entry.user.lastName,
    score: entry.score,
    level: entry.user.userLevel?.level || 1,
    isCurrentUser: entry.userId === userId,
  }));
};

/**
 * Finds user ranks centered around the current user.
 */
export const getNearbyRanks = async (
  userId: string,
  period: string,
  courseId?: string,
  surroundingLimit = 2
): Promise<LeaderboardUser[]> => {
  const allRankings = await getTopUsers(period, userId, courseId, 1000);
  const userIndex = allRankings.findIndex(r => r.userId === userId);

  if (userIndex === -1) {
    // User is not in the rankings, return top users instead
    return allRankings.slice(0, 5);
  }

  const start = Math.max(0, userIndex - surroundingLimit);
  const end = Math.min(allRankings.length, userIndex + surroundingLimit + 1);

  return allRankings.slice(start, end);
};

/**
 * Resets the weekly leaderboards.
 */
export const weeklyReset = async (): Promise<void> => {
  await prisma.leaderboardEntry.updateMany({
    where: { period: 'weekly' },
    data: {
      score: 0,
    },
  });
  console.log('🧹 Weekly leaderboard reset complete');
};

/**
 * Resets the daily leaderboards.
 */
export const dailyReset = async (): Promise<void> => {
  await prisma.leaderboardEntry.updateMany({
    where: { period: 'daily' },
    data: {
      score: 0,
    },
  });
  console.log('🧹 Daily leaderboard reset complete');
};
