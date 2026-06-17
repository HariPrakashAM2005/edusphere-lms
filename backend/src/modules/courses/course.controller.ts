import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { getIO } from '../../socket';

const prisma = new PrismaClient();

/**
 * Helper to emit real-time course updates
 */
const emitCourseEvent = (event: string, data: any) => {
  try {
    const io = getIO();
    io.emit(event, data);
    if (data.id) {
      io.to(`course:${data.id}`).emit(event, data);
    }
  } catch (error) {
    console.error('Socket broadcast failed:', error);
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, thumbnail } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category: category || null,
        thumbnail: thumbnail || null,
        published: false,
        facultyId: req.user?.id || null,
      },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    emitCourseEvent('course_created', course);
    res.status(201).json(course);
  } catch (error: any) {
    console.error('Create course error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getMyCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user?.id;
    if (!facultyId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Return courses created by this faculty or those with no faculty assigned (seeded default courses)
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { facultyId: facultyId },
          { facultyId: null }
        ]
      },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(courses);
  } catch (error: any) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, category, thumbnail, published } = req.body;

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingCourse.title,
        description: description !== undefined ? description : existingCourse.description,
        category: category !== undefined ? category : existingCourse.category,
        thumbnail: thumbnail !== undefined ? thumbnail : existingCourse.thumbnail,
        published: published !== undefined ? published : existingCourse.published,
      },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    emitCourseEvent('course_updated', updated);
    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Update course error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    await prisma.course.delete({
      where: { id },
    });

    emitCourseEvent('course_deleted', { id });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const addModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // courseId
    const { title, description, order } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Module title is required' });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const module = await prisma.module.create({
      data: {
        courseId: id,
        title,
        description: description || null,
        order: order !== undefined ? parseInt(order.toString(), 10) : 0,
      },
    });

    // Fetch updated course and emit update event
    const updatedCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    emitCourseEvent('course_updated', updatedCourse);

    res.status(201).json(module);
  } catch (error: any) {
    console.error('Add module error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const addLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // moduleId
    const { title, content, videoUrl, duration, order } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Lesson title is required' });
      return;
    }

    const module = await prisma.module.findUnique({
      where: { id },
    });

    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: id,
        title,
        content: content || null,
        videoUrl: videoUrl || null,
        duration: duration !== undefined ? parseInt(duration.toString(), 10) : 0,
        order: order !== undefined ? parseInt(order.toString(), 10) : 0,
      },
    });

    // Fetch updated course and emit update event
    const updatedCourse = await prisma.course.findUnique({
      where: { id: module.courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    emitCourseEvent('course_updated', updatedCourse);

    res.status(201).json(lesson);
  } catch (error: any) {
    console.error('Add lesson error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const publishCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { published } = req.body;

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        published: published !== undefined ? published : true,
      },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    emitCourseEvent('course_updated', updated);
    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Publish course error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getStudentCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
      },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(courses);
  } catch (error: any) {
    console.error('Get student courses error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getCourseEnrollments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json(enrollments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addEnrollment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // courseId
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Student email is required' });
      return;
    }

    const student = await prisma.user.findUnique({
      where: { email },
    });

    if (!student) {
      res.status(404).json({ error: 'Student user not found' });
      return;
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: id,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        userId: student.id,
        courseId: id,
        progress: 0,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const { emitEnrollmentUpdate } = require('../../socket');
    emitEnrollmentUpdate(id, enrollment);

    res.status(201).json(enrollment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeEnrollment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const enrollmentId = req.params.enrollmentId as string;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      res.status(404).json({ error: 'Enrollment not found' });
      return;
    }

    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    const { emitEnrollmentUpdate } = require('../../socket');
    emitEnrollmentUpdate(id, { id: enrollmentId, deleted: true });

    res.status(200).json({ message: 'Enrollment removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInstructors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const instructors = await prisma.user.findMany({
      where: {
        role: { in: ['FACULTY', 'INSTITUTION_ADMIN'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    res.status(200).json(instructors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignInstructor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // courseId
    const { facultyId } = req.body;

    if (!facultyId) {
      res.status(400).json({ error: 'Faculty ID is required' });
      return;
    }

    const facultyUser = await prisma.user.findUnique({
      where: { id: facultyId },
    });

    if (!facultyUser) {
      res.status(404).json({ error: 'Faculty user not found' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { facultyId },
      include: {
        faculty: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    emitCourseEvent('course_updated', updated);

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCourseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        faculty: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }
    res.status(200).json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
