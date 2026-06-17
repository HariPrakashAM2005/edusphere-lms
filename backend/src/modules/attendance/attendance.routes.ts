import { Router } from 'express';
import { authenticateJWT, requireRole } from '../../middleware/auth.middleware';
import {
  generateQR,
  markAttendance,
  getStudentAttendance,
  getCourseAttendance,
  getAttendanceAnalytics,
  updateAttendance,
  generateAttendanceReport
} from './attendance.controller';

const router = Router();

// Student routes
router.post('/student/attendance/mark', authenticateJWT, requireRole(['STUDENT']), markAttendance);
router.get('/student/attendance/my-records', authenticateJWT, requireRole(['STUDENT']), getStudentAttendance);

// Faculty / Admin routes
router.post('/faculty/attendance/generate-qr', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), generateQR);
router.get('/faculty/attendance/course/:courseId', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), getCourseAttendance);
router.get('/faculty/attendance/analytics/:courseId', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), getAttendanceAnalytics);
router.put('/faculty/attendance/:attendanceId', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), updateAttendance);
router.get('/faculty/attendance/report/:courseId', authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN']), generateAttendanceReport);

export default router;
