import { Router } from 'express';
import { authenticateJWT, requireRole } from '../../middleware/auth.middleware';
import {
  createCourse,
  getMyCourses,
  updateCourse,
  deleteCourse,
  addModule,
  addLesson,
  publishCourse,
  getStudentCourses,
  getCourseEnrollments,
  addEnrollment,
  removeEnrollment,
  getInstructors,
  assignInstructor,
  getCourseById
} from './course.controller';

const router = Router();

// Protect all routes under this module
const facultyOrAdmin = [authenticateJWT, requireRole(['FACULTY', 'INSTITUTION_ADMIN'])];

router.post('/faculty/courses', facultyOrAdmin, createCourse);
router.get('/faculty/courses', facultyOrAdmin, getMyCourses);
router.get('/faculty/courses/:id', facultyOrAdmin, getCourseById);
router.put('/faculty/courses/:id', facultyOrAdmin, updateCourse);
router.delete('/faculty/courses/:id', facultyOrAdmin, deleteCourse);
router.post('/faculty/courses/:id/modules', facultyOrAdmin, addModule);
router.post('/faculty/modules/:id/lessons', facultyOrAdmin, addLesson);
router.patch('/faculty/courses/:id/publish', facultyOrAdmin, publishCourse);

// Enrollment management
router.get('/faculty/courses/:id/enrollments', facultyOrAdmin, getCourseEnrollments);
router.post('/faculty/courses/:id/enrollments', facultyOrAdmin, addEnrollment);
router.delete('/faculty/courses/:id/enrollments/:enrollmentId', facultyOrAdmin, removeEnrollment);

// Instructor management
router.get('/faculty/instructors', facultyOrAdmin, getInstructors);
router.post('/faculty/courses/:id/instructor', facultyOrAdmin, assignInstructor);

// Student route
router.get('/student/courses', authenticateJWT, getStudentCourses);

export default router;
