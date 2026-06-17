"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndAwardBadges = exports.seedDefaultBadges = exports.DEFAULT_BADGES = void 0;
const client_1 = require("@prisma/client");
const xp_service_1 = require("./xp.service");
const prisma = new client_1.PrismaClient();
exports.DEFAULT_BADGES = [
    // Learning Badges
    { name: 'First Steps', description: 'Complete your first lesson.', category: 'learning', icon: '📚', countRequired: 1, action: 'lesson_complete' },
    { name: 'Double Digits', description: 'Complete 10 lessons.', category: 'learning', icon: '📖', countRequired: 10, action: 'lesson_complete' },
    { name: 'Halfway There', description: 'Complete 50 lessons.', category: 'learning', icon: '📝', countRequired: 50, action: 'lesson_complete' },
    { name: 'Century Club', description: 'Complete 100 lessons.', category: 'learning', icon: '🎓', countRequired: 100, action: 'lesson_complete' },
    // Quiz Badges
    { name: 'Quiz Starter', description: 'Pass your first quiz.', category: 'quiz', icon: '⏱️', countRequired: 1, action: 'quiz_pass' },
    { name: 'Decathlon', description: 'Pass 10 quizzes.', category: 'quiz', icon: '🏆', countRequired: 10, action: 'quiz_pass' },
    { name: 'Flawless Victory', description: 'Get a perfect score (100%) on a quiz.', category: 'quiz', icon: '🌟', countRequired: 1, action: 'quiz_perfect' },
    { name: 'Academic Excellence', description: 'Pass 5 quizzes with a score above 90%.', category: 'quiz', icon: '🎖️', countRequired: 5, action: 'quiz_high_score' },
    { name: 'Knowledge Explorer', description: 'Complete quizzes across 3 different courses.', category: 'quiz', icon: '🧠', countRequired: 3, action: 'quiz_different_courses' },
    // Speed Badges
    { name: 'Early Bird', description: 'Submit an exam or assignment 24 hours before the deadline.', category: 'speed', icon: '🌅', countRequired: 1, action: 'submit_early' },
    { name: 'Speed Demon', description: 'Complete a quiz in less than 5 minutes.', category: 'speed', icon: '⚡', countRequired: 1, action: 'submit_fast' },
    // Attendance Badges
    { name: 'Perfect Week', description: '100% attendance for a full week.', category: 'attendance', icon: '📅', countRequired: 1, action: 'perfect_week' },
    { name: 'Perfect Month', description: '100% attendance for a full month.', category: 'attendance', icon: '📆', countRequired: 1, action: 'perfect_month' },
    { name: 'Always Present', description: 'Maintain over 90% attendance record.', category: 'attendance', icon: '🏫', countRequired: 1, action: 'high_attendance' },
    { name: 'Consistent Scholar', description: 'Attend 15 consecutive lectures.', category: 'attendance', icon: '✍️', countRequired: 15, action: 'attendance_streak' },
    // Streak Badges
    { name: 'Streak Starter', description: 'Maintain a 7-day login streak.', category: 'streak', icon: '🔥', countRequired: 7, action: 'login_streak' },
    { name: 'Streak Master', description: 'Maintain a 30-day login streak.', category: 'streak', icon: '💥', countRequired: 30, action: 'login_streak' },
    { name: 'Streak Legend', description: 'Maintain a 100-day login streak.', category: 'streak', icon: '👑', countRequired: 100, action: 'login_streak' },
    { name: 'Unstoppable', description: 'Submit 5 consecutive assignments on time.', category: 'streak', icon: '🚀', countRequired: 5, action: 'assignment_streak' },
    // Social Badges
    { name: 'First Post', description: 'Start your first discussion topic.', category: 'social', icon: '💬', countRequired: 1, action: 'discussion_start' },
    { name: 'Social Butterfly', description: 'Post 10 replies in discussion forums.', category: 'social', icon: '🦋', countRequired: 10, action: 'discussion_reply' },
    // Contribution Badges
    { name: 'Helpful Peer', description: 'Receive 5 upvotes on a discussion post.', category: 'social', icon: '🤝', countRequired: 5, action: 'upvotes_received' },
    { name: 'Community Pillar', description: 'Receive 20 upvotes on discussion posts.', category: 'social', icon: '🏛️', countRequired: 20, action: 'upvotes_received' },
    { name: 'Curator', description: 'Share learning materials in a discussion.', category: 'social', icon: '🎨', countRequired: 1, action: 'share_material' },
    // Special/Level Badges
    { name: 'Early Adopter', description: 'Register in the first week of class.', category: 'special', icon: '🚀', countRequired: 1, action: 'early_registration' },
    { name: 'Level 5 Achiever', description: 'Reach level 5.', category: 'special', icon: '⭐', countRequired: 5, xpRequired: 5 },
    { name: 'Level 10 Achiever', description: 'Reach level 10.', category: 'special', icon: '✨', countRequired: 10, xpRequired: 10 },
    { name: 'Level 25 Achiever', description: 'Reach level 25.', category: 'special', icon: '🔮', countRequired: 25, xpRequired: 25 },
    { name: 'Night Owl', description: 'Complete a lesson or exam between 12 AM and 4 AM.', category: 'special', icon: '🦉', countRequired: 1, action: 'night_study' },
    { name: 'Weekend Warrior', description: 'Complete 3 lessons or quizzes over a single weekend.', category: 'special', icon: '🛡️', countRequired: 3, action: 'weekend_study' }
];
/**
 * Seed default badges in the database if they are not already seeded.
 */
const seedDefaultBadges = async () => {
    for (const badgeDef of exports.DEFAULT_BADGES) {
        const existing = await prisma.badge.findFirst({
            where: { name: badgeDef.name },
        });
        if (!existing) {
            await prisma.badge.create({
                data: {
                    name: badgeDef.name,
                    description: badgeDef.description,
                    category: badgeDef.category,
                    icon: badgeDef.icon,
                    xpRequired: badgeDef.xpRequired || null,
                    action: badgeDef.action || null,
                    countRequired: badgeDef.countRequired,
                },
            });
        }
    }
    console.log('✅ Default badges verified/seeded');
};
exports.seedDefaultBadges = seedDefaultBadges;
/**
 * Checks all badge criteria for a user and awards any newly earned badges.
 * Returns an array of newly awarded Badge records.
 */
const checkAndAwardBadges = async (userId) => {
    const newlyAwarded = [];
    // Ensure default badges are seeded
    await (0, exports.seedDefaultBadges)();
    // 1. Gather stats for badge checks
    const lessonCount = await prisma.xPRecord.count({
        where: { userId, action: 'lesson_complete' },
    });
    const quizAttempts = await prisma.assessmentAttempt.findMany({
        where: { userId, status: 'submitted' },
        include: { assessment: true },
    });
    const quizPassCount = quizAttempts.filter(q => q.isPassed).length;
    const perfectQuizzes = quizAttempts.filter(q => {
        if (q.score === null)
            return false;
        const totalMarks = q.assessment.totalMarks;
        return q.score >= totalMarks || q.percentage === 100;
    }).length;
    const highScores = quizAttempts.filter(q => q.percentage !== null && q.percentage >= 90).length;
    const uniqueQuizCourses = new Set(quizAttempts.map(q => q.assessment.courseId)).size;
    const streak = await prisma.streak.findUnique({
        where: { userId },
    });
    const loginStreak = streak?.currentLoginStreak || 0;
    const assignmentStreak = streak?.currentAssignmentStreak || 0;
    const attendanceStreak = streak?.currentAttendanceStreak || 0;
    const userLevelObj = await prisma.userLevel.findUnique({
        where: { userId },
    });
    const currentLevel = userLevelObj?.level || 1;
    // Let's count some action logs from XPRecord for social / speed features
    const discussionStartCount = await prisma.xPRecord.count({
        where: { userId, action: 'discussion_start' },
    });
    const discussionReplyCount = await prisma.xPRecord.count({
        where: { userId, action: 'discussion_reply' },
    });
    const upvotesReceived = await prisma.xPRecord.count({
        where: { userId, action: 'upvote_received' },
    });
    const earlySubmissions = await prisma.xPRecord.count({
        where: { userId, action: 'submit_early' },
    });
    const fastSubmissions = await prisma.xPRecord.count({
        where: { userId, action: 'submit_fast' },
    });
    const nightStudyCount = await prisma.xPRecord.count({
        where: { userId, action: 'night_study' },
    });
    const weekendStudyCount = await prisma.xPRecord.count({
        where: { userId, action: 'weekend_study' },
    });
    // Fetch badges already earned
    const earnedBadges = await prisma.userBadge.findMany({
        where: { userId },
    });
    const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId));
    // Get all badge definitions from DB
    const badges = await prisma.badge.findMany();
    for (const badge of badges) {
        if (earnedBadgeIds.has(badge.id))
            continue;
        let qualifies = false;
        switch (badge.name) {
            case 'First Steps':
                qualifies = lessonCount >= 1;
                break;
            case 'Double Digits':
                qualifies = lessonCount >= 10;
                break;
            case 'Halfway There':
                qualifies = lessonCount >= 50;
                break;
            case 'Century Club':
                qualifies = lessonCount >= 100;
                break;
            case 'Quiz Starter':
                qualifies = quizPassCount >= 1;
                break;
            case 'Decathlon':
                qualifies = quizPassCount >= 10;
                break;
            case 'Flawless Victory':
                qualifies = perfectQuizzes >= 1;
                break;
            case 'Academic Excellence':
                qualifies = highScores >= 5;
                break;
            case 'Knowledge Explorer':
                qualifies = uniqueQuizCourses >= 3;
                break;
            case 'Streak Starter':
                qualifies = loginStreak >= 7;
                break;
            case 'Streak Master':
                qualifies = loginStreak >= 30;
                break;
            case 'Streak Legend':
                qualifies = loginStreak >= 100;
                break;
            case 'Unstoppable':
                qualifies = assignmentStreak >= 5;
                break;
            case 'First Post':
                qualifies = discussionStartCount >= 1;
                break;
            case 'Social Butterfly':
                qualifies = discussionReplyCount >= 10;
                break;
            case 'Helpful Peer':
                qualifies = upvotesReceived >= 5;
                break;
            case 'Community Pillar':
                qualifies = upvotesReceived >= 20;
                break;
            case 'Early Bird':
                qualifies = earlySubmissions >= 1;
                break;
            case 'Speed Demon':
                qualifies = fastSubmissions >= 1;
                break;
            case 'Consistent Scholar':
                qualifies = attendanceStreak >= 15;
                break;
            case 'Level 5 Achiever':
                qualifies = currentLevel >= 5;
                break;
            case 'Level 10 Achiever':
                qualifies = currentLevel >= 10;
                break;
            case 'Level 25 Achiever':
                qualifies = currentLevel >= 25;
                break;
            case 'Night Owl':
                qualifies = nightStudyCount >= 1;
                break;
            case 'Weekend Warrior':
                qualifies = weekendStudyCount >= 3;
                break;
        }
        if (qualifies) {
            // Award the badge
            await prisma.userBadge.create({
                data: {
                    userId,
                    badgeId: badge.id,
                },
            });
            // Award XP for getting a badge! (+100 XP)
            await (0, xp_service_1.awardXP)(userId, `badge_earned_${badge.name.replace(/\s+/g, '_').toLowerCase()}`, 100, badge.id);
            newlyAwarded.push(badge);
        }
    }
    return newlyAwarded;
};
exports.checkAndAwardBadges = checkAndAwardBadges;
