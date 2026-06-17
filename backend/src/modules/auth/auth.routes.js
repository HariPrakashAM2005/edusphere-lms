"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
// Rate Limiter: 100 requests per 15 minutes for auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many authentication requests, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.use(authLimiter);
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/reset-password', auth_controller_1.resetPassword);
router.get('/me', auth_middleware_1.authenticateJWT, auth_controller_1.getMe);
router.post('/mfa/setup', auth_middleware_1.authenticateJWT, auth_controller_1.setupMfa);
router.post('/mfa/verify', auth_controller_1.verifyMfa);
router.get('/google', auth_controller_1.googleLogin);
router.get('/google/callback', auth_controller_1.googleCallback);
exports.default = router;
