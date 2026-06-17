"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const course_controller_1 = require("./course.controller");
const router = (0, express_1.Router)();
// Protect all routes under this module
const facultyOrAdmin = [auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['FACULTY', 'INSTITUTION_ADMIN'])];
router.post('/faculty/courses', facultyOrAdmin, course_controller_1.createCourse);
router.get('/faculty/courses', facultyOrAdmin, course_controller_1.getMyCourses);
router.get('/faculty/courses/:id', facultyOrAdmin, course_controller_1.getCourseById);
router.put('/faculty/courses/:id', facultyOrAdmin, course_controller_1.updateCourse);
router.delete('/faculty/courses/:id', facultyOrAdmin, course_controller_1.deleteCourse);
router.post('/faculty/courses/:id/modules', facultyOrAdmin, course_controller_1.addModule);
router.post('/faculty/modules/:id/lessons', facultyOrAdmin, course_controller_1.addLesson);
router.patch('/faculty/courses/:id/publish', facultyOrAdmin, course_controller_1.publishCourse);
// Enrollment management
router.get('/faculty/courses/:id/enrollments', facultyOrAdmin, course_controller_1.getCourseEnrollments);
router.post('/faculty/courses/:id/enrollments', facultyOrAdmin, course_controller_1.addEnrollment);
router.delete('/faculty/courses/:id/enrollments/:enrollmentId', facultyOrAdmin, course_controller_1.removeEnrollment);
// Instructor management
router.get('/faculty/instructors', facultyOrAdmin, course_controller_1.getInstructors);
router.post('/faculty/courses/:id/instructor', facultyOrAdmin, course_controller_1.assignInstructor);
// Student route
router.get('/student/courses', auth_middleware_1.authenticateJWT, course_controller_1.getStudentCourses);
exports.default = router;
