import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

const prisma = new PrismaClient();

// In-memory mock databases for non-existent schema tables
interface EnrolledCourse {
  courseId: string;
  title: string;
  description: string;
  progress: number;
  category: string;
  instructor: string;
  nextDeadline: string;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  completed: boolean;
  xpValue: number;
}

interface XPProgress {
  date: string;
  xp: number;
}

interface Deadline {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  type: 'assignment' | 'exam';
}

// User-specific mock storage
const userCourses = new Map<string, EnrolledCourse[]>();
const userCourseDetails = new Map<string, Map<string, Module[]>>();
const userXpProgress = new Map<string, XPProgress[]>();
const userDeadlines = new Map<string, Deadline[]>();
const userStreaks = new Map<string, number>(); // user id -> streak count

// Initialize data helper
const initUserDashboardData = (userId: string) => {
  if (!userCourses.has(userId)) {
    // 1. Mock enrolled courses
    userCourses.set(userId, [
      {
        courseId: 'course-1',
        title: 'Introduction to Computer Science',
        description: 'Learn the fundamentals of computer science including programming, algorithms, and data structures.',
        progress: 33,
        category: 'Computer Science',
        instructor: 'Dr. Ramesh Kumar',
        nextDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        courseId: 'course-2',
        title: 'Responsive Web Design Basics',
        description: 'Master HTML5, CSS3, and responsive design layouts for modern web pages.',
        progress: 50,
        category: 'Web Development',
        instructor: 'Prof. Anjali Sharma',
        nextDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        courseId: 'course-3',
        title: 'Data Structures and Algorithms',
        description: 'Dive deep into stacks, queues, trees, search, sorting, and dynamic programming.',
        progress: 0,
        category: 'Computer Science',
        instructor: 'Dr. Ramesh Kumar',
        nextDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]);

    // 2. Mock modules and lessons details per course
    const courseModules = new Map<string, Module[]>();
    courseModules.set('course-1', [
      {
        id: 'mod-1-1',
        title: 'Module 1: Getting Started',
        order: 1,
        lessons: [
          { id: 'les-1-1-1', title: '1.1 Introduction to computing', type: 'video', completed: true, xpValue: 100 },
          { id: 'les-1-1-2', title: '1.2 How computers work', type: 'text', completed: false, xpValue: 50 },
        ]
      },
      {
        id: 'mod-1-2',
        title: 'Module 2: Python Programming basics',
        order: 2,
        lessons: [
          { id: 'les-1-2-1', title: '2.1 Writing your first Python script', type: 'video', completed: false, xpValue: 120 },
          { id: 'les-1-2-2', title: '2.2 Variables and Expressions', type: 'pdf', completed: false, xpValue: 70 },
        ]
      }
    ]);

    courseModules.set('course-2', [
      {
        id: 'mod-2-1',
        title: 'Module 1: HTML Structure',
        order: 1,
        lessons: [
          { id: 'les-2-1-1', title: '1.1 Introduction to HTML5 tags', type: 'video', completed: true, xpValue: 90 },
          { id: 'les-2-1-2', title: '1.2 Semantic HTML layout elements', type: 'video', completed: true, xpValue: 100 },
        ]
      },
      {
        id: 'mod-2-2',
        title: 'Module 2: Styling with CSS',
        order: 2,
        lessons: [
          { id: 'les-2-2-1', title: '2.1 CSS Box Model', type: 'video', completed: false, xpValue: 110 },
          { id: 'les-2-2-2', title: '2.2 Flexbox layout models', type: 'pdf', completed: false, xpValue: 80 },
        ]
      }
    ]);

    courseModules.set('course-3', [
      {
        id: 'mod-3-1',
        title: 'Module 1: Stacks and Queues',
        order: 1,
        lessons: [
          { id: 'les-3-1-1', title: '1.1 Stack Operations & Memory Layout', type: 'video', completed: false, xpValue: 120 },
          { id: 'les-3-1-2', title: '1.2 Queue Array Implementations', type: 'text', completed: false, xpValue: 60 },
        ]
      }
    ]);

    userCourseDetails.set(userId, courseModules);

    // 3. Mock 30-day XP Progress data
    const progressData: XPProgress[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Add random progress XP curve
      const xpGained = i === 0 ? 0 : Math.floor(Math.random() * 80) + 10;
      progressData.push({
        date: formattedDate,
        xp: progressData.length > 0 ? progressData[progressData.length - 1].xp + xpGained : 200,
      });
    }
    userXpProgress.set(userId, progressData);

    // 4. Mock deadlines
    userDeadlines.set(userId, [
      {
        id: 'dead-1',
        title: 'Python Syntax Quiz',
        courseTitle: 'Introduction to Computer Science',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'exam'
      },
      {
        id: 'dead-2',
        title: 'CSS Layout Portfolio Project',
        courseTitle: 'Responsive Web Design Basics',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'assignment'
      },
      {
        id: 'dead-3',
        title: 'Big-O notation homework sheet',
        courseTitle: 'Data Structures and Algorithms',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'assignment'
      }
    ]);

    // 5. Streaks
    userStreaks.set(userId, 5);
  }
};

export const getStudentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  initUserDashboardData(userId);

  const courses = userCourses.get(userId) || [];
  const progressList = userXpProgress.get(userId) || [];
  const totalXp = progressList.length > 0 ? progressList[progressList.length - 1].xp : 0;

  // Calculate stats
  const enrolledCount = courses.length;
  const totalProgress = courses.reduce((sum, c) => sum + c.progress, 0);
  const completionRate = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;
  const attendanceRate = 92; // Mock attendance percentage

  res.status(200).json({
    enrolledCourses: enrolledCount,
    completionRate,
    attendanceRate,
    totalXp,
    streakCount: userStreaks.get(userId) || 1,
  });
};

export const getLearningProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  initUserDashboardData(userId);

  const progress = userXpProgress.get(userId) || [];
  res.status(200).json(progress);
};

export const getEnrolledCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  initUserDashboardData(userId);

  const courses = userCourses.get(userId) || [];
  res.status(200).json(courses);
};

export const getCourseDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  const courseId = req.params.courseId as string;
  initUserDashboardData(userId);

  const userCourseModules = userCourseDetails.get(userId);
  const modules = userCourseModules ? userCourseModules.get(courseId) : undefined;

  if (!modules) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  res.status(200).json(modules);
};

export const completeLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  const { lessonId } = req.params;
  initUserDashboardData(userId);

  const userModules = userCourseDetails.get(userId);
  if (!userModules) {
    res.status(404).json({ error: 'Modules not found' });
    return;
  }

  let matchedLesson: Lesson | null = null;
  let targetCourseId = '';

  // Find the lesson across all courses
  for (const [courseId, modules] of userModules.entries()) {
    for (const mod of modules) {
      const les = mod.lessons.find((l) => l.id === lessonId);
      if (les) {
        matchedLesson = les;
        targetCourseId = courseId;
        break;
      }
    }
    if (matchedLesson) break;
  }

  if (!matchedLesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  if (matchedLesson.completed) {
    res.status(200).json({ message: 'Lesson already completed' });
    return;
  }

  // Mark complete
  matchedLesson.completed = true;
  const xpEarned = matchedLesson.xpValue;

  // Add to XP Progress
  const progressList = userXpProgress.get(userId) || [];
  if (progressList.length > 0) {
    progressList[progressList.length - 1].xp += xpEarned;
  }

  // Recalculate Course progress percentage
  const modules = userModules.get(targetCourseId) || [];
  let totalLessons = 0;
  let completedCount = 0;

  for (const mod of modules) {
    for (const les of mod.lessons) {
      totalLessons++;
      if (les.completed) completedCount++;
    }
  }

  const newProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Update in enrolled courses list
  const courses = userCourses.get(userId) || [];
  const courseIdx = courses.findIndex((c) => c.courseId === targetCourseId);
  if (courseIdx !== -1) {
    courses[courseIdx].progress = newProgress;
  }

  res.status(200).json({
    message: 'Lesson completed successfully',
    xpEarned,
    newProgress,
    courseId: targetCourseId,
  });
};

export const getUpcomingDeadlines = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  initUserDashboardData(userId);

  const deadlines = userDeadlines.get(userId) || [];
  res.status(200).json(deadlines);
};
