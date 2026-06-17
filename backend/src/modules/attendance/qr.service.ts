import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
const QR_EXPIRY = '5m'; // QR tokens expire in 5 minutes

export interface QRTokenPayload {
  courseId: string;
  facultyId: string;
  timestamp: string;
}

/**
 * Generates a signed JWT for QR code attendance marking, valid for 5 minutes.
 */
export const generateQRToken = (courseId: string, facultyId: string): string => {
  const payload: QRTokenPayload = {
    courseId,
    facultyId,
    timestamp: new Date().toISOString(),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: QR_EXPIRY });
};

/**
 * Verifies a QR token signature and expiration, returning its payload if valid.
 */
export const verifyQRToken = (token: string): QRTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as QRTokenPayload;
    return decoded;
  } catch (error) {
    console.error('QR Token verification failed:', error);
    return null;
  }
};
