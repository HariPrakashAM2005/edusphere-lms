import { Router } from 'express';
import { authenticateJWT, requireRole } from '../../middleware/auth.middleware';
import {
  getStudentCertificates,
  generateCertificate,
  verifyCertificate,
  downloadCertificate,
  shareCertificate
} from './certificate.controller';

const router = Router();

// Student routes
router.get('/student/certificates', authenticateJWT, requireRole(['STUDENT']), getStudentCertificates);
router.post('/student/certificates/:courseId/generate', authenticateJWT, requireRole(['STUDENT']), generateCertificate);
router.get('/student/certificates/:id/download', authenticateJWT, requireRole(['STUDENT']), downloadCertificate);
router.post('/student/certificates/:id/share', authenticateJWT, requireRole(['STUDENT']), shareCertificate);

// Public certificate verification route (anyone can verify)
router.get('/certificates/verify/:serialNumber', verifyCertificate);

export default router;
