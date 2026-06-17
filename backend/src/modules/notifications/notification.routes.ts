import { Router } from 'express';
import { getNotifications, markAsRead, testTrigger } from './notification.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.get('/notifications', authenticateJWT, getNotifications);
router.post('/notifications/test-trigger', authenticateJWT, testTrigger);
router.post('/notifications/:id/read', authenticateJWT, markAsRead);

export default router;
