"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomQuestions = exports.getDifficultyDistribution = exports.shuffleOptions = exports.shuffleArray = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Helper: Shuffles array elements in place (Fisher-Yates)
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};
exports.shuffleArray = shuffleArray;
// Shuffles MCQ options stored as a JSON array or string list
const shuffleOptions = (options) => {
    if (!options)
        return null;
    try {
        const list = typeof options === 'string' ? JSON.parse(options) : options;
        if (Array.isArray(list)) {
            return (0, exports.shuffleArray)(list);
        }
        return options;
    }
    catch (err) {
        return options;
    }
};
exports.shuffleOptions = shuffleOptions;
// Returns difficulty distributions of existing questions in assessment
const getDifficultyDistribution = async (assessmentId) => {
    try {
        const questions = await prisma.question.findMany({
            where: { assessmentId }
        });
        const total = questions.length;
        if (total === 0)
            return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        questions.forEach((q) => {
            const diff = q.difficulty || 3;
            dist[diff] = (dist[diff] || 0) + 1;
        });
        // Convert to percentages
        const percentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        Object.keys(dist).forEach((key) => {
            const num = parseInt(key);
            percentages[num] = Math.round((dist[num] / total) * 100);
        });
        return {
            count: dist,
            percentage: percentages,
            average: parseFloat((questions.reduce((sum, q) => sum + q.difficulty, 0) / total).toFixed(1))
        };
    }
    catch (err) {
        console.error('Failed to analyze difficulty distribution', err.message);
        return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, average: 3 };
    }
};
exports.getDifficultyDistribution = getDifficultyDistribution;
// Mock bank of questions for automatic generation when database is empty
const MOCK_QUESTION_BANK = [
    { text: 'Which of the following is NOT a fundamental primitive type in JavaScript?', type: 'mcq', options: ['String', 'Number', 'Array', 'Boolean'], correctAnswer: 'Array', explanation: 'Array is a structured object, whereas String, Number, and Boolean are primitives.', marks: 5, difficulty: 2 },
    { text: 'What is the time complexity of searching in a balanced binary search tree?', type: 'mcq', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correctAnswer: 'O(log n)', explanation: 'Searching in a balanced BST halves the search space at each step, yielding logarithmic complexity.', marks: 5, difficulty: 3 },
    { text: 'Is CSS3 a programming language?', type: 'truefalse', options: ['True', 'False'], correctAnswer: 'False', explanation: 'CSS is a style sheet language, not a programming language as it lacks control flow logic.', marks: 3, difficulty: 1 },
    { text: 'What is the output of 2 + "2" in JavaScript?', type: 'fillblank', correctAnswer: '22', explanation: 'JavaScript performs string concatenation when one of the operands is a string.', marks: 4, difficulty: 2 },
    { text: 'Write a python function `is_even(n)` that returns `True` if a number is even, and `False` otherwise.', type: 'coding', correctAnswer: 'def is_even(n):\n    return n % 2 == 0', explanation: 'Evaluating modulo 2 returns 0 for all even numbers.', marks: 10, difficulty: 2 },
    { text: 'Compare and contrast SQL vs NoSQL databases in terms of scalability, consistency, and schema rules.', type: 'essay', correctAnswer: '', explanation: 'Graded manually.', marks: 15, difficulty: 4 }
];
// Generates and saves random questions to an assessment
const generateRandomQuestions = async (assessmentId, count = 5) => {
    try {
        const createdQuestions = [];
        const questionsToCreate = (0, exports.shuffleArray)(MOCK_QUESTION_BANK).slice(0, count);
        for (let i = 0; i < questionsToCreate.length; i++) {
            const q = questionsToCreate[i];
            const newQ = await prisma.question.create({
                data: {
                    assessmentId,
                    text: q.text,
                    type: q.type,
                    options: q.options ? q.options : undefined,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    marks: q.marks,
                    difficulty: q.difficulty,
                    order: i + 1
                }
            });
            createdQuestions.push(newQ);
        }
        return createdQuestions;
    }
    catch (err) {
        console.error('Failed to generate random questions', err.message);
        return [];
    }
};
exports.generateRandomQuestions = generateRandomQuestions;
