"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStreakBonus = exports.updateAttendanceStreak = exports.updateAssignmentStreak = exports.updateLoginStreak = void 0;
const client_1 = require("@prisma/client");
const xp_service_1 = require("./xp.service");
const prisma = new client_1.PrismaClient();
const isYesterday = (dateToCheck) => {
    if (!dateToCheck)
        return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const check = new Date(dateToCheck);
    check.setHours(0, 0, 0, 0);
    return check.getTime() === yesterday.getTime();
};
const isToday = (dateToCheck) => {
    if (!dateToCheck)
        return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(dateToCheck);
    check.setHours(0, 0, 0, 0);
    return check.getTime() === today.getTime();
};
/**
 * Updates a user's daily login streak.
 */
const updateLoginStreak = async (userId) => {
    let streak = await prisma.streak.findUnique({
        where: { userId },
    });
    const now = new Date();
    if (!streak) {
        streak = await prisma.streak.create({
            data: {
                userId,
                currentLoginStreak: 1,
                longestLoginStreak: 1,
                lastLoginDate: now,
            },
        });
        await (0, xp_service_1.awardXP)(userId, 'login_streak_milestone', 20); // First login bonus
        return streak;
    }
    // Already logged in today
    if (isToday(streak.lastLoginDate)) {
        return streak;
    }
    let newCurrent = 1;
    if (isYesterday(streak.lastLoginDate)) {
        newCurrent = streak.currentLoginStreak + 1;
    }
    const newLongest = Math.max(streak.longestLoginStreak, newCurrent);
    streak = await prisma.streak.update({
        where: { userId },
        data: {
            currentLoginStreak: newCurrent,
            longestLoginStreak: newLongest,
            lastLoginDate: now,
        },
    });
    // Check login streak bonus
    await (0, exports.checkStreakBonus)(userId, 'login', newCurrent);
    return streak;
};
exports.updateLoginStreak = updateLoginStreak;
/**
 * Updates assignment submission streaks.
 */
const updateAssignmentStreak = async (userId) => {
    let streak = await prisma.streak.findUnique({
        where: { userId },
    });
    const now = new Date();
    if (!streak) {
        streak = await prisma.streak.create({
            data: {
                userId,
                currentAssignmentStreak: 1,
                longestAssignmentStreak: 1,
                lastAssignmentDate: now,
            },
        });
        return streak;
    }
    const newCurrent = streak.currentAssignmentStreak + 1;
    const newLongest = Math.max(streak.longestAssignmentStreak, newCurrent);
    streak = await prisma.streak.update({
        where: { userId },
        data: {
            currentAssignmentStreak: newCurrent,
            longestAssignmentStreak: newLongest,
            lastAssignmentDate: now,
        },
    });
    await (0, exports.checkStreakBonus)(userId, 'assignment', newCurrent);
    return streak;
};
exports.updateAssignmentStreak = updateAssignmentStreak;
/**
 * Updates attendance streaks.
 */
const updateAttendanceStreak = async (userId) => {
    let streak = await prisma.streak.findUnique({
        where: { userId },
    });
    const now = new Date();
    if (!streak) {
        streak = await prisma.streak.create({
            data: {
                userId,
                currentAttendanceStreak: 1,
                longestAttendanceStreak: 1,
                lastAttendanceDate: now,
            },
        });
        return streak;
    }
    // Attendance streak updates daily
    if (isToday(streak.lastAttendanceDate)) {
        return streak;
    }
    let newCurrent = 1;
    if (isYesterday(streak.lastAttendanceDate)) {
        newCurrent = streak.currentAttendanceStreak + 1;
    }
    const newLongest = Math.max(streak.longestAttendanceStreak, newCurrent);
    streak = await prisma.streak.update({
        where: { userId },
        data: {
            currentAttendanceStreak: newCurrent,
            longestAttendanceStreak: newLongest,
            lastAttendanceDate: now,
        },
    });
    await (0, exports.checkStreakBonus)(userId, 'attendance', newCurrent);
    return streak;
};
exports.updateAttendanceStreak = updateAttendanceStreak;
/**
 * Check and award XP bonuses at milestones.
 */
const checkStreakBonus = async (userId, type, streakCount) => {
    let bonusXP = 0;
    if (type === 'login') {
        if (streakCount === 7)
            bonusXP = 100;
        else if (streakCount === 30)
            bonusXP = 500;
        else if (streakCount === 100)
            bonusXP = 2000;
    }
    else if (type === 'assignment') {
        if (streakCount === 3)
            bonusXP = 150;
        else if (streakCount === 5)
            bonusXP = 350;
    }
    else if (type === 'attendance') {
        if (streakCount === 5)
            bonusXP = 50; // Perfect week
        else if (streakCount === 20)
            bonusXP = 300; // Perfect month
    }
    if (bonusXP > 0) {
        await (0, xp_service_1.awardXP)(userId, `${type}_streak_bonus_${streakCount}`, bonusXP);
    }
};
exports.checkStreakBonus = checkStreakBonus;
