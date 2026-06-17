import { Router } from 'express';
import { authenticateJWT } from '../../middleware/auth.middleware';
import {
  getStudentStats,
  getLearningProgress,
  getEnrolledCourses,
  getCourseDetails,
  completeLesson,
  getUpcomingDeadlines
} from './dashboard.controller';
import {
  getLeaderboard,
  getBadges,
  claimStreak
} from './gamification.controller';

const router = Router();

// Stats, Progress & Courses
router.get('/student/stats', authenticateJWT, getStudentStats);
router.get('/student/progress', authenticateJWT, getLearningProgress);
router.get('/student/courses', authenticateJWT, getEnrolledCourses);
router.get('/student/courses/:courseId', authenticateJWT, getCourseDetails);
router.post('/student/lessons/:lessonId/complete', authenticateJWT, completeLesson);
router.get('/student/upcoming', authenticateJWT, getUpcomingDeadlines);

// Gamification
router.get('/student/xp/leaderboard', authenticateJWT, getLeaderboard);
router.get('/student/badges', authenticateJWT, getBadges);
router.post('/student/claim-streak', authenticateJWT, claimStreak);

export default router;
