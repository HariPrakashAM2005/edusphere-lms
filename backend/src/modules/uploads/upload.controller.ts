import { Request, Response } from 'express';
import { uploadFile, getSignedUrl, getLocalFilePath } from '../../services/s3.service';
import fs from 'fs/promises';

/**
 * Handle POST /api/upload/course-material
 */
export const uploadCourseMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const result = await uploadFile(
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      'course-materials'
    );

    res.status(201).json({
      message: 'Course material uploaded successfully',
      file: result,
    });
  } catch (error: any) {
    console.error('Error in uploadCourseMaterial:', error);
    res.status(500).json({ error: error.message || 'Failed to upload course material' });
  }
};

/**
 * Handle POST /api/upload/assignment-submission
 */
export const uploadAssignmentSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const result = await uploadFile(
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      'assignments'
    );

    res.status(201).json({
      message: 'Assignment submission uploaded successfully',
      file: result,
    });
  } catch (error: any) {
    console.error('Error in uploadAssignmentSubmission:', error);
    res.status(500).json({ error: error.message || 'Failed to upload assignment submission' });
  }
};

/**
 * Handle GET /api/uploads/:key (implemented via :folder/:filename to capture folder/file key structure)
 */
export const getUploadedFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;

    const isLocal = !process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'xxx';

    if (isLocal) {
      const filePath = getLocalFilePath(key);
      try {
        await fs.access(filePath);
        res.sendFile(filePath);
      } catch (err) {
        res.status(404).json({ error: 'File not found' });
      }
    } else {
      const signedUrl = await getSignedUrl(key);
      res.redirect(signedUrl);
    }
  } catch (error: any) {
    console.error('Error in getUploadedFile:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve file' });
  }
};
