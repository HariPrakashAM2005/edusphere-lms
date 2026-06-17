import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendRealTimeNotification, emitAssessmentSubmitted } from '../../socket';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { gradeSubmission, calculateScore } from './auto-grading.service';
import { generateRandomQuestions, shuffleOptions } from './question-bank.service';
import { generateProctoringReport } from './proctoring.service';

const prisma = new PrismaClient();

// Helper: Ensure mock assessments exist if DB is empty (helps demo and standalone verification)
const seedMockAssessmentsIfEmpty = async (courseId: string, createdBy: string) => {
  try {
    const existing = await prisma.assessment.findFirst({ where: { courseId } });
    if (!existing) {
      const newAssessment = await prisma.assessment.create({
        data: {
          title: 'Introduction to Algorithms Quiz',
          description: 'A mock evaluation covering sorting algorithms and tree traversals.',
          type: 'quiz',
          courseId,
          createdBy,
          duration: 30, // 30 mins
          passingScore: 50,
          totalMarks: 32, // total MCQ/TF/Coding marks
          isProctored: true,
          published: true
        }
      });
      await generateRandomQuestions(newAssessment.id, 6);
    }
  } catch (err) {
    console.warn('⚠️ Seeding mock assessments failed.', err);
  }
};

export const createAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, description, type, courseId, duration, passingScore, questions, isProctored } = req.body;

  if (!title || !type || !courseId) {
    res.status(400).json({ error: 'Title, type, and courseId are required parameters.' });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const createdBy = req.user.id;

  try {
    // Calculate total marks from questions
    const questionsList = Array.isArray(questions) ? questions : [];
    const totalMarks = questionsList.reduce((sum: number, q: any) => sum + (parseFloat(q.marks) || 0), 0);

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        type,
        courseId,
        createdBy,
        duration: duration ? parseInt(duration) : null,
        passingScore: passingScore ? parseFloat(passingScore) : 40,
        totalMarks,
        isProctored: !!isProctored,
        published: false
      }
    });

    // Save nested questions
    if (questionsList.length > 0) {
      await prisma.question.createMany({
        data: questionsList.map((q: any, index: number) => ({
          assessmentId: assessment.id,
          text: q.text,
          type: q.type,
          options: q.options ? (q.options as any) : undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          marks: parseFloat(q.marks) || 1,
          difficulty: parseInt(q.difficulty) || 3,
          order: index + 1
        }))
      });
    }

    res.status(201).json({
      message: 'Assessment created successfully as draft.',
      assessmentId: assessment.id
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create assessment.', details: error.message });
  }
};

export const getAssessments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const courseId = req.params.courseId as string;

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    // Seed mock quiz if DB is empty to showcase screens
    await seedMockAssessmentsIfEmpty(courseId, req.user.id);

    const assessments = await prisma.assessment.findMany({
      where: { courseId },
      include: {
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(assessments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch assessments.', details: error.message });
  }
};

export const getStudentUpcoming = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    // Fetch published assessments across student's enrolled courses
    const studentEnrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id, isActive: true },
      select: { courseId: true }
    });

    const courseIds = studentEnrollments.map(e => e.courseId);

    // Seed mock data for student if none exist
    if (courseIds.length > 0) {
      await seedMockAssessmentsIfEmpty(courseIds[0], req.user.id);
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        courseId: { in: courseIds },
        published: true
      },
      include: {
        course: { select: { title: true } },
        attempts: {
          where: { userId: req.user.id }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map: include a status for the student (unstarted, completed)
    const mapped = assessments.map(a => {
      const studentAttempt = a.attempts[0];
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        type: a.type,
        courseTitle: a.course.title,
        courseId: a.courseId,
        duration: a.duration,
        totalMarks: a.totalMarks,
        isProctored: a.isProctored,
        attemptStatus: studentAttempt ? studentAttempt.status : 'not-started',
        attemptId: studentAttempt ? studentAttempt.id : null,
        score: studentAttempt ? studentAttempt.score : null
      };
    });

    res.status(200).json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch student upcoming assessments.', details: error.message });
  }
};

export const getAssessmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found.' });
      return;
    }

    // Hide answers if student is fetching before submit
    const isStudent = req.user?.role === 'STUDENT';
    const cleanQuestions = assessment.questions.map(q => {
      // Shuffle options for MCQ
      let optionsList = null;
      if (q.options) {
        optionsList = shuffleOptions(q.options);
      }

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        options: optionsList,
        marks: q.marks,
        difficulty: q.difficulty,
        order: q.order,
        ...(isStudent ? {} : { correctAnswer: q.correctAnswer, explanation: q.explanation })
      };
    });

    res.status(200).json({
      ...assessment,
      questions: cleanQuestions
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch assessment details.', details: error.message });
  }
};

export const startAttempt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const assessmentId = req.params.id as string;

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const userId = req.user.id;

  try {
    // Check if attempt already exists
    const existing = await prisma.assessmentAttempt.findFirst({
      where: { userId, assessmentId, status: 'in-progress' }
    });

    if (existing) {
      res.status(200).json({
        message: 'Resuming previous exam attempt.',
        attemptId: existing.id,
        startTime: existing.startTime
      });
      return;
    }

    // Create new attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentId,
        startTime: new Date(),
        status: 'in-progress'
      }
    });

    res.status(200).json({
      message: 'Exam session started successfully.',
      attemptId: attempt.id,
      startTime: attempt.startTime
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to start exam attempt.', details: error.message });
  }
};

export const submitAttempt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const attemptId = req.params.attemptId as string;
  const { answers } = req.body; // Array of { questionId: string, answer: string }

  try {
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        assessment: {
          include: { questions: true }
        }
      }
    });

    if (!attempt) {
      res.status(404).json({ error: 'Attempt record not found.' });
      return;
    }

    if (attempt.status !== 'in-progress') {
      res.status(400).json({ error: 'Exam has already been submitted or timed-out.' });
      return;
    }

    const submissions: any[] = Array.isArray(answers) ? answers : [];
    const questions = attempt.assessment.questions;

    const gradedAnswers = [];

    // Grade each submission
    for (const q of questions) {
      const sub = submissions.find(s => s.questionId === q.id);
      const studentAnsText = sub ? sub.answer : '';

      const graded = await gradeSubmission(q, studentAnsText);

      // Save answer in DB
      const savedAnswer = await prisma.answer.create({
        data: {
          attemptId,
          questionId: q.id,
          answer: studentAnsText,
          isCorrect: graded.isCorrect,
          marksAwarded: graded.marksAwarded,
          feedback: graded.feedback
        },
        include: {
          question: { select: { type: true } }
        }
      });
      gradedAnswers.push(savedAnswer);
    }

    // Score computation
    const gradingStats = calculateScore(
      gradedAnswers.map(ans => ({
        marksAwarded: ans.marksAwarded || 0,
        isCorrect: !!ans.isCorrect,
        question: { type: ans.question.type }
      })),
      attempt.assessment.totalMarks,
      attempt.assessment.passingScore
    );

    // Update attempt
    const updatedAttempt = await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        endTime: new Date(),
        score: gradingStats.score,
        percentage: gradingStats.percentage,
        isPassed: gradingStats.isPassed,
        status: 'submitted'
      }
    });

    // Trigger real-time notification
    try {
      const isQuiz = attempt.assessment.type === 'quiz' || attempt.assessment.type === 'exam';
      const eventType = isQuiz ? 'quiz_result_available' : 'assignment_graded';
      const eventTitle = isQuiz ? 'Quiz Result Available' : 'Assignment Graded';
      const eventMessage = isQuiz
        ? `Your results for "${attempt.assessment.title}" are now available. Score: ${gradingStats.score}/${attempt.assessment.totalMarks} (${gradingStats.percentage}%)`
        : `Your assignment "${attempt.assessment.title}" has been graded. Score: ${gradingStats.score}/${attempt.assessment.totalMarks} (${gradingStats.percentage}%)`;

      await sendRealTimeNotification({
        userId: attempt.userId,
        type: eventType,
        title: eventTitle,
        message: eventMessage,
      });
    } catch (notifErr) {
      console.warn('⚠️ Failed to send assessment notification:', notifErr);
    }

    // Broadcast submission event to connected clients (like Admin Panel)
    try {
      const studentName = `${attempt.user.firstName} ${attempt.user.lastName}`;
      emitAssessmentSubmitted(attempt.assessmentId, studentName, attempt.assessment.title, attempt.id);
    } catch (broadcastErr) {
      console.warn('⚠️ Failed to broadcast assessment submission event:', broadcastErr);
    }

    res.status(200).json({
      message: 'Exam submitted successfully.',
      score: updatedAttempt.score,
      percentage: updatedAttempt.percentage,
      isPassed: updatedAttempt.isPassed
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit exam attempt.', details: error.message });
  }
};

export const getResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const assessmentId = req.params.id as string;

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const userId = req.user.id;

  try {
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: { userId, assessmentId, status: 'submitted' },
      include: {
        assessment: {
          include: { course: true }
        },
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { endTime: 'desc' }
    });

    if (!attempt) {
      res.status(404).json({ error: 'No graded attempt found for this assessment.' });
      return;
    }

    // Calculate rank
    const allAttempts = await prisma.assessmentAttempt.findMany({
      where: { assessmentId, status: 'submitted' },
      orderBy: { score: 'desc' }
    });

    const rank = allAttempts.findIndex(a => a.userId === userId) + 1;

    // Fetch certificate if it has already been claimed
    const certificate = await prisma.certificate.findFirst({
      where: { userId, courseId: attempt.assessment.courseId }
    });

    const certificateWithTitle = certificate ? {
      ...certificate,
      courseTitle: attempt.assessment.course.title
    } : null;

    res.status(200).json({
      attemptId: attempt.id,
      title: attempt.assessment.title,
      type: attempt.assessment.type,
      courseTitle: attempt.assessment.course.title,
      courseId: attempt.assessment.courseId,
      score: attempt.score,
      totalMarks: attempt.assessment.totalMarks,
      percentage: attempt.percentage,
      isPassed: attempt.isPassed,
      endTime: attempt.endTime,
      rank,
      totalStudents: allAttempts.length,
      certificate: certificateWithTitle,
      answers: attempt.answers.map(ans => ({
        id: ans.id,
        questionId: ans.questionId,
        questionText: ans.question.text,
        studentAnswer: ans.answer,
        correctAnswer: ans.question.correctAnswer,
        explanation: ans.question.explanation,
        isCorrect: ans.isCorrect,
        marksAwarded: ans.marksAwarded,
        totalQuestionMarks: ans.question.marks,
        feedback: ans.feedback
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch attempt results.', details: error.message });
  }
};

export const getResultsRank = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const assessmentId = req.params.id as string;

  try {
    const leaderboard = await prisma.assessmentAttempt.findMany({
      where: { assessmentId, status: 'submitted' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { score: 'desc' }
    });

    const mapped = leaderboard.map((l, index) => ({
      rank: index + 1,
      name: `${l.user.firstName} ${l.user.lastName}`,
      score: l.score,
      percentage: l.percentage,
      isPassed: l.isPassed
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch exam leaderboard.', details: error.message });
  }
};

export const getAssessmentAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        attempts: {
          where: { status: 'submitted' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        },
        questions: true
      }
    });

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found.' });
      return;
    }

    const totalAttempts = assessment.attempts.length;
    let averageScore = 0;
    let highestScore = 0;
    let lowestScore = 0;
    let passRate = 100;

    if (totalAttempts > 0) {
      const scores = assessment.attempts.map(a => a.score || 0);
      averageScore = parseFloat((scores.reduce((sum, s) => sum + s, 0) / totalAttempts).toFixed(1));
      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);

      const passed = assessment.attempts.filter(a => a.isPassed).length;
      passRate = Math.round((passed / totalAttempts) * 100);
    }

    // Proctoring violations summary
    const violationsLog: any[] = [];
    for (const a of assessment.attempts) {
      const rep = await generateProctoringReport(a.id);
      if (rep && (rep.isFlagged || rep.summary.totalTabSwitches > 0)) {
        violationsLog.push({
          studentName: rep.studentName,
          studentEmail: rep.studentEmail,
          attemptId: rep.attemptId,
          tabSwitches: rep.summary.totalTabSwitches,
          fullscreenExits: rep.summary.totalFullscreenExits,
          reason: rep.flagReason
        });
      }
    }

    // Student ranks mapping
    const rankings = assessment.attempts
      .map(a => ({
        name: `${a.user.firstName} ${a.user.lastName}`,
        email: a.user.email,
        score: a.score,
        percentage: a.percentage,
        isPassed: a.isPassed,
        durationMinutes: a.endTime 
          ? Math.round((new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000)
          : 0
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    res.status(200).json({
      title: assessment.title,
      type: assessment.type,
      totalMarks: assessment.totalMarks,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      totalAttempts,
      rankings,
      proctoringViolations: violationsLog
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch assessment analytics.', details: error.message });
  }
};

export const publishResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    const updated = await prisma.assessment.update({
      where: { id },
      data: { published: true }
    });

    res.status(200).json({
      message: 'Assessment results published successfully.',
      published: updated.published
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to publish assessment results.', details: error.message });
  }
};

export const getAssessmentAttempts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const assessmentId = req.params.id as string;

  try {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { assessmentId, status: { in: ['submitted', 'graded'] } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assessment: {
          select: {
            totalMarks: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    const mapped = attempts.map(att => ({
      id: att.id,
      studentName: `${att.user.firstName} ${att.user.lastName}`,
      studentEmail: att.user.email,
      submittedAt: att.endTime ? new Date(att.endTime).toISOString().replace('T', ' ').slice(0, 16) : 'In Progress',
      status: att.status === 'graded' ? 'Graded' : 'Pending',
      score: att.score || 0,
      totalMarks: att.assessment.totalMarks,
      answers: att.answers.map(ans => ({
        questionId: ans.questionId,
        questionText: ans.question.text,
        type: ans.question.type,
        maxMarks: ans.question.marks,
        studentAnswer: ans.answer,
        correctAnswer: ans.question.correctAnswer,
        marksAwarded: ans.marksAwarded || 0,
        feedback: ans.feedback || ''
      }))
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch assessment attempts.', details: error.message });
  }
};

export const gradeAttempt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const attemptId = req.params.attemptId as string;
  const { answers } = req.body; // Array of { questionId: string, marksAwarded: number, feedback: string }

  try {
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: { questions: true }
        },
        user: true
      }
    });

    if (!attempt) {
      res.status(404).json({ error: 'Attempt record not found.' });
      return;
    }

    // Update each answer in the database
    for (const ansData of answers) {
      const question = attempt.assessment.questions.find(q => q.id === ansData.questionId);
      const maxMarks = question ? question.marks : 0;
      const marksAwarded = Math.min(maxMarks, Math.max(0, ansData.marksAwarded));
      const isCorrect = question ? (marksAwarded === maxMarks) : false;

      // Update the Answer row
      await prisma.answer.updateMany({
        where: {
          attemptId,
          questionId: ansData.questionId
        },
        data: {
          marksAwarded,
          feedback: ansData.feedback,
          isCorrect
        }
      });
    }

    // Recalculate total score for this attempt
    const updatedAnswers = await prisma.answer.findMany({
      where: { attemptId }
    });

    const totalScore = updatedAnswers.reduce((sum, ans) => sum + (ans.marksAwarded || 0), 0);
    const percentage = attempt.assessment.totalMarks > 0
      ? parseFloat(((totalScore / attempt.assessment.totalMarks) * 100).toFixed(2))
      : 0;
    const isPassed = percentage >= attempt.assessment.passingScore;

    // Update the attempt with final score, percentage, passing status, and set status to 'graded'
    const updatedAttempt = await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        score: totalScore,
        percentage,
        isPassed,
        status: 'graded'
      }
    });

    // Send real-time notification to the student
    try {
      await sendRealTimeNotification({
        userId: attempt.userId,
        type: 'assignment_graded',
        title: 'Assessment Graded (Real-time)',
        message: `Your exam "${attempt.assessment.title}" has been graded. Score: ${totalScore}/${attempt.assessment.totalMarks} (${percentage}%). Feedback: ${answers.map((a: any) => a.feedback).filter(Boolean).join('. ') || 'Well done!'}`,
      });
    } catch (notifErr) {
      console.warn('⚠️ Failed to send grading notification:', notifErr);
    }

    res.status(200).json({
      message: 'Grade submitted successfully.',
      attempt: updatedAttempt
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to grade attempt.', details: error.message });
  }
};
