"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalFilePath = exports.generateThumbnail = exports.deleteFile = exports.getSignedUrl = exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
let s3Client = null;
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'edusphere-uploads';
// Check if S3 is configured with real credentials
const isS3Configured = () => {
    return !!(process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_ACCESS_KEY_ID !== 'xxx' &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_SECRET_ACCESS_KEY !== 'xxx' &&
        process.env.AWS_REGION &&
        process.env.AWS_S3_BUCKET);
};
// Initialize S3 Client lazy-loaded
const getS3Client = () => {
    if (s3Client)
        return s3Client;
    s3Client = new client_s3_1.S3Client({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
    });
    return s3Client;
};
// Local storage fallback directory
const LOCAL_UPLOADS_DIR = path_1.default.join(process.cwd(), 'uploads');
const ensureLocalDirectory = async (folder) => {
    const dirPath = path_1.default.join(LOCAL_UPLOADS_DIR, folder);
    await promises_1.default.mkdir(dirPath, { recursive: true });
    return dirPath;
};
/**
 * Uploads a file to S3 (or local storage fallback).
 */
const uploadFile = async (file, folder) => {
    const fileExt = path_1.default.extname(file.originalname);
    const randomName = crypto_1.default.randomBytes(16).toString('hex') + fileExt;
    const key = `${folder}/${randomName}`;
    if (isS3Configured()) {
        console.log(`☁️ Uploading to AWS S3 bucket "${BUCKET_NAME}": ${key}`);
        const client = getS3Client();
        await client.send(new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        // Generate signed read URL (valid for 24h)
        const url = await (0, exports.getSignedUrl)(key, 86400);
        return {
            key,
            url,
            fileName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        };
    }
    else {
        // Local fallback
        console.warn(`⚠️ S3 not configured. Storing file locally: ${key}`);
        const targetDir = await ensureLocalDirectory(folder);
        const targetPath = path_1.default.join(targetDir, randomName);
        await promises_1.default.writeFile(targetPath, file.buffer);
        const url = `http://localhost:3001/api/uploads/${key}`;
        return {
            key,
            url,
            fileName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        };
    }
};
exports.uploadFile = uploadFile;
/**
 * Generates a signed url for reading a file.
 */
const getSignedUrl = async (key, expiresIn = 3600) => {
    if (isS3Configured()) {
        const client = getS3Client();
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn });
    }
    else {
        // Local fallback URL
        return `http://localhost:3001/api/uploads/${key}`;
    }
};
exports.getSignedUrl = getSignedUrl;
/**
 * Deletes a file from storage.
 */
const deleteFile = async (key) => {
    if (isS3Configured()) {
        console.log(`☁️ Deleting S3 Object: ${key}`);
        const client = getS3Client();
        await client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        }));
    }
    else {
        console.warn(`⚠️ Deleting local file: ${key}`);
        const filePath = path_1.default.join(LOCAL_UPLOADS_DIR, key);
        try {
            await promises_1.default.unlink(filePath);
        }
        catch (err) {
            console.warn(`Failed to delete local file: ${filePath}. Error: ${err.message}`);
        }
    }
};
exports.deleteFile = deleteFile;
/**
 * Returns/Generates a thumbnail for video files.
 */
const generateThumbnail = async (videoKey) => {
    const thumbnailKey = `thumbnails/${videoKey.replace(/\.[^/.]+$/, '')}-thumb.jpg`;
    console.log(`🎬 Video thumbnail requested for ${videoKey}. Mapping to ${thumbnailKey}`);
    // In a production environment, you would use fluent-ffmpeg or trigger an AWS Elemental MediaConvert job.
    // For EduSphere, we return a mock thumbnail key that redirects/serves a placeholder or mock image.
    return thumbnailKey;
};
exports.generateThumbnail = generateThumbnail;
/**
 * Helper to stream/serve a local file (used in controller fallback).
 */
const getLocalFilePath = (key) => {
    const resolvedPath = path_1.default.resolve(LOCAL_UPLOADS_DIR, key);
    // Prevent Directory Traversal Attacks
    if (!resolvedPath.startsWith(LOCAL_UPLOADS_DIR)) {
        throw new Error('Access Denied: Invalid file path');
    }
    return resolvedPath;
};
exports.getLocalFilePath = getLocalFilePath;
