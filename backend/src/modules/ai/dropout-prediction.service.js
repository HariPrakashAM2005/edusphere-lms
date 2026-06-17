"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleAlert = exports.calculateRiskScore = exports.generateIntervention = exports.predictWithModel = exports.featureExtraction = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 1. Feature Extraction (Calculates attendance rate, exam grades, mock login metrics)
const featureExtraction = async (userId) => {
    try {
        // 1. Calculate attendance rate
        const enrollments = await prisma.enrollment.findMany({ where: { userId } });
        const enrollmentIds = enrollments.map(e => e.id);
        let attendanceRate = 85; // default benchmark
        if (enrollmentIds.length > 0) {
            const attendanceRecords = await prisma.attendance.findMany({
                where: { enrollmentId: { in: enrollmentIds } }
            });
            if (attendanceRecords.length > 0) {
                const present = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'excused').length;
                attendanceRate = Math.round((present / attendanceRecords.length) * 100);
            }
        }
        // 2. Calculate average quiz score percentage
        const attempts = await prisma.assessmentAttempt.findMany({
            where: { userId, status: 'submitted' }
        });
        let gradesAvg = 70; // default benchmark
        if (attempts.length > 0) {
            const totalPct = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
            gradesAvg = Math.round(totalPct / attempts.length);
        }
        // 3. Login frequency: simulated based on completed lessons/active enrollments
        let loginFrequency = 4; // average weekly logins
        if (enrollments.length === 0)
            loginFrequency = 1;
        else if (attempts.length > 3)
            loginFrequency = 6;
        else if (attendanceRate < 60)
            loginFrequency = 2;
        return {
            attendance: attendanceRate,
            grades: gradesAvg,
            loginFrequency
        };
    }
    catch (err) {
        return { attendance: 82, grades: 74, loginFrequency: 4 };
    }
};
exports.featureExtraction = featureExtraction;
// 2. ML Prediction Simulator (simulates ONNX weights evaluation)
const predictWithModel = (features) => {
    // Formula mimicking weights of a linear logistic model
    // attendance weight: 50%, grades weight: 35%, logins weight: 15%
    const attendanceRisk = (100 - features.attendance) * 0.50;
    const gradesRisk = (100 - features.grades) * 0.35;
    const loginRisk = Math.max((6 - features.loginFrequency) * 16.6, 0) * 0.15;
    const rawScore = attendanceRisk + gradesRisk + loginRisk;
    return Math.min(Math.max(Math.round(rawScore), 0), 100); // bound between 0 and 100
};
exports.predictWithModel = predictWithModel;
// 3. Outreach Intervention template creator
const generateIntervention = (riskLevel, name) => {
    switch (riskLevel) {
        case 'high':
            return `Dear ${name},\n\nOur learning support metrics indicate you are falling behind in lecture attendance and course checkpoints. We want to support your academic progress. Please schedule a counseling session during our offline support hours: http://calendly.com/edusphere-advisor\n\nBest,\nEduSphere support.`;
        case 'medium':
            return `Dear ${name},\n\nThis is a friendly reminder to review outstanding course materials and assignments on your dashboard. Completing quizzes on time is key to exam eligibility. Check our supplementary tutorials here: http://localhost:3000/dashboard/student/courses\n\nBest,\nEduSphere team.`;
        case 'low':
        default:
            return `Dear ${name},\n\nExcellent job! You are fully compliant with all course attendance and grading benchmarks. Keep up the high learning momentum!\n\nBest,\nEduSphere team.`;
    }
};
exports.generateIntervention = generateIntervention;
// 4. riskProfile calculator orchestrator
const calculateRiskScore = async (studentId) => {
    try {
        const student = await prisma.user.findUnique({
            where: { id: studentId }
        });
        if (!student)
            return null;
        const features = await (0, exports.featureExtraction)(studentId);
        const riskScore = (0, exports.predictWithModel)(features);
        let riskLevel = 'low';
        if (riskScore >= 70)
            riskLevel = 'high';
        else if (riskScore >= 35)
            riskLevel = 'medium';
        const intervention = (0, exports.generateIntervention)(riskLevel, `${student.firstName} ${student.lastName}`);
        // Update risk prediction table
        try {
            const existing = await prisma.riskPrediction.findFirst({
                where: { userId: studentId }
            });
            if (existing) {
                await prisma.riskPrediction.update({
                    where: { id: existing.id },
                    data: {
                        riskLevel,
                        riskScore,
                        factors: features,
                        intervention
                    }
                });
            }
            else {
                await prisma.riskPrediction.create({
                    data: {
                        userId: studentId,
                        riskLevel,
                        riskScore,
                        factors: features,
                        intervention
                    }
                });
            }
        }
        catch (dbErr) {
            console.warn('⚠️ Could not update RiskPrediction table, proceeding with local calculations.');
        }
        return {
            studentId,
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
            riskLevel,
            riskScore,
            factors: features,
            intervention
        };
    }
    catch (error) {
        console.error('Failed to predict dropout metrics', error.message);
        return null;
    }
};
exports.calculateRiskScore = calculateRiskScore;
// 5. Weekly alerts log mock
const scheduleAlert = () => {
    console.log('🗓️ Weekly automated proctoring at-risk email dispatch schedule active.');
    return { status: 'active', cron: '0 0 * * 0' }; // weekly sunday
};
exports.scheduleAlert = scheduleAlert;
