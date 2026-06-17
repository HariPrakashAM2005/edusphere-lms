import { Router } from 'express';
import { authenticateJWT, requireRole } from '../../middleware/auth.middleware';
import {
  chat,
  recommendCourses,
  predictDropout,
  getAtRiskStudents,
  generateQuiz,
  summarizeLesson,
  gradeEssayPrompt,
  suggestLearningPath
} from './ai.controller';

const router = Router();

// Chat bot completions
router.post('/chat', authenticateJWT, chat);

// Personalized course recommendations
router.post('/recommend/courses', authenticateJWT, recommendCourses);

// Summarize lesson content
router.post('/summarize', authenticateJWT, summarizeLesson);

// Student customized learning path
router.get('/learning-path/:studentId', authenticateJWT, suggestLearningPath);

// Predict dropout risk (single student)
router.get('/predict-dropout/:studentId', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), predictDropout);

// Get list of all at-risk predictions
router.get('/at-risk-students', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), getAtRiskStudents);

// Auto-generate quiz from PDF notes
router.post('/generate-quiz', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), generateQuiz);

// AI essay grading
router.post('/grade-essay', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), gradeEssayPrompt);

export default router;
