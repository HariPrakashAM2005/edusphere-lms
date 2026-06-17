"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const certificate_controller_1 = require("./certificate.controller");
const router = (0, express_1.Router)();
// Student routes
router.get('/student/certificates', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), certificate_controller_1.getStudentCertificates);
router.post('/student/certificates/:courseId/generate', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), certificate_controller_1.generateCertificate);
router.get('/student/certificates/:id/download', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), certificate_controller_1.downloadCertificate);
router.post('/student/certificates/:id/share', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), certificate_controller_1.shareCertificate);
// Public certificate verification route (anyone can verify)
router.get('/certificates/verify/:serialNumber', certificate_controller_1.verifyCertificate);
exports.default = router;
