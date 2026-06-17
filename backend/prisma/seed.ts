import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedDefaultBadges } from '../src/modules/gamification/badge.service';
import { seedDefaultRewards } from '../src/modules/gamification/reward.service';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('Test@123', 10);

  // Seed Student
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: { passwordHash },
    create: {
      email: 'student@test.com',
      firstName: 'Test',
      lastName: 'Student',
      role: 'STUDENT',
      passwordHash,
    },
  });

  // Seed Faculty
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@test.com' },
    update: { passwordHash },
    create: {
      email: 'faculty@test.com',
      firstName: 'Demo',
      lastName: 'Faculty',
      role: 'FACULTY',
      passwordHash,
    },
  });

  console.log('✅ Base users upserted with password: Test@123');

  // Seed Courses
  const coursesData = [
    { id: 'course-1', title: 'Advanced Cryptography & Security', description: 'Advanced mathematical structures and cryptanalysis streams.' },
    { id: 'course-2', title: 'Machine Learning Models & Analytics', description: 'Supervised, unsupervised, and deep neural structures.' },
    { id: 'course-3', title: 'Microeconomic Theory & Paradigms', description: 'Oligopoly behaviors, game theory, and market dynamics.' },
    { id: 'course-4', title: 'Quantum Mechanics II', description: 'Advanced wavefunction metrics and tunneling matrices.' },
    { id: 'course-5', title: 'Digital Systems & Design Fundamentals', description: 'VHDL models, gate matrices, and FPGA aggregates.' },
    { id: 'course-6', title: 'Renaissance Art History', description: 'Critical audit of Italian and French renaissance streams.' },
    { id: 'course-7', title: 'Advanced Cybersecurity', description: 'Threat vectors, firewall architectures, and penetration logs.' },
  ];

  for (const c of coursesData) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: { title: c.title, description: c.description },
      create: { id: c.id, title: c.title, description: c.description },
    });
  }
  console.log('✅ Courses seeded');

  // Seed Enrollments for Student
  const enrollments = [];
  for (const c of coursesData) {
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: student.id, courseId: c.id }
      },
      update: {},
      create: {
        userId: student.id,
        courseId: c.id,
        progress: Math.floor(Math.random() * 40) + 40,
        isActive: true,
      }
    });
    enrollments.push(enrollment);
  }
  console.log('✅ Student enrollments seeded');

  // Seed Attendance logs (last 30 days)
  console.log('⏳ Seeding historical attendance records...');
  for (const enrollment of enrollments) {
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const isPresent = Math.random() > 0.12; // 88% attendance rate
      
      await prisma.attendance.upsert({
        where: {
          enrollmentId_date: {
            enrollmentId: enrollment.id,
            date: new Date(date.toISOString().split('T')[0] + 'T00:00:00.000Z')
          }
        },
        update: {},
        create: {
          enrollmentId: enrollment.id,
          date: new Date(date.toISOString().split('T')[0] + 'T00:00:00.000Z'),
          status: isPresent ? 'present' : 'absent',
          method: 'qr',
          location: '12.9716, 77.5946',
          verifiedBy: 'system',
        }
      });
    }
  }
  console.log('✅ Attendance history seeded');

  // Seed Assessments
  const assessmentsData = [
    { id: 'assess-1', title: 'Final Cryptanalysis Project', type: 'assignment', courseId: 'course-1', totalMarks: 100 },
    { id: 'assess-2', title: 'Neural Net Optimization Quiz', type: 'quiz', courseId: 'course-2', totalMarks: 20 },
    { id: 'assess-3', title: 'Oligopoly Market Case-Study', type: 'assignment', courseId: 'course-3', totalMarks: 50 },
    { id: 'assess-4', title: 'Electromagnetic Wave Mid-Term', type: 'exam', courseId: 'course-5', totalMarks: 100 },
  ];

  for (const a of assessmentsData) {
    await prisma.assessment.upsert({
      where: { id: a.id },
      update: { title: a.title, type: a.type, totalMarks: a.totalMarks },
      create: {
        id: a.id,
        title: a.title,
        type: a.type,
        courseId: a.courseId,
        createdBy: faculty.id,
        totalMarks: a.totalMarks,
        published: true,
      }
    });
  }
  console.log('✅ Assessments seeded');

  // Seed Questions
  const questionsData = [
    // assess-1
    {
      id: 'q-1',
      assessmentId: 'assess-1',
      text: 'Write a complete Python program to implement a Shift/Caesar Cipher encryption and decryption function. Include example outputs.',
      type: 'coding',
      marks: 50,
      difficulty: 2,
      order: 1,
      options: null,
      correctAnswer: null,
    },
    {
      id: 'q-2',
      assessmentId: 'assess-1',
      text: 'Explain the vulnerability of RSA to Shor\'s algorithm and describe post-quantum cryptographic alternatives such as lattice-based cryptography.',
      type: 'essay',
      marks: 50,
      difficulty: 5,
      order: 2,
      options: null,
      correctAnswer: null,
    },
    // assess-2
    {
      id: 'q-3',
      assessmentId: 'assess-2',
      text: 'What is the primary function of an activation function in a neural network?',
      type: 'mcq',
      marks: 10,
      difficulty: 2,
      order: 1,
      options: ['To introduce non-linearity', 'To normalize inputs', 'To speed up gradient descent', 'To calculate weights'],
      correctAnswer: 'To introduce non-linearity',
    },
    {
      id: 'q-4',
      assessmentId: 'assess-2',
      text: 'Deep learning models are immune to overfitting if trained for enough epochs.',
      type: 'truefalse',
      marks: 10,
      difficulty: 1,
      order: 2,
      options: ['True', 'False'],
      correctAnswer: 'False',
    },
    // assess-3
    {
      id: 'q-5',
      assessmentId: 'assess-3',
      text: 'Explain the core differences between Cournot and Bertrand competition models in an oligopolistic market structure, specifically addressing how firms choose strategy.',
      type: 'essay',
      marks: 25,
      difficulty: 3,
      order: 1,
      options: null,
      correctAnswer: null,
    },
    {
      id: 'q-6',
      assessmentId: 'assess-3',
      text: 'Write a short critique on the Nash Equilibrium efficiency inside public goods dilemmas and suggest mechanism design adjustments to solve it.',
      type: 'essay',
      marks: 25,
      difficulty: 4,
      order: 2,
      options: null,
      correctAnswer: null,
    },
    // assess-4
    {
      id: 'q-7',
      assessmentId: 'assess-4',
      text: 'State Maxwell\'s equations in differential form and explain the physical meaning of displacement current.',
      type: 'essay',
      marks: 50,
      difficulty: 4,
      order: 1,
      options: null,
      correctAnswer: null,
    },
  ];

  for (const q of questionsData) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        text: q.text,
        type: q.type,
        marks: q.marks,
        difficulty: q.difficulty,
        order: q.order,
        options: q.options ? (q.options as any) : undefined,
        correctAnswer: q.correctAnswer,
      },
      create: {
        id: q.id,
        assessmentId: q.assessmentId,
        text: q.text,
        type: q.type,
        marks: q.marks,
        difficulty: q.difficulty,
        order: q.order,
        options: q.options ? (q.options as any) : undefined,
        correctAnswer: q.correctAnswer,
      },
    });
  }
  console.log('✅ Assessment questions seeded');

  // Seed AssessmentAttempts (with scores for graded ones)
  const attemptsData = [
    { assessmentId: 'assess-2', score: 18, percentage: 90, isPassed: true, status: 'submitted' },
    { assessmentId: 'assess-4', score: 85, percentage: 85, isPassed: true, status: 'submitted' },
  ];

  for (const att of attemptsData) {
    const existingAttempt = await prisma.assessmentAttempt.findFirst({
      where: { userId: student.id, assessmentId: att.assessmentId }
    });

    if (!existingAttempt) {
      await prisma.assessmentAttempt.create({
        data: {
          userId: student.id,
          assessmentId: att.assessmentId,
          score: att.score,
          percentage: att.percentage,
          isPassed: att.isPassed,
          status: att.status,
        }
      });
    }
  }
  console.log('✅ Assessment attempts seeded');

  // Seed gamification definitions
  await seedDefaultBadges();
  await seedDefaultRewards();

  console.log('✅ Database fully seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
