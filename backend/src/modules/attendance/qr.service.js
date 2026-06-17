"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyQRToken = exports.generateQRToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
const QR_EXPIRY = '5m'; // QR tokens expire in 5 minutes
/**
 * Generates a signed JWT for QR code attendance marking, valid for 5 minutes.
 */
const generateQRToken = (courseId, facultyId) => {
    const payload = {
        courseId,
        facultyId,
        timestamp: new Date().toISOString(),
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: QR_EXPIRY });
};
exports.generateQRToken = generateQRToken;
/**
 * Verifies a QR token signature and expiration, returning its payload if valid.
 */
const verifyQRToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        console.error('QR Token verification failed:', error);
        return null;
    }
};
exports.verifyQRToken = verifyQRToken;
