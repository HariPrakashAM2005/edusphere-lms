import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getAwsSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

let s3Client: S3Client | null = null;
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'edusphere-uploads';

// Check if S3 is configured with real credentials
const isS3Configured = (): boolean => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_ACCESS_KEY_ID !== 'xxx' &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_SECRET_ACCESS_KEY !== 'xxx' &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET
  );
};

// Initialize S3 Client lazy-loaded
const getS3Client = (): S3Client => {
  if (s3Client) return s3Client;
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
  return s3Client;
};

// Local storage fallback directory
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const ensureLocalDirectory = async (folder: string) => {
  const dirPath = path.join(LOCAL_UPLOADS_DIR, folder);
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
};

export interface UploadResult {
  key: string;
  url: string;
  fileName: string;
  mimetype: string;
  size: number;
}

/**
 * Uploads a file to S3 (or local storage fallback).
 */
export const uploadFile = async (
  file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  folder: string
): Promise<UploadResult> => {
  const fileExt = path.extname(file.originalname);
  const randomName = crypto.randomBytes(16).toString('hex') + fileExt;
  const key = `${folder}/${randomName}`;

  if (isS3Configured()) {
    console.log(`☁️ Uploading to AWS S3 bucket "${BUCKET_NAME}": ${key}`);
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // Generate signed read URL (valid for 24h)
    const url = await getSignedUrl(key, 86400);

    return {
      key,
      url,
      fileName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  } else {
    // Local fallback
    console.warn(`⚠️ S3 not configured. Storing file locally: ${key}`);
    const targetDir = await ensureLocalDirectory(folder);
    const targetPath = path.join(targetDir, randomName);
    await fs.writeFile(targetPath, file.buffer);

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

/**
 * Generates a signed url for reading a file.
 */
export const getSignedUrl = async (key: string, expiresIn = 3600): Promise<string> => {
  if (isS3Configured()) {
    const client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    return await getAwsSignedUrl(client, command, { expiresIn });
  } else {
    // Local fallback URL
    return `http://localhost:3001/api/uploads/${key}`;
  }
};

/**
 * Deletes a file from storage.
 */
export const deleteFile = async (key: string): Promise<void> => {
  if (isS3Configured()) {
    console.log(`☁️ Deleting S3 Object: ${key}`);
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
  } else {
    console.warn(`⚠️ Deleting local file: ${key}`);
    const filePath = path.join(LOCAL_UPLOADS_DIR, key);
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      console.warn(`Failed to delete local file: ${filePath}. Error: ${err.message}`);
    }
  }
};

/**
 * Returns/Generates a thumbnail for video files.
 */
export const generateThumbnail = async (videoKey: string): Promise<string> => {
  const thumbnailKey = `thumbnails/${videoKey.replace(/\.[^/.]+$/, '')}-thumb.jpg`;
  console.log(`🎬 Video thumbnail requested for ${videoKey}. Mapping to ${thumbnailKey}`);

  // In a production environment, you would use fluent-ffmpeg or trigger an AWS Elemental MediaConvert job.
  // For EduSphere, we return a mock thumbnail key that redirects/serves a placeholder or mock image.
  return thumbnailKey;
};

/**
 * Helper to stream/serve a local file (used in controller fallback).
 */
export const getLocalFilePath = (key: string): string => {
  const resolvedPath = path.resolve(LOCAL_UPLOADS_DIR, key);
  
  // Prevent Directory Traversal Attacks
  if (!resolvedPath.startsWith(LOCAL_UPLOADS_DIR)) {
    throw new Error('Access Denied: Invalid file path');
  }
  
  return resolvedPath;
};
