"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseById = exports.assignInstructor = exports.getInstructors = exports.removeEnrollment = exports.addEnrollment = exports.getCourseEnrollments = exports.getStudentCourses = exports.publishCourse = exports.addLesson = exports.addModule = exports.deleteCourse = exports.updateCourse = exports.getMyCourses = exports.createCourse = void 0;
const client_1 = require("@prisma/client");
const socket_1 = require("../../socket");
const prisma = new client_1.PrismaClient();
/**
 * Helper to emit real-time course updates
 */
const emitCourseEvent = (event, data) => {
    try {
        const io = (0, socket_1.getIO)();
        io.emit(event, data);
        if (data.id) {
            io.to(`course:${data.id}`).emit(event, data);
        }
    }
    catch (error) {
        console.error('Socket broadcast failed:', error);
    }
};
const createCourse = async (req, res) => {
    try {
        const { title, description, category, thumbnail } = req.body;
        if (!title || !description) {
            res.status(400).json({ error: 'Title and description are required' });
            return;
        }
        const course = await prisma.course.create({
            data: {
                title,
                description,
                category: category || null,
                thumbnail: thumbnail || null,
                published: false,
                facultyId: req.user?.id || null,
            },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                },
            },
        });
        emitCourseEvent('course_created', course);
        res.status(201).json(course);
    }
    catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.createCourse = createCourse;
const getMyCourses = async (req, res) => {
    try {
        const facultyId = req.user?.id;
        if (!facultyId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Return courses created by this faculty or those with no faculty assigned (seeded default courses)
        const courses = await prisma.course.findMany({
            where: {
                OR: [
                    { facultyId: facultyId },
                    { facultyId: null }
                ]
            },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                enrollments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(courses);
    }
    catch (error) {
        console.error('Get my courses error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.getMyCourses = getMyCourses;
const updateCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description, category, thumbnail, published } = req.body;
        const existingCourse = await prisma.course.findUnique({
            where: { id },
        });
        if (!existingCourse) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const updated = await prisma.course.update({
            where: { id },
            data: {
                title: title !== undefined ? title : existingCourse.title,
                description: description !== undefined ? description : existingCourse.description,
                category: category !== undefined ? category : existingCourse.category,
                thumbnail: thumbnail !== undefined ? thumbnail : existingCourse.thumbnail,
                published: published !== undefined ? published : existingCourse.published,
            },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        emitCourseEvent('course_updated', updated);
        res.status(200).json(updated);
    }
    catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const existingCourse = await prisma.course.findUnique({
            where: { id },
        });
        if (!existingCourse) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        await prisma.course.delete({
            where: { id },
        });
        emitCourseEvent('course_deleted', { id });
        res.status(200).json({ message: 'Course deleted successfully' });
    }
    catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.deleteCourse = deleteCourse;
const addModule = async (req, res) => {
    try {
        const id = req.params.id; // courseId
        const { title, description, order } = req.body;
        if (!title) {
            res.status(400).json({ error: 'Module title is required' });
            return;
        }
        const course = await prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const module = await prisma.module.create({
            data: {
                courseId: id,
                title,
                description: description || null,
                order: order !== undefined ? parseInt(order.toString(), 10) : 0,
            },
        });
        // Fetch updated course and emit update event
        const updatedCourse = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        emitCourseEvent('course_updated', updatedCourse);
        res.status(201).json(module);
    }
    catch (error) {
        console.error('Add module error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.addModule = addModule;
const addLesson = async (req, res) => {
    try {
        const id = req.params.id; // moduleId
        const { title, content, videoUrl, duration, order } = req.body;
        if (!title) {
            res.status(400).json({ error: 'Lesson title is required' });
            return;
        }
        const module = await prisma.module.findUnique({
            where: { id },
        });
        if (!module) {
            res.status(404).json({ error: 'Module not found' });
            return;
        }
        const lesson = await prisma.lesson.create({
            data: {
                moduleId: id,
                title,
                content: content || null,
                videoUrl: videoUrl || null,
                duration: duration !== undefined ? parseInt(duration.toString(), 10) : 0,
                order: order !== undefined ? parseInt(order.toString(), 10) : 0,
            },
        });
        // Fetch updated course and emit update event
        const updatedCourse = await prisma.course.findUnique({
            where: { id: module.courseId },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        emitCourseEvent('course_updated', updatedCourse);
        res.status(201).json(lesson);
    }
    catch (error) {
        console.error('Add lesson error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.addLesson = addLesson;
const publishCourse = async (req, res) => {
    try {
        const id = req.params.id;
        const { published } = req.body;
        const course = await prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const updated = await prisma.course.update({
            where: { id },
            data: {
                published: published !== undefined ? published : true,
            },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        emitCourseEvent('course_updated', updated);
        res.status(200).json(updated);
    }
    catch (error) {
        console.error('Publish course error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.publishCourse = publishCourse;
const getStudentCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: {
                published: true,
            },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(courses);
    }
    catch (error) {
        console.error('Get student courses error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.getStudentCourses = getStudentCourses;
const getCourseEnrollments = async (req, res) => {
    try {
        const id = req.params.id;
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId: id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCourseEnrollments = getCourseEnrollments;
const addEnrollment = async (req, res) => {
    try {
        const id = req.params.id; // courseId
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Student email is required' });
            return;
        }
        const student = await prisma.user.findUnique({
            where: { email },
        });
        if (!student) {
            res.status(404).json({ error: 'Student user not found' });
            return;
        }
        const enrollment = await prisma.enrollment.upsert({
            where: {
                userId_courseId: {
                    userId: student.id,
                    courseId: id,
                },
            },
            update: {
                isActive: true,
            },
            create: {
                userId: student.id,
                courseId: id,
                progress: 0,
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        const { emitEnrollmentUpdate } = require('../../socket');
        emitEnrollmentUpdate(id, enrollment);
        res.status(201).json(enrollment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addEnrollment = addEnrollment;
const removeEnrollment = async (req, res) => {
    try {
        const id = req.params.id;
        const enrollmentId = req.params.enrollmentId;
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
        });
        if (!enrollment) {
            res.status(404).json({ error: 'Enrollment not found' });
            return;
        }
        await prisma.enrollment.delete({
            where: { id: enrollmentId },
        });
        const { emitEnrollmentUpdate } = require('../../socket');
        emitEnrollmentUpdate(id, { id: enrollmentId, deleted: true });
        res.status(200).json({ message: 'Enrollment removed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.removeEnrollment = removeEnrollment;
const getInstructors = async (req, res) => {
    try {
        const instructors = await prisma.user.findMany({
            where: {
                role: { in: ['FACULTY', 'INSTITUTION_ADMIN'] },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        });
        res.status(200).json(instructors);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getInstructors = getInstructors;
const assignInstructor = async (req, res) => {
    try {
        const id = req.params.id; // courseId
        const { facultyId } = req.body;
        if (!facultyId) {
            res.status(400).json({ error: 'Faculty ID is required' });
            return;
        }
        const facultyUser = await prisma.user.findUnique({
            where: { id: facultyId },
        });
        if (!facultyUser) {
            res.status(404).json({ error: 'Faculty user not found' });
            return;
        }
        const updated = await prisma.course.update({
            where: { id },
            data: { facultyId },
            include: {
                faculty: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        emitCourseEvent('course_updated', updated);
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.assignInstructor = assignInstructor;
const getCourseById = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                faculty: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                enrollments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.status(200).json(course);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCourseById = getCourseById;
