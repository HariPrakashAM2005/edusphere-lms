"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareCertificate = exports.downloadCertificate = exports.verifyCertificate = exports.generateCertificate = exports.getStudentCertificates = void 0;
const client_1 = require("@prisma/client");
const socket_1 = require("../../socket");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
// Helper: generate SHA-256 blockchain hash
const generateBlockchainHash = (data) => {
    return crypto_1.default.createHash('sha256').update(data).digest('hex');
};
const getStudentCertificates = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    const userId = req.user.id;
    try {
        const certificates = await prisma.certificate.findMany({
            where: { userId },
            include: {
                course: { select: { title: true } }
            },
            orderBy: { issueDate: 'desc' }
        });
        res.status(200).json(certificates);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch student certificates.', details: error.message });
    }
};
exports.getStudentCertificates = getStudentCertificates;
const generateCertificate = async (req, res) => {
    const courseId = req.params.courseId;
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    const userId = req.user.id;
    try {
        // Check if certificate already exists
        const existing = await prisma.certificate.findFirst({
            where: { userId, courseId }
        });
        if (existing) {
            res.status(200).json(existing);
            return;
        }
        // Verify student passed an assessment for this course
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });
        if (!enrollment) {
            res.status(400).json({ error: 'Student is not enrolled in this course.' });
            return;
        }
        // Find graded attempts for assessments in this course
        const attempts = await prisma.assessmentAttempt.findMany({
            where: {
                userId,
                assessment: { courseId },
                status: 'submitted',
                isPassed: true
            },
            orderBy: { score: 'desc' }
        });
        if (attempts.length === 0) {
            res.status(400).json({ error: 'No passing exam attempt found. Complete course assessment to earn a certificate.' });
            return;
        }
        const bestAttempt = attempts[0];
        const serialNumber = `ES-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}-${crypto_1.default.randomBytes(2).toString('hex').toUpperCase()}`;
        const blockchainHash = generateBlockchainHash(`${userId}:${courseId}:${serialNumber}:${bestAttempt.score}`);
        // Static URL for verification
        const verificationUrl = `http://localhost:3000/certificates/verify/${serialNumber}`;
        const certificate = await prisma.certificate.create({
            data: {
                userId,
                courseId,
                assessmentId: bestAttempt.assessmentId,
                serialNumber,
                pdfUrl: `/certificates/${serialNumber}.pdf`, // mock pdf path
                blockchainHash,
                qrCode: verificationUrl,
                isVerified: true,
                score: bestAttempt.score
            },
            include: {
                course: { select: { title: true } }
            }
        });
        // Trigger real-time notification
        try {
            await (0, socket_1.sendRealTimeNotification)({
                userId,
                type: 'certificate_issued',
                title: 'Certificate Issued! 🎓',
                message: `Congratulations! Your certificate for "${certificate.course.title}" has been issued. Serial: ${serialNumber}`,
            });
        }
        catch (notifErr) {
            console.warn('⚠️ Failed to send certificate notification:', notifErr);
        }
        res.status(201).json(certificate);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate certificate.', details: error.message });
    }
};
exports.generateCertificate = generateCertificate;
const verifyCertificate = async (req, res) => {
    const serialNumber = req.params.serialNumber;
    try {
        const cert = await prisma.certificate.findUnique({
            where: { serialNumber },
            include: {
                user: { select: { firstName: true, lastName: true } },
                course: { select: { title: true } }
            }
        });
        if (!cert) {
            res.status(404).json({ verified: false, error: 'Certificate serial number not found in registry.' });
            return;
        }
        res.status(200).json({
            verified: true,
            serialNumber: cert.serialNumber,
            studentName: `${cert.user.firstName} ${cert.user.lastName}`,
            courseTitle: cert.course.title,
            issueDate: cert.issueDate,
            blockchainHash: cert.blockchainHash,
            score: cert.score
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Verification failed.', details: error.message });
    }
};
exports.verifyCertificate = verifyCertificate;
const downloadCertificate = async (req, res) => {
    const id = req.params.id;
    try {
        const cert = await prisma.certificate.findUnique({
            where: { id },
            include: {
                user: { select: { firstName: true, lastName: true } },
                course: { select: { title: true } }
            }
        });
        if (!cert) {
            res.status(404).json({ error: 'Certificate record not found.' });
            return;
        }
        // Rather than writing bytes to a filesystem, return the mock certificate metadata
        // so the front-end can display/render a gorgeous PDF print-ready dialog.
        res.status(200).json({
            serialNumber: cert.serialNumber,
            studentName: `${cert.user.firstName} ${cert.user.lastName}`,
            courseTitle: cert.course.title,
            issueDate: cert.issueDate,
            blockchainHash: cert.blockchainHash,
            pdfUrl: cert.pdfUrl
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Download failed.', details: error.message });
    }
};
exports.downloadCertificate = downloadCertificate;
const shareCertificate = async (req, res) => {
    const id = req.params.id;
    try {
        const cert = await prisma.certificate.findUnique({
            where: { id },
            include: {
                course: { select: { title: true } }
            }
        });
        if (!cert) {
            res.status(404).json({ error: 'Certificate not found.' });
            return;
        }
        const shareUrl = `http://localhost:3000/certificates/verify/${cert.serialNumber}`;
        const text = `I am proud to share that I have completed the course "${cert.course.title}" on EduSphere LMS! Verification serial: ${cert.serialNumber}`;
        res.status(200).json({
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
            email: `mailto:?subject=${encodeURIComponent('My EduSphere Certification')}&body=${encodeURIComponent(text + '\n\nLink: ' + shareUrl)}`
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Share link generation failed.', details: error.message });
    }
};
exports.shareCertificate = shareCertificate;
