"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hybridRecommendation = exports.getTrendingCourses = exports.contentBasedFiltering = exports.collaborativeFiltering = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Mock database fallback recommendation templates (keeps analytics view loaded if DB contains few courses)
const MOCK_RECOMMENDATION_TEMPLATES = [
    { courseId: 'mock-course-alg', title: 'Design and Analysis of Algorithms', description: 'Master sorting, searching, graph traversal, and divide-and-conquer strategy metrics.', baseScore: 92, reason: 'Because you showed progress in Computer Science' },
    { courseId: 'mock-course-db', title: 'Database Systems & SQL Optimization', description: 'Understand SQL normalization, query parsing, index configurations, and scaling DB transaction architectures.', baseScore: 85, reason: 'Recommended based on similar student preferences' },
    { courseId: 'mock-course-web', title: 'Fullstack Next.js and Server Architectures', description: 'Build high-performance web apps utilizing React Server Components, SSR, and Tailwind.', baseScore: 78, reason: 'Matches your interest in programming languages' }
];
// 1. Collaborative Filtering Mock/Actual logic (looks up peer enrollment overlaps)
const collaborativeFiltering = async (userId) => {
    const scores = {};
    try {
        // Get target user's active enrollments
        const myEnrollments = await prisma.enrollment.findMany({
            where: { userId, isActive: true },
            select: { courseId: true }
        });
        const myCourseIds = myEnrollments.map(e => e.courseId);
        if (myCourseIds.length === 0)
            return {};
        // Find other users enrolled in any of those courses
        const peerEnrollments = await prisma.enrollment.findMany({
            where: {
                courseId: { in: myCourseIds },
                userId: { not: userId }
            },
            select: { userId: true }
        });
        const peerUserIds = Array.from(new Set(peerEnrollments.map(e => e.userId)));
        if (peerUserIds.length === 0)
            return {};
        // Get courses that these peer users are enrolled in (which target user is not enrolled in)
        const peerRecommendations = await prisma.enrollment.findMany({
            where: {
                userId: { in: peerUserIds },
                courseId: { notIn: myCourseIds }
            },
            select: { courseId: true }
        });
        // Count course frequencies
        peerRecommendations.forEach(rec => {
            scores[rec.courseId] = (scores[rec.courseId] || 0) + 1;
        });
        // Normalize frequencies into 0-100 index range
        const maxFreq = Math.max(...Object.values(scores), 1);
        Object.keys(scores).forEach(courseId => {
            scores[courseId] = Math.round((scores[courseId] / maxFreq) * 50); // weight out of 50
        });
        return scores;
    }
    catch (err) {
        return {};
    }
};
exports.collaborativeFiltering = collaborativeFiltering;
// 2. Content-Based Filtering (computes similarity against keywords in title/description)
const contentBasedFiltering = async (userId) => {
    const scores = {};
    try {
        const myEnrollments = await prisma.enrollment.findMany({
            where: { userId, isActive: true },
            include: { course: true }
        });
        if (myEnrollments.length === 0)
            return {};
        const completedKeywords = myEnrollments.map(e => e.course.title.toLowerCase().split(' ')).flat();
        const myCourseIds = myEnrollments.map(e => e.courseId);
        // Get all other courses
        const otherCourses = await prisma.course.findMany({
            where: {
                id: { notIn: myCourseIds }
            }
        });
        otherCourses.forEach(course => {
            let matchCount = 0;
            const titleWords = course.title.toLowerCase().split(' ');
            titleWords.forEach(word => {
                if (completedKeywords.includes(word) && word.length > 3) {
                    matchCount++;
                }
            });
            if (matchCount > 0) {
                const matchingCourse = myEnrollments.find(e => e.course.title.toLowerCase().split(' ').some(w => titleWords.includes(w) && w.length > 3));
                scores[course.id] = {
                    score: Math.min(matchCount * 25, 50), // weight out of 50
                    reason: matchingCourse ? `Because you completed "${matchingCourse.course.title}"` : 'Matches your catalog interest keywords'
                };
            }
        });
        return scores;
    }
    catch (err) {
        return {};
    }
};
exports.contentBasedFiltering = contentBasedFiltering;
// 3. Trending Courses index (enrollment count weights)
const getTrendingCourses = async (excludeIds = []) => {
    try {
        const enrollmentsCount = await prisma.enrollment.groupBy({
            by: ['courseId'],
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 3
        });
        const trendingCourseIds = enrollmentsCount.map(e => e.courseId).filter(id => !excludeIds.includes(id));
        const courses = await prisma.course.findMany({
            where: { id: { in: trendingCourseIds } }
        });
        return courses.map(c => {
            const stats = enrollmentsCount.find(e => e.courseId === c.id);
            const studentCount = stats?._count?.userId || 0;
            return {
                courseId: c.id,
                title: c.title,
                description: c.description,
                score: 75,
                reason: `Trending course with ${studentCount} active students`
            };
        });
    }
    catch (err) {
        return [];
    }
};
exports.getTrendingCourses = getTrendingCourses;
// 4. Hybrid Recommendation orchestrator
const hybridRecommendation = async (userId) => {
    try {
        // Get peer collaborative overlaps
        const colScores = await (0, exports.collaborativeFiltering)(userId);
        // Get keyword contents matches
        const cbScores = await (0, exports.contentBasedFiltering)(userId);
        const mergedScores = {};
        // Fetch user enrolled course IDs
        const myEnrollments = await prisma.enrollment.findMany({
            where: { userId },
            select: { courseId: true }
        });
        const myCourseIds = myEnrollments.map(e => e.courseId);
        // Sum scores
        Object.keys(colScores).forEach(id => {
            mergedScores[id] = {
                score: colScores[id],
                reason: 'Recommended based on peer matching profiles'
            };
        });
        Object.keys(cbScores).forEach(id => {
            const current = mergedScores[id] ? mergedScores[id].score : 0;
            mergedScores[id] = {
                score: current + cbScores[id].score,
                reason: cbScores[id].reason
            };
        });
        const recommendedIds = Object.keys(mergedScores).filter(id => !myCourseIds.includes(id));
        let finalRecs = [];
        if (recommendedIds.length > 0) {
            const courses = await prisma.course.findMany({
                where: { id: { in: recommendedIds } }
            });
            finalRecs = courses.map(c => ({
                courseId: c.id,
                title: c.title,
                description: c.description,
                score: Math.min(mergedScores[c.id].score + 40, 99), // add base score
                reason: mergedScores[c.id].reason
            }));
        }
        // Add trending courses as fillers if total recs are low
        const trending = await (0, exports.getTrendingCourses)([...myCourseIds, ...recommendedIds]);
        finalRecs = [...finalRecs, ...trending];
        // Seed mock templates if final is still empty (ensures UI shows beautiful details out-of-the-box)
        if (finalRecs.length === 0) {
            return MOCK_RECOMMENDATION_TEMPLATES.map(t => ({
                courseId: t.courseId,
                title: t.title,
                description: t.description,
                score: t.baseScore,
                reason: t.reason
            }));
        }
        // Sort by relevance score
        return finalRecs.sort((a, b) => b.score - a.score);
    }
    catch (err) {
        console.error('Failed to run hybrid recommender', err.message);
        return MOCK_RECOMMENDATION_TEMPLATES.map(t => ({
            courseId: t.courseId,
            title: t.title,
            description: t.description,
            score: t.baseScore,
            reason: t.reason
        }));
    }
};
exports.hybridRecommendation = hybridRecommendation;
