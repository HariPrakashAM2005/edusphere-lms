"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitAssessmentSubmitted = exports.emitStudentProgressUpdate = exports.emitEnrollmentUpdate = exports.sendRealTimeNotification = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let io = null;
/**
 * Initialize Socket.io Server
 */
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        // Join user-specific notification room
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                console.log(`👤 User ${userId} joined their notification room: user:${userId}`);
            }
        });
        // Join course-specific notification room
        socket.on('join_course', (courseId) => {
            if (courseId) {
                socket.join(`course:${courseId}`);
                console.log(`📚 Socket ${socket.id} joined course room: course:${courseId}`);
            }
        });
        // Leave course-specific notification room
        socket.on('leave_course', (courseId) => {
            if (courseId) {
                socket.leave(`course:${courseId}`);
                console.log(`📚 Socket ${socket.id} left course room: course:${courseId}`);
            }
        });
        // Real-time Grade Submission from Admin Panel
        socket.on('submit_grade', async (data) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { email: data.studentEmail }
                });
                if (user) {
                    const notification = await prisma.notification.create({
                        data: {
                            userId: user.id,
                            type: 'assignment_graded',
                            title: 'Assessment Graded (Real-time)',
                            message: `Your assignment "${data.assessmentTitle}" has been graded. Score: ${data.score}/${data.totalMarks}. Feedback: ${data.feedback}`,
                            isRead: false
                        }
                    });
                    io?.to(`user:${user.id}`).emit('notification', notification);
                    console.log(`🔔 Real-time grading notification sent to User ${user.id} (${data.studentEmail})`);
                }
                else {
                    console.warn(`⚠️ Socket submit_grade: User with email ${data.studentEmail} not found in DB`);
                }
            }
            catch (err) {
                console.error('❌ Failed to process socket submit_grade:', err);
            }
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
/**
 * Get active Socket.io instance
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io server has not been initialized');
    }
    return io;
};
exports.getIO = getIO;
/**
 * Persists a notification to the database and broadcasts it in real-time.
 */
const sendRealTimeNotification = async ({ userId, type, title, message, }) => {
    try {
        // 1. Save in Database
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                isRead: false,
            },
        });
        console.log(`💾 Notification persisted in database for User ${userId}`);
        // 2. Broadcast via socket room
        if (io) {
            io.to(`user:${userId}`).emit('notification', notification);
            console.log(`🔔 Broadcasted real-time event to user:${userId}`);
        }
        else {
            console.warn('⚠️ Socket server not started, skipped broadcast');
        }
        return notification;
    }
    catch (error) {
        console.error('❌ Failed to process notification:', error);
        throw error;
    }
};
exports.sendRealTimeNotification = sendRealTimeNotification;
/**
 * Emits dynamic course enrollment updates to the course-specific room
 */
const emitEnrollmentUpdate = (courseId, enrollment) => {
    if (io) {
        io.to(`course:${courseId}`).emit('enrollment_updated', enrollment);
        io.emit('enrollment_updated', { courseId, enrollment });
        console.log(`👥 Broadcasted enrollment update for course:${courseId}`);
    }
};
exports.emitEnrollmentUpdate = emitEnrollmentUpdate;
/**
 * Emits student learning progress updates in real-time
 */
const emitStudentProgressUpdate = (courseId, progressData) => {
    if (io) {
        io.to(`course:${courseId}`).emit('student_progress', progressData);
        console.log(`📈 Broadcasted student progress for course:${courseId}`);
    }
};
exports.emitStudentProgressUpdate = emitStudentProgressUpdate;
/**
 * Emits student assessment submission event globally to connected clients (like Admin Panel)
 */
const emitAssessmentSubmitted = (assessmentId, studentName, assessmentTitle, attemptId) => {
    if (io) {
        io.emit('assessment_submitted', { assessmentId, studentName, assessmentTitle, attemptId });
        console.log(`📝 Broadcasted assessment submission event: ${assessmentId} by ${studentName}`);
    }
};
exports.emitAssessmentSubmitted = emitAssessmentSubmitted;
