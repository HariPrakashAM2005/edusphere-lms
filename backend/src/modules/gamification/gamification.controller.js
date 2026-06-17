"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreak = exports.getAchievements = exports.redeemReward = exports.getRewards = exports.updateStreak = exports.getLeaderboard = exports.awardBadge = exports.getBadges = exports.awardXP = exports.getUserXP = void 0;
const client_1 = require("@prisma/client");
const xp_service_1 = require("./xp.service");
const badge_service_1 = require("./badge.service");
const streak_service_1 = require("./streak.service");
const leaderboard_service_1 = require("./leaderboard.service");
const reward_service_1 = require("./reward.service");
const prisma = new client_1.PrismaClient();
/**
 * Get user's XP, level, and progress to the next level.
 */
const getUserXP = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const userId = req.user.id;
    try {
        let userLevel = await prisma.userLevel.findUnique({
            where: { userId },
        });
        if (!userLevel) {
            userLevel = await prisma.userLevel.create({
                data: {
                    userId,
                    currentXP: 0,
                    level: 1,
                    totalXP: 0,
                },
            });
        }
        const currentLevel = userLevel.level;
        const totalXP = userLevel.totalXP;
        const levelStartXP = (0, xp_service_1.getXPForLevel)(currentLevel);
        const nextLevelStartXP = (0, xp_service_1.getXPForLevel)(currentLevel + 1);
        const xpNeededForNextLevel = nextLevelStartXP - levelStartXP;
        const userXPInLevel = totalXP - levelStartXP;
        const progressPercentage = Math.min(100, Math.max(0, Math.floor((userXPInLevel / xpNeededForNextLevel) * 100)));
        // Fetch recent XP history (last 10 records)
        const recentGains = await prisma.xPRecord.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        res.status(200).json({
            level: currentLevel,
            currentXP: userXPInLevel >= 0 ? userXPInLevel : 0,
            totalXP,
            xpNeededForNextLevel,
            progressPercentage,
            recentGains,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve XP stats', details: error.message });
    }
};
exports.getUserXP = getUserXP;
/**
 * Manually or programmatically award XP for actions.
 */
const awardXP = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const { action, baseAmount, sourceId, multiplier } = req.body;
    if (!action || typeof baseAmount !== 'number') {
        res.status(400).json({ error: 'Action type and baseAmount (number) are required.' });
        return;
    }
    try {
        const xpResult = await (0, xp_service_1.awardXP)(req.user.id, action, baseAmount, sourceId || undefined, multiplier || 1.0);
        // Run badge check
        const newlyAwardedBadges = await (0, badge_service_1.checkAndAwardBadges)(req.user.id);
        res.status(200).json({
            ...xpResult,
            newBadges: newlyAwardedBadges,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to award XP', details: error.message });
    }
};
exports.awardXP = awardXP;
/**
 * Get all badges and user's earned badges.
 */
const getBadges = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const userId = req.user.id;
    try {
        await (0, badge_service_1.seedDefaultBadges)();
        const allBadges = await prisma.badge.findMany();
        const userBadges = await prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
        });
        const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
        res.status(200).json({
            allBadges,
            earnedBadges: userBadges.map(ub => ({
                ...ub.badge,
                earnedAt: ub.earnedAt,
            })),
            earnedBadgeIds,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch badges', details: error.message });
    }
};
exports.getBadges = getBadges;
/**
 * Check badge criteria and award if eligible.
 */
const awardBadge = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const newlyAwarded = await (0, badge_service_1.checkAndAwardBadges)(req.user.id);
        res.status(200).json({ newlyAwarded });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process badge checks', details: error.message });
    }
};
exports.awardBadge = awardBadge;
/**
 * Get leaderboard rankings.
 */
const getLeaderboard = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const period = req.query.period || 'weekly';
    const courseId = req.query.courseId;
    try {
        const topUsers = await (0, leaderboard_service_1.getTopUsers)(period, req.user.id, courseId || undefined, 100);
        const nearbyRanks = await (0, leaderboard_service_1.getNearbyRanks)(req.user.id, period, courseId || undefined, 2);
        res.status(200).json({
            period,
            courseId: courseId || null,
            topUsers,
            nearbyRanks,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve leaderboard', details: error.message });
    }
};
exports.getLeaderboard = getLeaderboard;
/**
 * Update active streak (login, assignment, attendance).
 */
const updateStreak = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const { type } = req.body; // 'login' | 'assignment' | 'attendance'
    if (!type || !['login', 'assignment', 'attendance'].includes(type)) {
        res.status(400).json({ error: "Invalid type. Must be 'login', 'assignment', or 'attendance'" });
        return;
    }
    try {
        let streakResult;
        if (type === 'login') {
            streakResult = await (0, streak_service_1.updateLoginStreak)(req.user.id);
        }
        else if (type === 'assignment') {
            streakResult = await (0, streak_service_1.updateAssignmentStreak)(req.user.id);
        }
        else {
            streakResult = await (0, streak_service_1.updateAttendanceStreak)(req.user.id);
        }
        const newlyAwardedBadges = await (0, badge_service_1.checkAndAwardBadges)(req.user.id);
        res.status(200).json({
            streak: streakResult,
            newBadges: newlyAwardedBadges,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update streak', details: error.message });
    }
};
exports.updateStreak = updateStreak;
/**
 * Lists all active rewards in store + redemption history.
 */
const getRewards = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const rewards = await (0, reward_service_1.listRewards)();
        const history = await (0, reward_service_1.trackRedemptions)(req.user.id);
        // Fetch user level balance
        const userLevel = await prisma.userLevel.findUnique({
            where: { userId: req.user.id },
        });
        res.status(200).json({
            rewards,
            history,
            xpBalance: userLevel?.currentXP || 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve rewards', details: error.message });
    }
};
exports.getRewards = getRewards;
/**
 * Redeem XP for a store reward.
 */
const redeemReward = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const rewardId = req.params.id;
    if (!rewardId) {
        res.status(400).json({ error: 'Reward ID is required' });
        return;
    }
    try {
        const redemption = await (0, reward_service_1.processRedemption)(req.user.id, rewardId);
        res.status(200).json({
            message: 'Reward successfully redeemed!',
            redemption,
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.redeemReward = redeemReward;
/**
 * Get achievements progress (daily quests + aggregate badges).
 */
const getAchievements = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
        // Automatically check and update login streak on accessing dashboard
        await (0, streak_service_1.updateLoginStreak)(userId).catch(err => console.warn('Streak update failed:', err));
        // 1. Fetch daily quests for today
        const quests = await prisma.dailyQuest.findMany({
            where: {
                activeDate: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
            },
        });
        // Seed quests if none exist for today
        if (quests.length === 0) {
            const defaultQuests = [
                { title: 'Daily Login', description: 'Log into EduSphere today.', action: 'login', targetCount: 1, xpReward: 50 },
                { title: 'Study Session', description: 'Complete a course lesson.', action: 'lesson_complete', targetCount: 1, xpReward: 100 },
                { title: 'Knowledge Checker', description: 'Pass a course quiz.', action: 'quiz_pass', targetCount: 1, xpReward: 150 }
            ];
            for (const dq of defaultQuests) {
                await prisma.dailyQuest.create({
                    data: {
                        title: dq.title,
                        description: dq.description,
                        action: dq.action,
                        targetCount: dq.targetCount,
                        xpReward: dq.xpReward,
                        activeDate: today,
                    },
                }).catch(() => { });
            }
        }
        const todayQuests = await prisma.dailyQuest.findMany({
            where: {
                activeDate: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
            },
            include: {
                userQuestProgress: {
                    where: { userId },
                },
            },
        });
        const questsData = todayQuests.map(q => {
            const progress = q.userQuestProgress[0];
            return {
                id: q.id,
                title: q.title,
                description: q.description,
                action: q.action,
                targetCount: q.targetCount,
                xpReward: q.xpReward,
                progress: progress?.progress || 0,
                completed: progress?.completed || false,
            };
        });
        // 2. Fetch badges stats
        const totalBadges = await prisma.badge.count();
        const earnedBadgesCount = await prisma.userBadge.count({
            where: { userId },
        });
        // 3. Fetch login streaks
        const streak = await prisma.streak.findUnique({
            where: { userId },
        });
        res.status(200).json({
            dailyQuests: questsData,
            badgesEarned: earnedBadgesCount,
            totalBadges,
            badgeCompletionPercentage: totalBadges > 0 ? Math.floor((earnedBadgesCount / totalBadges) * 100) : 0,
            streak: {
                login: streak?.currentLoginStreak || 0,
                longestLogin: streak?.longestLoginStreak || 0,
                assignment: streak?.currentAssignmentStreak || 0,
                attendance: streak?.currentAttendanceStreak || 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch achievements', details: error.message });
    }
};
exports.getAchievements = getAchievements;
/**
 * Get user's current streak stats.
 */
const getStreak = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const streak = await prisma.streak.findUnique({
            where: { userId: req.user.id },
        });
        res.status(200).json(streak || {
            currentLoginStreak: 0,
            longestLoginStreak: 0,
            currentAssignmentStreak: 0,
            longestAssignmentStreak: 0,
            currentAttendanceStreak: 0,
            longestAttendanceStreak: 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve streak details', details: error.message });
    }
};
exports.getStreak = getStreak;
