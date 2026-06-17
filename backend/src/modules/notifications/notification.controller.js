"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testTrigger = exports.markAsRead = exports.getNotifications = void 0;
const client_1 = require("@prisma/client");
const socket_1 = require("../../socket");
const prisma = new client_1.PrismaClient();
/**
 * GET /api/notifications
 * Fetch user's notification history
 */
const getNotifications = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const userId = req.user.id;
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error('Error in getNotifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
/**
 * POST /api/notifications/:id/read
 * Mark a single notification or all notifications as read
 */
const markAsRead = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const userId = req.user.id;
    const id = req.params.id;
    try {
        if (id === 'all') {
            await prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true },
            });
            res.status(200).json({ message: 'All notifications marked as read' });
            return;
        }
        const notification = await prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        if (notification.userId !== userId) {
            res.status(403).json({ error: 'Forbidden: Cannot access this notification' });
            return;
        }
        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ error: 'Failed to update notification state' });
    }
};
exports.markAsRead = markAsRead;
/**
 * POST /api/notifications/test-trigger
 * Trigger a mock notification for testing purposes
 */
const testTrigger = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const userId = req.user.id;
    const { type, title, message } = req.body;
    if (!type || !title || !message) {
        res.status(400).json({ error: 'Type, title, and message are required' });
        return;
    }
    const allowedTypes = [
        'assignment_graded',
        'new_announcement',
        'certificate_issued',
        'attendance_marked',
        'quiz_result_available',
    ];
    if (!allowedTypes.includes(type)) {
        res.status(400).json({ error: `Type must be one of: ${allowedTypes.join(', ')}` });
        return;
    }
    try {
        const notification = await (0, socket_1.sendRealTimeNotification)({
            userId,
            type,
            title,
            message,
        });
        res.status(201).json({
            message: 'Test notification triggered',
            notification,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to trigger test notification', details: error.message });
    }
};
exports.testTrigger = testTrigger;
