import { Router } from 'express';
import multer from 'multer';
import { uploadCourseMaterial, uploadAssignmentSubmission, getUploadedFile } from './upload.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Routes
router.post('/upload/course-material', authenticateJWT, upload.single('file'), uploadCourseMaterial);
router.post('/upload/assignment-submission', authenticateJWT, upload.single('file'), uploadAssignmentSubmission);
router.get('/uploads/:folder/:filename', getUploadedFile);

export default router;
