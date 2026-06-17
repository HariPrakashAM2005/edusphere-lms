import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateJWT } from '../../middleware/auth.middleware';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  setupMfa,
  verifyMfa,
  googleLogin,
  googleCallback
} from './auth.controller';

const router = Router();

// Rate Limiter: 100 requests per 15 minutes for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many authentication requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', authenticateJWT, getMe);
router.post('/mfa/setup', authenticateJWT, setupMfa);
router.post('/mfa/verify', verifyMfa);

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

export default router;
