"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProctoringReport = exports.detectSuspicious = exports.logFullscreenExit = exports.captureWebcam = exports.logTabSwitch = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const logTabSwitch = async (attemptId, details) => {
    try {
        return await prisma.proctoringLog.create({
            data: {
                attemptId,
                eventType: 'tab_switch',
                details: details || { description: 'User switched browser tabs' }
            }
        });
    }
    catch (err) {
        console.error('Failed to log tab switch', err.message);
        return null;
    }
};
exports.logTabSwitch = logTabSwitch;
const captureWebcam = async (attemptId, base64Snapshot) => {
    try {
        // If the image is extremely large, we can store a reference/message instead of the raw base64.
        // However, to keep it simple and runnable, we save it inside the json details field directly.
        return await prisma.proctoringLog.create({
            data: {
                attemptId,
                eventType: 'webcam_snapshot',
                details: {
                    snapshot: base64Snapshot.slice(0, 100000), // slice if it's too massive, or store entire base64
                    description: 'Automated 30s webcam capture integrity checkpoint'
                }
            }
        });
    }
    catch (err) {
        console.error('Failed to log webcam snapshot', err.message);
        return null;
    }
};
exports.captureWebcam = captureWebcam;
const logFullscreenExit = async (attemptId, details) => {
    try {
        return await prisma.proctoringLog.create({
            data: {
                attemptId,
                eventType: 'fullscreen_exit',
                details: details || { description: 'User exited fullscreen exam player' }
            }
        });
    }
    catch (err) {
        console.error('Failed to log fullscreen exit', err.message);
        return null;
    }
};
exports.logFullscreenExit = logFullscreenExit;
const detectSuspicious = async (attemptId) => {
    try {
        const logs = await prisma.proctoringLog.findMany({
            where: { attemptId }
        });
        const tabSwitches = logs.filter(log => log.eventType === 'tab_switch').length;
        const fullscreenExits = logs.filter(log => log.eventType === 'fullscreen_exit').length;
        if (tabSwitches > 4) {
            return {
                flagged: true,
                reason: `Excessive tab switching detected: ${tabSwitches} times.`
            };
        }
        if (fullscreenExits > 2) {
            return {
                flagged: true,
                reason: `Multiple fullscreen exits detected: ${fullscreenExits} times.`
            };
        }
        return { flagged: false, reason: 'Normal behaviour observed.' };
    }
    catch (err) {
        return { flagged: false, reason: 'Log retrieval error.' };
    }
};
exports.detectSuspicious = detectSuspicious;
const generateProctoringReport = async (attemptId) => {
    try {
        const attempt = await prisma.assessmentAttempt.findUnique({
            where: { id: attemptId },
            include: {
                user: true,
                assessment: true,
                proctoringLogRecords: true
            }
        });
        if (!attempt)
            return null;
        const logs = attempt.proctoringLogRecords;
        const tabSwitches = logs.filter(log => log.eventType === 'tab_switch');
        const fullscreenExits = logs.filter(log => log.eventType === 'fullscreen_exit');
        const webcamSnaps = logs.filter(log => log.eventType === 'webcam_snapshot');
        const analysis = await (0, exports.detectSuspicious)(attemptId);
        return {
            attemptId,
            studentName: `${attempt.user.firstName} ${attempt.user.lastName}`,
            studentEmail: attempt.user.email,
            examTitle: attempt.assessment.title,
            startTime: attempt.startTime,
            endTime: attempt.endTime,
            isFlagged: analysis.flagged,
            flagReason: analysis.reason,
            summary: {
                totalTabSwitches: tabSwitches.length,
                totalFullscreenExits: fullscreenExits.length,
                totalWebcamCheckpoints: webcamSnaps.length,
                violations: [...tabSwitches, ...fullscreenExits].map(v => ({
                    eventType: v.eventType,
                    time: v.timestamp,
                    details: v.details
                }))
            }
        };
    }
    catch (err) {
        console.error('Failed to generate proctoring report', err.message);
        return null;
    }
};
exports.generateProctoringReport = generateProctoringReport;
