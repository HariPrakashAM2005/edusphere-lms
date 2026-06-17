"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const assessment_controller_1 = require("./assessment.controller");
const proctoring_service_1 = require("./proctoring.service");
const router = (0, express_1.Router)();
// --- Student Assessment Routes ---
// Get upcoming/assigned assessments
router.get('/student/assessments/upcoming', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), assessment_controller_1.getStudentUpcoming);
// Get assessment questions (without answers) to take exam
router.get('/student/assessments/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), assessment_controller_1.getAssessmentById);
// Start exam attempt
router.post('/student/assessments/:id/start', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), assessment_controller_1.startAttempt);
// Submit exam attempt answers
router.put('/student/assessments/:attemptId/submit', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), assessment_controller_1.submitAttempt);
// Get results & question analysis
router.get('/student/assessments/:id/result', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), assessment_controller_1.getResults);
// Get results leaderboard rank
router.get('/student/assessments/:id/rank', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), assessment_controller_1.getResultsRank);
// Log proctoring tab switch event
router.post('/student/assessments/:attemptId/proctor/tab-switch', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), async (req, res) => {
    const attemptId = req.params.attemptId;
    const { details } = req.body;
    const log = await (0, proctoring_service_1.logTabSwitch)(attemptId, details);
    res.status(200).json({ logged: !!log });
});
// Log proctoring webcam photo event
router.post('/student/assessments/:attemptId/proctor/snapshot', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), async (req, res) => {
    const attemptId = req.params.attemptId;
    const { snapshot } = req.body; // base64 string
    const log = await (0, proctoring_service_1.captureWebcam)(attemptId, snapshot);
    res.status(200).json({ logged: !!log });
});
// Log proctoring fullscreen exit event
router.post('/student/assessments/:attemptId/proctor/fullscreen-exit', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), async (req, res) => {
    const attemptId = req.params.attemptId;
    const { details } = req.body;
    const log = await (0, proctoring_service_1.logFullscreenExit)(attemptId, details);
    res.status(200).json({ logged: !!log });
});
// --- Faculty / Admin Assessment Routes ---
// Create assessment
router.post('/faculty/assessments', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), assessment_controller_1.createAssessment);
// Get all assessments for a course
router.get('/faculty/assessments/course/:courseId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), assessment_controller_1.getAssessments);
// Get assessment by ID (for faculty review/audit)
router.get('/faculty/assessments/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), assessment_controller_1.getAssessmentById);
// Get assessment analytics
router.get('/faculty/assessments/:id/analytics', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), assessment_controller_1.getAssessmentAnalytics);
// Publish results
router.post('/faculty/assessments/:id/publish', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), assessment_controller_1.publishResults);
// Get attempts list for faculty grading
router.get('/faculty/assessments/:id/attempts', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), assessment_controller_1.getAssessmentAttempts);
// Save manual grades/feedback for student attempt
router.put('/faculty/attempts/:attemptId/grade', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), assessment_controller_1.gradeAttempt);
exports.default = router;
