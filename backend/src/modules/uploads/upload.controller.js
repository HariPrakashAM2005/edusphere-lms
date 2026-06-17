"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadedFile = exports.uploadAssignmentSubmission = exports.uploadCourseMaterial = void 0;
const s3_service_1 = require("../../services/s3.service");
const promises_1 = __importDefault(require("fs/promises"));
/**
 * Handle POST /api/upload/course-material
 */
const uploadCourseMaterial = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const result = await (0, s3_service_1.uploadFile)({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        }, 'course-materials');
        res.status(201).json({
            message: 'Course material uploaded successfully',
            file: result,
        });
    }
    catch (error) {
        console.error('Error in uploadCourseMaterial:', error);
        res.status(500).json({ error: error.message || 'Failed to upload course material' });
    }
};
exports.uploadCourseMaterial = uploadCourseMaterial;
/**
 * Handle POST /api/upload/assignment-submission
 */
const uploadAssignmentSubmission = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const result = await (0, s3_service_1.uploadFile)({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        }, 'assignments');
        res.status(201).json({
            message: 'Assignment submission uploaded successfully',
            file: result,
        });
    }
    catch (error) {
        console.error('Error in uploadAssignmentSubmission:', error);
        res.status(500).json({ error: error.message || 'Failed to upload assignment submission' });
    }
};
exports.uploadAssignmentSubmission = uploadAssignmentSubmission;
/**
 * Handle GET /api/uploads/:key (implemented via :folder/:filename to capture folder/file key structure)
 */
const getUploadedFile = async (req, res) => {
    try {
        const { folder, filename } = req.params;
        const key = `${folder}/${filename}`;
        const isLocal = !process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'xxx';
        if (isLocal) {
            const filePath = (0, s3_service_1.getLocalFilePath)(key);
            try {
                await promises_1.default.access(filePath);
                res.sendFile(filePath);
            }
            catch (err) {
                res.status(404).json({ error: 'File not found' });
            }
        }
        else {
            const signedUrl = await (0, s3_service_1.getSignedUrl)(key);
            res.redirect(signedUrl);
        }
    }
    catch (error) {
        console.error('Error in getUploadedFile:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve file' });
    }
};
exports.getUploadedFile = getUploadedFile;
