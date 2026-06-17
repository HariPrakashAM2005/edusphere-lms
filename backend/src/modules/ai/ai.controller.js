"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestLearningPath = exports.gradeEssayPrompt = exports.summarizeLesson = exports.generateQuiz = exports.getAtRiskStudents = exports.predictDropout = exports.recommendCourses = exports.chat = void 0;
const chatbot_service_1 = require("./chatbot.service");
const recommendation_service_1 = require("./recommendation.service");
const dropout_prediction_service_1 = require("./dropout-prediction.service");
const content_generation_service_1 = require("./content-generation.service");
const essay_grading_service_1 = require("./essay-grading.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Helper: Seed risk prediction records for demo if empty
const seedRiskPredictionsIfEmpty = async () => {
    try {
        const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
        for (const student of students) {
            const existing = await prisma.riskPrediction.findFirst({ where: { userId: student.id } });
            if (!existing) {
                // Run predictor to seed records
                await (0, dropout_prediction_service_1.calculateRiskScore)(student.id);
            }
        }
    }
    catch (err) {
        console.warn('⚠️ Seeding risk predictions failed.', err);
    }
};
const chat = async (req, res) => {
    const { message, courseId } = req.body;
    if (!message) {
        res.status(400).json({ error: 'Message content is required.' });
        return;
    }
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    try {
        const result = await (0, chatbot_service_1.contextAwareChat)(req.user.id, message, courseId || null);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Chatbot query failed.', details: error.message });
    }
};
exports.chat = chat;
const recommendCourses = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    try {
        const recommendations = await (0, recommendation_service_1.hybridRecommendation)(req.user.id);
        res.status(200).json(recommendations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate recommendations.', details: error.message });
    }
};
exports.recommendCourses = recommendCourses;
const predictDropout = async (req, res) => {
    const studentId = req.params.studentId;
    try {
        const riskProfile = await (0, dropout_prediction_service_1.calculateRiskScore)(studentId);
        if (!riskProfile) {
            res.status(404).json({ error: 'Student not found in registry.' });
            return;
        }
        res.status(200).json(riskProfile);
    }
    catch (error) {
        res.status(500).json({ error: 'Dropout prediction algorithm failed.', details: error.message });
    }
};
exports.predictDropout = predictDropout;
const getAtRiskStudents = async (req, res) => {
    try {
        // Seed records if empty to showcase analytics dashboard
        await seedRiskPredictionsIfEmpty();
        const predictions = await prisma.riskPrediction.findMany({
            include: {
                user: { select: { firstName: true, lastName: true, email: true } }
            },
            orderBy: { riskScore: 'desc' }
        });
        const mapped = predictions.map(p => ({
            id: p.id,
            studentId: p.userId,
            name: `${p.user.firstName} ${p.user.lastName}`,
            email: p.user.email,
            riskLevel: p.riskLevel,
            riskScore: p.riskScore,
            factors: p.factors,
            intervention: p.intervention,
            updatedAt: p.updatedAt
        }));
        res.status(200).json(mapped);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch risk predictions.', details: error.message });
    }
};
exports.getAtRiskStudents = getAtRiskStudents;
const generateQuiz = async (req, res) => {
    const { text, count, difficulty } = req.body;
    if (!text) {
        res.status(400).json({ error: 'Reference text or transcript content is required.' });
        return;
    }
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    try {
        const quiz = await (0, content_generation_service_1.generateQuizFromPDF)(text, count ? parseInt(count) : 5, difficulty || 'medium', req.user.id);
        res.status(200).json(quiz);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate quiz.', details: error.message });
    }
};
exports.generateQuiz = generateQuiz;
const summarizeLesson = async (req, res) => {
    const { transcript } = req.body;
    if (!transcript) {
        res.status(400).json({ error: 'Transcript string is required.' });
        return;
    }
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    try {
        const summary = await (0, content_generation_service_1.summarizeTranscript)(transcript, req.user.id);
        res.status(200).json({ summary });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate summary.', details: error.message });
    }
};
exports.summarizeLesson = summarizeLesson;
const gradeEssayPrompt = async (req, res) => {
    const { essay, rubric, totalMarks } = req.body;
    if (!essay || !rubric) {
        res.status(400).json({ error: 'Essay text and criteria rubric are required fields.' });
        return;
    }
    try {
        const grading = await (0, essay_grading_service_1.gradeEssay)(essay, rubric, totalMarks ? parseFloat(totalMarks) : 10);
        res.status(200).json(grading);
    }
    catch (error) {
        res.status(500).json({ error: 'Essay auto-evaluation failed.', details: error.message });
    }
};
exports.gradeEssayPrompt = gradeEssayPrompt;
const suggestLearningPath = async (req, res) => {
    const studentId = req.params.studentId;
    try {
        const student = await prisma.user.findUnique({ where: { id: studentId } });
        if (!student) {
            res.status(404).json({ error: 'Student profile not found.' });
            return;
        }
        // Extract student's average grade to optimize path recommendations
        const features = await featureExtractionMock(studentId);
        let pace = 'standard';
        let focus = 'Advanced algorithmic recursion patterns';
        if (features.grades < 50) {
            pace = 'revision-focused';
            focus = 'Review fundamental primitive scopes and linear data variables';
        }
        else if (features.grades > 85) {
            pace = 'accelerated';
            focus = 'Skip fundamental modules and advance directly to graph traversals and tree balancing';
        }
        const path = {
            studentName: `${student.firstName} ${student.lastName}`,
            pace,
            recommendedFocus: focus,
            timeline: [
                {
                    phase: 'Phase 1: Basic Scopes',
                    topics: ['JS Primitive Scopes', 'Variable declarations', 'Operator checks'],
                    status: features.grades > 50 ? 'completed' : 'recommended',
                    completionRate: features.grades > 50 ? 100 : 40
                },
                {
                    phase: 'Phase 2: Complex Structures',
                    topics: ['BST Searches', 'Time complexity bounds', 'Sorting logic swaps'],
                    status: features.grades > 85 ? 'completed' : 'recommended',
                    completionRate: features.grades > 85 ? 100 : 20
                },
                {
                    phase: 'Phase 3: Realworld Apps',
                    topics: ['NextJS routes and server components', 'SQL joins normalization', 'AI models and proctor hooks'],
                    status: 'recommended',
                    completionRate: 0
                }
            ]
        };
        res.status(200).json(path);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to suggest learning path.', details: error.message });
    }
};
exports.suggestLearningPath = suggestLearningPath;
// Internal mock helper for controller
async function featureExtractionMock(userId) {
    try {
        const attempts = await prisma.assessmentAttempt.findMany({
            where: { userId, status: 'submitted' }
        });
        if (attempts.length === 0)
            return { grades: 70 };
        const totalPct = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
        return { grades: Math.round(totalPct / attempts.length) };
    }
    catch {
        return { grades: 75 };
    }
}
