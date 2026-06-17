import { Server } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let io: Server | null = null;

/**
 * Initialize Socket.io Server
 */
export const initSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user-specific notification room
    socket.on('join', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 User ${userId} joined their notification room: user:${userId}`);
      }
    });

    // Join course-specific notification room
    socket.on('join_course', (courseId: string) => {
      if (courseId) {
        socket.join(`course:${courseId}`);
        console.log(`📚 Socket ${socket.id} joined course room: course:${courseId}`);
      }
    });

    // Leave course-specific notification room
    socket.on('leave_course', (courseId: string) => {
      if (courseId) {
        socket.leave(`course:${courseId}`);
        console.log(`📚 Socket ${socket.id} left course room: course:${courseId}`);
      }
    });

    // Real-time Grade Submission from Admin Panel
    socket.on('submit_grade', async (data: { studentEmail: string; score: number; totalMarks: number; assessmentTitle: string; feedback: string }) => {
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
        } else {
          console.warn(`⚠️ Socket submit_grade: User with email ${data.studentEmail} not found in DB`);
        }
      } catch (err) {
        console.error('❌ Failed to process socket submit_grade:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get active Socket.io instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io server has not been initialized');
  }
  return io;
};

export interface SendNotificationParams {
  userId: string;
  type: string; // assignment_graded, new_announcement, certificate_issued, attendance_marked, quiz_result_available
  title: string;
  message: string;
}

/**
 * Persists a notification to the database and broadcasts it in real-time.
 */
export const sendRealTimeNotification = async ({
  userId,
  type,
  title,
  message,
}: SendNotificationParams) => {
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
    } else {
      console.warn('⚠️ Socket server not started, skipped broadcast');
    }

    return notification;
  } catch (error) {
    console.error('❌ Failed to process notification:', error);
    throw error;
  }
};

/**
 * Emits dynamic course enrollment updates to the course-specific room
 */
export const emitEnrollmentUpdate = (courseId: string, enrollment: any) => {
  if (io) {
    io.to(`course:${courseId}`).emit('enrollment_updated', enrollment);
    io.emit('enrollment_updated', { courseId, enrollment });
    console.log(`👥 Broadcasted enrollment update for course:${courseId}`);
  }
};

/**
 * Emits student learning progress updates in real-time
 */
export const emitStudentProgressUpdate = (courseId: string, progressData: any) => {
  if (io) {
    io.to(`course:${courseId}`).emit('student_progress', progressData);
    console.log(`📈 Broadcasted student progress for course:${courseId}`);
  }
};

/**
 * Emits student assessment submission event globally to connected clients (like Admin Panel)
 */
export const emitAssessmentSubmitted = (assessmentId: string, studentName: string, assessmentTitle: string, attemptId: string) => {
  if (io) {
    io.emit('assessment_submitted', { assessmentId, studentName, assessmentTitle, attemptId });
    console.log(`📝 Broadcasted assessment submission event: ${assessmentId} by ${studentName}`);
  }
};
