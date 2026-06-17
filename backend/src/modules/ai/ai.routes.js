"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const ai_controller_1 = require("./ai.controller");
const router = (0, express_1.Router)();
// Chat bot completions
router.post('/chat', auth_middleware_1.authenticateJWT, ai_controller_1.chat);
// Personalized course recommendations
router.post('/recommend/courses', auth_middleware_1.authenticateJWT, ai_controller_1.recommendCourses);
// Summarize lesson content
router.post('/summarize', auth_middleware_1.authenticateJWT, ai_controller_1.summarizeLesson);
// Student customized learning path
router.get('/learning-path/:studentId', auth_middleware_1.authenticateJWT, ai_controller_1.suggestLearningPath);
// Predict dropout risk (single student)
router.get('/predict-dropout/:studentId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), ai_controller_1.predictDropout);
// Get list of all at-risk predictions
router.get('/at-risk-students', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), ai_controller_1.getAtRiskStudents);
// Auto-generate quiz from PDF notes
router.post('/generate-quiz', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), ai_controller_1.generateQuiz);
// AI essay grading
router.post('/grade-essay', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), ai_controller_1.gradeEssayPrompt);
exports.default = router;
