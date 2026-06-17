import { PrismaClient } from '@prisma/client';
import { awardXP } from './xp.service';

const prisma = new PrismaClient();

const isYesterday = (dateToCheck: Date | null): boolean => {
  if (!dateToCheck) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const check = new Date(dateToCheck);
  check.setHours(0, 0, 0, 0);

  return check.getTime() === yesterday.getTime();
};

const isToday = (dateToCheck: Date | null): boolean => {
  if (!dateToCheck) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const check = new Date(dateToCheck);
  check.setHours(0, 0, 0, 0);

  return check.getTime() === today.getTime();
};

/**
 * Updates a user's daily login streak.
 */
export const updateLoginStreak = async (userId: string): Promise<any> => {
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
    await awardXP(userId, 'login_streak_milestone', 20); // First login bonus
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
  await checkStreakBonus(userId, 'login', newCurrent);

  return streak;
};

/**
 * Updates assignment submission streaks.
 */
export const updateAssignmentStreak = async (userId: string): Promise<any> => {
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

  await checkStreakBonus(userId, 'assignment', newCurrent);

  return streak;
};

/**
 * Updates attendance streaks.
 */
export const updateAttendanceStreak = async (userId: string): Promise<any> => {
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

  await checkStreakBonus(userId, 'attendance', newCurrent);

  return streak;
};

/**
 * Check and award XP bonuses at milestones.
 */
export const checkStreakBonus = async (
  userId: string,
  type: 'login' | 'assignment' | 'attendance',
  streakCount: number
): Promise<void> => {
  let bonusXP = 0;

  if (type === 'login') {
    if (streakCount === 7) bonusXP = 100;
    else if (streakCount === 30) bonusXP = 500;
    else if (streakCount === 100) bonusXP = 2000;
  } else if (type === 'assignment') {
    if (streakCount === 3) bonusXP = 150;
    else if (streakCount === 5) bonusXP = 350;
  } else if (type === 'attendance') {
    if (streakCount === 5) bonusXP = 50; // Perfect week
    else if (streakCount === 20) bonusXP = 300; // Perfect month
  }

  if (bonusXP > 0) {
    await awardXP(userId, `${type}_streak_bonus_${streakCount}`, bonusXP);
  }
};
