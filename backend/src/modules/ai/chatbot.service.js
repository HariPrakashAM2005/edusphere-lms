"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextAwareChat = exports.storeConversation = exports.suggestResponses = exports.detectIntent = exports.checkRateLimit = void 0;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
// In-memory rate limiting store (maps userId to array of timestamps)
const rateLimitStore = {};
// 1. Rate Limit Checks (50 requests per hour per user)
const checkRateLimit = (userId) => {
    const limit = 50;
    const windowMs = 60 * 60 * 1000; // 1 hour
    const now = Date.now();
    if (!rateLimitStore[userId]) {
        rateLimitStore[userId] = [];
    }
    // Filter out timestamps older than 1 hour
    rateLimitStore[userId] = rateLimitStore[userId].filter(timestamp => now - timestamp < windowMs);
    if (rateLimitStore[userId].length >= limit) {
        return { allowed: false, remaining: 0 };
    }
    // Log current request
    rateLimitStore[userId].push(now);
    return { allowed: true, remaining: limit - rateLimitStore[userId].length };
};
exports.checkRateLimit = checkRateLimit;
// 2. Intent Detection
const detectIntent = (message) => {
    const text = message.toLowerCase();
    const questionKeywords = ['what', 'how', 'why', 'explain', 'concept', 'where', 'when', 'who', 'help'];
    const requestKeywords = ['generate', 'create', 'download', 'cert', 'exam', 'quiz', 'report', 'list'];
    const feedbackKeywords = ['bug', 'issue', 'broken', 'slow', 'improve', 'good', 'bad', 'excellent', 'error'];
    if (questionKeywords.some(keyword => text.includes(keyword))) {
        return 'question';
    }
    if (requestKeywords.some(keyword => text.includes(keyword))) {
        return 'request';
    }
    if (feedbackKeywords.some(keyword => text.includes(keyword))) {
        return 'feedback';
    }
    return 'general';
};
exports.detectIntent = detectIntent;
// 3. Quick Reply Suggestion Generator
const suggestResponses = (intent) => {
    switch (intent) {
        case 'question':
            return [
                'Explain React state vs props',
                'Check my current attendance percentage',
                'When is my next sorting quiz?'
            ];
        case 'request':
            return [
                'Generate a sorting practice quiz',
                'Claim my course certificate',
                'Show my personalized recommendations'
            ];
        case 'feedback':
            return [
                'Report a webcam proctoring issue',
                'Submit attendance feedback',
                'Contact my course instructor'
            ];
        case 'general':
        default:
            return [
                'How can I get more XP?',
                'Tell me about EduSphere',
                'Show my learning path timeline'
            ];
    }
};
exports.suggestResponses = suggestResponses;
// 4. Conversation database store (acting as persistent fallback)
const storeConversation = async (userId, courseId, messages) => {
    try {
        const existing = await prisma.chatConversation.findFirst({
            where: { userId, courseId }
        });
        if (existing) {
            return await prisma.chatConversation.update({
                where: { id: existing.id },
                data: {
                    messages: messages
                }
            });
        }
        else {
            return await prisma.chatConversation.create({
                data: {
                    userId,
                    courseId,
                    messages: messages
                }
            });
        }
    }
    catch (err) {
        console.error('Failed to store conversation logs', err.message);
        return null;
    }
};
exports.storeConversation = storeConversation;
// 5. Context Aware Chat Engine (OpenAI with rule-based fallback)
const contextAwareChat = async (userId, userMessage, courseId) => {
    // Rate limit validation
    const rateLimitStatus = (0, exports.checkRateLimit)(userId);
    if (!rateLimitStatus.allowed) {
        return {
            reply: 'Rate limit exceeded. You can send up to 50 queries per hour. Please wait a bit before requesting again.',
            intent: 'general',
            suggestions: ['Show rate limits schedule']
        };
    }
    const intent = (0, exports.detectIntent)(userMessage);
    const suggestions = (0, exports.suggestResponses)(intent);
    // Retrieve course context metadata if courseId is passed
    let courseContextPrompt = '';
    if (courseId) {
        try {
            const course = await prisma.course.findUnique({ where: { id: courseId } });
            if (course) {
                courseContextPrompt = `You are discussing the EduSphere course "${course.title}". Scope description: "${course.description}". `;
            }
        }
        catch (err) {
            console.warn('⚠️ Could not fetch course context.');
        }
    }
    // If OpenAI API key exists, make HTTP request
    if (OPENAI_API_KEY) {
        try {
            // Fetch previous messages to maintain context
            let prevMessages = [];
            const existing = await prisma.chatConversation.findFirst({ where: { userId, courseId } });
            if (existing && Array.isArray(existing.messages)) {
                prevMessages = existing.messages;
            }
            const systemPrompt = `You are Antigravity, a helpful AI tutor for the EduSphere LMS portal. ${courseContextPrompt}Keep responses concise and formatted in GitHub-style Markdown.`;
            const payloadMessages = [
                { role: 'system', content: systemPrompt },
                ...prevMessages.map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userMessage }
            ];
            const response = await axios_1.default.post(OPENAI_API_URL, {
                model: 'gpt-4o',
                messages: payloadMessages,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const aiReply = response.data.choices[0].message.content;
            // Update DB conversation
            const newLogs = [
                ...prevMessages,
                { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
                { role: 'assistant', content: aiReply, timestamp: new Date().toISOString() }
            ];
            await (0, exports.storeConversation)(userId, courseId, newLogs.slice(-10)); // save last 10 messages
            return { reply: aiReply, intent, suggestions };
        }
        catch (apiErr) {
            console.warn('⚠️ OpenAI ChatCompletion failed, running rule-based tutoring fallback.', apiErr.message);
        }
    }
    // High-fidelity rule-based chatbot fallback
    const reply = generateRuleBasedReply(userMessage, courseContextPrompt);
    // Sync DB logs
    try {
        let prevLogs = [];
        const existing = await prisma.chatConversation.findFirst({ where: { userId, courseId } });
        if (existing && Array.isArray(existing.messages)) {
            prevLogs = existing.messages;
        }
        const newLogs = [
            ...prevLogs,
            { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
            { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
        ];
        await (0, exports.storeConversation)(userId, courseId, newLogs.slice(-10));
    }
    catch (err) {
        // proceed
    }
    return { reply, intent, suggestions };
};
exports.contextAwareChat = contextAwareChat;
// Generates specific rule-based responses matching keywords
const generateRuleBasedReply = (message, contextPrompt) => {
    const text = message.toLowerCase();
    let contextNote = '';
    if (contextPrompt) {
        contextNote = `*(Discussing course context: ${contextPrompt.split('"')[1]})*\n\n`;
    }
    // 1. Attendance checks
    if (text.includes('attendance') || text.includes('present') || text.includes('absent')) {
        return `${contextNote}To check your current attendance records, navigate to the **Attendance History** tab on the sidebar. If your attendance rate is below **75%**, a red warning banner will alert you of final exam disqualification risk. You can log attendance using the **Mark Attendance** camera portal.`;
    }
    // 2. Certificate checks
    if (text.includes('certificate') || text.includes('cert') || text.includes('claim')) {
        return `${contextNote}You earn verifiable certificates by completing all course assessments and obtaining a score above the passing score of **50%**. Go to the **Exams & Certs** page on your dashboard to claim your certificate badge containing SHA-256 blockchain verification hashes.`;
    }
    // 3. Quiz checks
    if (text.includes('quiz') || text.includes('exam') || text.includes('test')) {
        return `${contextNote}You can view assigned quizzes on the **Exams & Certs** portal. Proctored exams require fullscreen browser modes and will log tab switching events. MCQs and True/False tasks are auto-graded immediately upon submission.`;
    }
    // 4. General programming/React checks
    if (text.includes('react') || text.includes('state') || text.includes('prop')) {
        return `${contextNote}In React, **State** represents internal component data that can change over time, triggering re-renders. **Props** are read-only properties passed down from parent to child components to configure them.\n\n\`\`\`javascript\n// Example state usage\nconst [count, setCount] = useState(0);\n\`\`\``;
    }
    // 5. Sorting algorithms/complexity checks
    if (text.includes('sorting') || text.includes('complexity') || text.includes('big o')) {
        return `${contextNote}Here is a quick reference table of sorting complexities:\n\n| Algorithm | Best Time | Average Time | Space Complexity |\n|---|---|---|---|\n| **Quick Sort** | O(n log n) | O(n log n) | O(log n) |\n| **Merge Sort** | O(n log n) | O(n log n) | O(n) |\n| **Bubble Sort** | O(n) | O(n^2) | O(1) |\n\nLet me know if you would like me to generate a practice quiz on these concepts!`;
    }
    // 6. Generic greetings
    return `${contextNote}Hello! I am Antigravity, your AI-powered learning companion. I can help explain coding concepts, generate practice quizzes, show your attendance requirements, or verify certification processes. Ask me anything!`;
};
