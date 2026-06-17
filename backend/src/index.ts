import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import http from 'http';
import { initSocket } from './socket';

import authRoutes from './modules/auth/auth.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import assessmentRoutes from './modules/assessment/assessment.routes';
import certificateRoutes from './modules/certificate/certificate.routes';
import aiRoutes from './modules/ai/ai.routes';
import gamificationRoutes from './modules/gamification/gamification.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import courseRoutes from './modules/courses/course.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocket(server);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

app.use(helmet());
app.use(compression());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api', assessmentRoutes);
app.use('/api', certificateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api', uploadRoutes);
app.use('/api', notificationRoutes);
app.use('/api', courseRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ message: 'EduSphere API v1.0.0', version: '1.0.0' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 API: http://localhost:${PORT}/api`);
  logger.info(`❤️ Health: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server...');
  prisma.$disconnect();
  process.exit(0);
});
