import { Router, Response } from 'express';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../../middleware/auth.middleware';
import {
  createAssessment,
  getAssessments,
  getStudentUpcoming,
  getAssessmentById,
  startAttempt,
  submitAttempt,
  getResults,
  getResultsRank,
  getAssessmentAnalytics,
  publishResults,
  getAssessmentAttempts,
  gradeAttempt
} from './assessment.controller';
import { logTabSwitch, captureWebcam, logFullscreenExit } from './proctoring.service';

const router = Router();

// --- Student Assessment Routes ---

// Get upcoming/assigned assessments
router.get('/student/assessments/upcoming', authenticateJWT, requireRole(['STUDENT']), getStudentUpcoming);

// Get assessment questions (without answers) to take exam
router.get('/student/assessments/:id', authenticateJWT, requireRole(['STUDENT']), getAssessmentById);

// Start exam attempt
router.post('/student/assessments/:id/start', authenticateJWT, requireRole(['STUDENT']), startAttempt);

// Submit exam attempt answers
router.put('/student/assessments/:attemptId/submit', authenticateJWT, requireRole(['STUDENT']), submitAttempt);

// Get results & question analysis
router.get('/student/assessments/:id/result', authenticateJWT, requireRole(['STUDENT']), getResults);

// Get results leaderboard rank
router.get('/student/assessments/:id/rank', authenticateJWT, requireRole(['STUDENT']), getResultsRank);

// Log proctoring tab switch event
router.post('/student/assessments/:attemptId/proctor/tab-switch', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response) => {
  const attemptId = req.params.attemptId as string;
  const { details } = req.body;
  const log = await logTabSwitch(attemptId, details);
  res.status(200).json({ logged: !!log });
});

// Log proctoring webcam photo event
router.post('/student/assessments/:attemptId/proctor/snapshot', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response) => {
  const attemptId = req.params.attemptId as string;
  const { snapshot } = req.body; // base64 string
  const log = await captureWebcam(attemptId, snapshot);
  res.status(200).json({ logged: !!log });
});

// Log proctoring fullscreen exit event
router.post('/student/assessments/:attemptId/proctor/fullscreen-exit', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response) => {
  const attemptId = req.params.attemptId as string;
  const { details } = req.body;
  const log = await logFullscreenExit(attemptId, details);
  res.status(200).json({ logged: !!log });
});


// --- Faculty / Admin Assessment Routes ---

// Create assessment
router.post('/faculty/assessments', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), createAssessment);

// Get all assessments for a course
router.get('/faculty/assessments/course/:courseId', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), getAssessments);

// Get assessment by ID (for faculty review/audit)
router.get('/faculty/assessments/:id', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), getAssessmentById);

// Get assessment analytics
router.get('/faculty/assessments/:id/analytics', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), getAssessmentAnalytics);

// Publish results
router.post('/faculty/assessments/:id/publish', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), publishResults);

// Get attempts list for faculty grading
router.get('/faculty/assessments/:id/attempts', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), getAssessmentAttempts);

// Save manual grades/feedback for student attempt
router.put('/faculty/attempts/:attemptId/grade', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), gradeAttempt);

export default router;
