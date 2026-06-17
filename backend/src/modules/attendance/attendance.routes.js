"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const attendance_controller_1 = require("./attendance.controller");
const router = (0, express_1.Router)();
// Student routes
router.post('/student/attendance/mark', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), attendance_controller_1.markAttendance);
router.get('/student/attendance/my-records', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['STUDENT']), attendance_controller_1.getStudentAttendance);
// Faculty / Admin routes
router.post('/faculty/attendance/generate-qr', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), attendance_controller_1.generateQR);
router.get('/faculty/attendance/course/:courseId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), attendance_controller_1.getCourseAttendance);
router.get('/faculty/attendance/analytics/:courseId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), attendance_controller_1.getAttendanceAnalytics);
router.put('/faculty/attendance/:attendanceId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), attendance_controller_1.updateAttendance);
router.get('/faculty/attendance/report/:courseId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN']), attendance_controller_1.generateAttendanceReport);
exports.default = router;
