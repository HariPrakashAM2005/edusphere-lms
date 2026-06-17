"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyReset = exports.weeklyReset = exports.getNearbyRanks = exports.getTopUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Returns top users ranked by score for a given period.
 * Supports filtering by course.
 */
const getTopUsers = async (period, userId, courseId, limit = 100) => {
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
    }
    else {
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
exports.getTopUsers = getTopUsers;
/**
 * Finds user ranks centered around the current user.
 */
const getNearbyRanks = async (userId, period, courseId, surroundingLimit = 2) => {
    const allRankings = await (0, exports.getTopUsers)(period, userId, courseId, 1000);
    const userIndex = allRankings.findIndex(r => r.userId === userId);
    if (userIndex === -1) {
        // User is not in the rankings, return top users instead
        return allRankings.slice(0, 5);
    }
    const start = Math.max(0, userIndex - surroundingLimit);
    const end = Math.min(allRankings.length, userIndex + surroundingLimit + 1);
    return allRankings.slice(start, end);
};
exports.getNearbyRanks = getNearbyRanks;
/**
 * Resets the weekly leaderboards.
 */
const weeklyReset = async () => {
    await prisma.leaderboardEntry.updateMany({
        where: { period: 'weekly' },
        data: {
            score: 0,
        },
    });
    console.log('🧹 Weekly leaderboard reset complete');
};
exports.weeklyReset = weeklyReset;
/**
 * Resets the daily leaderboards.
 */
const dailyReset = async () => {
    await prisma.leaderboardEntry.updateMany({
        where: { period: 'daily' },
        data: {
            score: 0,
        },
    });
    console.log('🧹 Daily leaderboard reset complete');
};
exports.dailyReset = dailyReset;
