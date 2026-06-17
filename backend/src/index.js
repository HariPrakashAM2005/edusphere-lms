"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const winston_1 = __importDefault(require("winston"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const attendance_routes_1 = __importDefault(require("./modules/attendance/attendance.routes"));
const assessment_routes_1 = __importDefault(require("./modules/assessment/assessment.routes"));
const certificate_routes_1 = __importDefault(require("./modules/certificate/certificate.routes"));
const ai_routes_1 = __importDefault(require("./modules/ai/ai.routes"));
const gamification_routes_1 = __importDefault(require("./modules/gamification/gamification.routes"));
const upload_routes_1 = __importDefault(require("./modules/uploads/upload.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const course_routes_1 = __importDefault(require("./modules/courses/course.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
(0, socket_1.initSocket)(server);
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3001;
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.Console({ format: winston_1.default.format.simple() })
    ]
});
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({ origin: 'http://localhost:3000', credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/attendance', attendance_routes_1.default);
app.use('/api', assessment_routes_1.default);
app.use('/api', certificate_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/gamification', gamification_routes_1.default);
app.use('/api', upload_routes_1.default);
app.use('/api', notification_routes_1.default);
app.use('/api', course_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api', (req, res) => {
    res.json({ message: 'EduSphere API v1.0.0', version: '1.0.0' });
});
app.use((err, req, res, next) => {
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
