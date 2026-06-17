"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const dashboard_controller_1 = require("./dashboard.controller");
const gamification_controller_1 = require("./gamification.controller");
const router = (0, express_1.Router)();
// Stats, Progress & Courses
router.get('/student/stats', auth_middleware_1.authenticateJWT, dashboard_controller_1.getStudentStats);
router.get('/student/progress', auth_middleware_1.authenticateJWT, dashboard_controller_1.getLearningProgress);
router.get('/student/courses', auth_middleware_1.authenticateJWT, dashboard_controller_1.getEnrolledCourses);
router.get('/student/courses/:courseId', auth_middleware_1.authenticateJWT, dashboard_controller_1.getCourseDetails);
router.post('/student/lessons/:lessonId/complete', auth_middleware_1.authenticateJWT, dashboard_controller_1.completeLesson);
router.get('/student/upcoming', auth_middleware_1.authenticateJWT, dashboard_controller_1.getUpcomingDeadlines);
// Gamification
router.get('/student/xp/leaderboard', auth_middleware_1.authenticateJWT, gamification_controller_1.getLeaderboard);
router.get('/student/badges', auth_middleware_1.authenticateJWT, gamification_controller_1.getBadges);
router.post('/student/claim-streak', auth_middleware_1.authenticateJWT, gamification_controller_1.claimStreak);
exports.default = router;
