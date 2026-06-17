'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Filter, 
  BarChart, 
  BookOpen, 
  User, 
  FileText, 
  Activity, 
  Clock, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../components/DataTable';
import Avatar from '../../components/Avatar';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

interface Assessment {
  id: string;
  title: string;
  type: 'Exam' | 'Quiz' | 'Project' | 'Homework';
  courseCode: string;
  courseName: string;
  dueDate: string;
  submittedCount: number;
  totalCount: number;
  status: 'Active' | 'Grading' | 'Graded' | 'Draft';
  weight: number; // percentage
}

interface AttemptAnswer {
  questionId: string;
  questionText: string;
  type: string;
  maxMarks: number;
  studentAnswer: string;
  correctAnswer: string;
  marksAwarded: number;
  feedback: string;
}

interface StudentAttempt {
  id: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'Pending' | 'Graded';
  score: number;
  totalMarks: number;
  answers: AttemptAnswer[];
}

const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: '1',
    title: 'Final Cryptanalysis Project',
    type: 'Project',
    courseCode: 'CS-402',
    courseName: 'Advanced Cryptography',
    dueDate: '2026-06-25',
    submittedCount: 48,
    totalCount: 60,
    status: 'Grading',
    weight: 30,
  },
  {
    id: '2',
    title: 'Neural Net Optimization Quiz',
    type: 'Quiz',
    courseCode: 'CS-380',
    courseName: 'Machine Learning Models',
    dueDate: '2026-06-12',
    submittedCount: 60,
    totalCount: 60,
    status: 'Graded',
    weight: 10,
  },
  {
    id: '3',
    title: 'Oligopoly Market Case-Study',
    type: 'Homework',
    courseCode: 'ECON-201',
    courseName: 'Microeconomic Theory',
    dueDate: '2026-06-18',
    submittedCount: 82,
    totalCount: 85,
    status: 'Grading',
    weight: 15,
  },
  {
    id: '4',
    title: 'Electromagnetic Wave Mid-Term',
    type: 'Exam',
    courseCode: 'EE-104',
    courseName: 'Digital Systems & Design',
    dueDate: '2026-06-08',
    submittedCount: 120,
    totalCount: 120,
    status: 'Graded',
    weight: 25,
  },
  {
    id: '5',
    title: 'Quantum Tunneling Simulation',
    type: 'Project',
    courseCode: 'PHYS-410',
    courseName: 'Quantum Mechanics II',
    dueDate: '2026-06-30',
    submittedCount: 8,
    totalCount: 30,
    status: 'Active',
    weight: 20,
  },
  {
    id: '6',
    title: 'Italian Renaissance Critical Essay',
    type: 'Homework',
    courseCode: 'HIST-224',
    courseName: 'Renaissance Art History',
    dueDate: '2026-06-02',
    submittedCount: 38,
    totalCount: 40,
    status: 'Graded',
    weight: 15,
  },
];

// Syllabus questions dictionary mapped by assessment ID
const MOCK_QUESTIONS: Record<string, { text: string; maxMarks: number; type: string }[]> = {
  '1': [
    { text: "Write a complete Python program to implement a Shift/Caesar Cipher encryption and decryption function. Include example outputs.", maxMarks: 50, type: "coding" },
    { text: "Explain the vulnerability of RSA to Shor's algorithm and describe post-quantum cryptographic alternatives such as lattice-based cryptography.", maxMarks: 50, type: "essay" }
  ],
  '2': [
    { text: "What is the primary purpose of learning rate decay in gradient descent optimization?", maxMarks: 5, type: "mcq" },
    { text: "Explain the difference between L1 (Lasso) and L2 (Ridge) regularization.", maxMarks: 5, type: "essay" }
  ],
  '3': [
    { text: "Explain the core differences between Cournot and Bertrand competition models in an oligopolistic market structure, specifically addressing how firms choose strategy.", maxMarks: 25, type: "essay" },
    { text: "Write a short critique on the Nash Equilibrium efficiency inside public goods dilemmas and suggest mechanism design adjustments to solve it.", maxMarks: 25, type: "essay" }
  ],
  '4': [
    { text: "Derive Maxwell's equations in vacuum and show how they predict the propagation of electromagnetic waves with speed c.", maxMarks: 50, type: "essay" },
    { text: "Solve the wave equation for a plane wave reflecting off a perfectly conducting boundary.", maxMarks: 50, type: "essay" }
  ],
  '5': [
    { text: "Formulate the time-independent Schrödinger equation for a rectangular potential barrier and derive the transmission coefficient for tunneling.", maxMarks: 50, type: "essay" },
    { text: "Explain the quantum-mechanical operating principles of a Scanning Tunneling Microscope (STM).", maxMarks: 50, type: "essay" }
  ],
  '6': [
    { text: "Analyze the stylistic evolution of linear perspective from Giotto to Brunelleschi and its impact on spatial realism.", maxMarks: 50, type: "essay" },
    { text: "Critique the thematic role of patronage in the Florentine Renaissance.", maxMarks: 50, type: "essay" }
  ]
};

// Seed initial student attempts for all assessments
const INITIAL_MOCK_ATTEMPTS: Record<string, StudentAttempt[]> = {
  '1': [ // CS-402 Final Cryptanalysis Project
    {
      id: 'att-1',
      studentName: 'Haris Choudhary',
      studentEmail: 'student@test.com',
      submittedAt: '2026-06-15 10:24',
      status: 'Pending',
      score: 0,
      totalMarks: 100,
      answers: [
        {
          questionId: 'q-1-1',
          questionText: 'Write a complete Python program to implement a Shift/Caesar Cipher encryption and decryption function. Include example outputs.',
          type: 'coding',
          maxMarks: 50,
          studentAnswer: `def caesar_encrypt(text, s):
  result = ""
  for i in range(len(text)):
    char = text[i]
    if (char.isupper()):
      result += chr((ord(char) + s - 65) % 26 + 65)
    else:
      result += chr((ord(char) + s - 97) % 26 + 97)
  return result

# Verification
print(caesar_encrypt("HELLO", 4)) # Output: LIPPS`,
          correctAnswer: 'Standard Caesar Shift cipher routine in Python.',
          marksAwarded: 0,
          feedback: ''
        },
        {
          questionId: 'q-1-2',
          questionText: 'Explain the vulnerability of RSA to Shor\'s algorithm and describe post-quantum cryptographic alternatives such as lattice-based cryptography.',
          type: 'essay',
          maxMarks: 50,
          studentAnswer: 'Shor\'s algorithm can factor integers in polynomial time. Since RSA\'s security relies on the integer factorization problem being hard, a sufficiently large quantum computer running Shor\'s algorithm could crack RSA keys easily. Post-quantum cryptosystems like Kyber (lattice-based) rely on the hardness of high-dimensional geometric lattice problems, which are immune to known quantum speedups.',
          correctAnswer: 'Explanation of integer factorization speedup and lattice problem difficulty structures.',
          marksAwarded: 0,
          feedback: ''
        }
      ]
    },
    {
      id: 'att-2',
      studentName: 'Ananya Sen',
      studentEmail: 'ananya@test.com',
      submittedAt: '2026-06-15 11:05',
      status: 'Pending',
      score: 0,
      totalMarks: 100,
      answers: [
        {
          questionId: 'q-1-1',
          questionText: 'Write a complete Python program to implement a Shift/Caesar Cipher encryption and decryption function. Include example outputs.',
          type: 'coding',
          maxMarks: 50,
          studentAnswer: 'def caesar(text, shift):\n  return "".join([chr(ord(c) + shift) for c in text])',
          correctAnswer: 'Standard Caesar Shift cipher routine in Python.',
          marksAwarded: 0,
          feedback: ''
        },
        {
          questionId: 'q-1-2',
          questionText: 'Explain the vulnerability of RSA to Shor\'s algorithm and describe post-quantum cryptographic alternatives such as lattice-based cryptography.',
          type: 'essay',
          maxMarks: 50,
          studentAnswer: 'Shor\'s algorithm factors keys using quantum superposition. Kyber uses lattice vectors.',
          correctAnswer: 'Explanation of integer factorization speedup and lattice problem difficulty structures.',
          marksAwarded: 0,
          feedback: ''
        }
      ]
    }
  ],
  '2': [ // CS-380 Neural Net Optimization Quiz
    {
      id: 'att-2-1',
      studentName: 'Ananya Sen',
      studentEmail: 'ananya@test.com',
      submittedAt: '2026-06-15 11:42',
      status: 'Pending',
      score: 0,
      totalMarks: 10,
      answers: [
        {
          questionId: 'q-2-1',
          questionText: 'What is the primary purpose of learning rate decay in gradient descent optimization?',
          type: 'mcq',
          maxMarks: 5,
          studentAnswer: 'Learning rate decay reduces the step size as training progresses, allowing the model to settle into a local minimum without oscillating or overshooting.',
          correctAnswer: 'To ensure convergence and prevent oscillation around the minimum.',
          marksAwarded: 0,
          feedback: ''
        },
        {
          questionId: 'q-2-2',
          questionText: 'Explain the difference between L1 (Lasso) and L2 (Ridge) regularization.',
          type: 'essay',
          maxMarks: 5,
          studentAnswer: 'L1 regularization adds absolute weight values to the loss function and can force coefficients to zero, performing feature selection. L2 adds squared weight values, which shrinks coefficients but keeps them non-zero.',
          correctAnswer: 'L1 forces absolute weights to zero (sparsity); L2 shrinks squared weights.',
          marksAwarded: 0,
          feedback: ''
        }
      ]
    }
  ],
  '3': [ // ECON-201 Oligopoly Market Case-Study
    {
      id: 'att-3',
      studentName: 'Rohan Gupta',
      studentEmail: 'rohan@test.com',
      submittedAt: '2026-06-15 09:12',
      status: 'Pending',
      score: 0,
      totalMarks: 50,
      answers: [
        {
          questionId: 'q-3-1',
          questionText: 'Explain the core differences between Cournot and Bertrand competition models in an oligopolistic market structure, specifically addressing how firms choose strategy.',
          type: 'essay',
          maxMarks: 25,
          studentAnswer: 'Cournot firms compete on output capacity (quantity chosen simultaneously), yielding prices higher than marginal cost. Bertrand firms compete on price, where a price-undercutting incentive drives pricing down to marginal cost, matching a competitive equilibrium.',
          correctAnswer: 'Differences in quantity vs pricing strategy choices.',
          marksAwarded: 0,
          feedback: ''
        },
        {
          questionId: 'q-3-2',
          questionText: 'Write a short critique on the Nash Equilibrium efficiency inside public goods dilemmas and suggest mechanism design adjustments to solve it.',
          type: 'essay',
          maxMarks: 25,
          studentAnswer: 'Nash Equilibrium predicts zero contributions in public goods since each player prefers to free-ride. Adjustments like VCG mechanisms or quadratic funding can incentivize cooperation by aligning individual rewards with social benefits.',
          correctAnswer: 'Criticism of free-riding behavior and incentives alignment.',
          marksAwarded: 0,
          feedback: ''
        }
      ]
    }
  ],
  '4': [ // EE-104 Electromagnetic Wave Mid-Term
    {
      id: 'att-4-1',
      studentName: 'Haris Choudhary',
      studentEmail: 'student@test.com',
      submittedAt: '2026-06-15 08:30',
      status: 'Pending',
      score: 0,
      totalMarks: 100,
      answers: [
        {
          questionId: 'q-4-1',
          questionText: "Derive Maxwell's equations in vacuum and show how they predict the propagation of electromagnetic waves with speed c.",
          type: 'essay',
          maxMarks: 50,
          studentAnswer: "Maxwell's equations in vacuum have no sources (rho=0, J=0). Taking the curl of curl E = -d/dt (curl B) and using vector identity, we get a wave equation with velocity v = 1/sqrt(mu_0 * epsilon_0) which equals the speed of light c.",
          correctAnswer: "Vector calculus derivation showing decoupled wave equations for E and B.",
          marksAwarded: 0,
          feedback: ''
        },
        {
          questionId: 'q-4-2',
          questionText: "Solve the wave equation for a plane wave reflecting off a perfectly conducting boundary.",
          type: 'essay',
          maxMarks: 50,
          studentAnswer: "Boundary condition requires the tangential component of E to be zero at the surface. This creates a standing wave pattern with nodes at the boundary.",
          correctAnswer: "Boundary conditions setup and standing wave solution derivation.",
          marksAwarded: 0,
          feedback: ''
        }
      ]
    }
  ],
  '5': [ // PHYS-410 Quantum Tunneling Simulation
    {
      id: 'att-5-1',
      studentName: 'Rohan Gupta',
      studentEmail: 'rohan@test.com',
      submittedAt: '2026-06-15 07:15',
      status: 'Pending',
      score: 0,
      totalMarks: 100,
      answers: [
        {
          questionId: 'q-5-1',
          questionText: "Formulate the time-independent Schrödinger equation for a rectangular potential barrier and derive the transmission coefficient for tunneling.",
          type: 'essay',
          maxMarks: 50,
          studentAnswer: "We set up wave functions in Region I (incident + reflected), Region II (decaying exponentials), and Region III (transmitted). Matching boundary conditions at x=0 and x=L yields the transmission coefficient T approx exp(-2kL).",
          correctAnswer: "Matching wave functions and barrier boundary conditions to derive transmission probability T.",
          marksAwarded: 0,
          feedback: ''
        },
        {
          questionId: 'q-5-2',
          questionText: "Explain the quantum-mechanical operating principles of a Scanning Tunneling Microscope (STM).",
          type: 'essay',
          maxMarks: 50,
          studentAnswer: "STM works by placing a conducting tip extremely close to a sample surface. When a bias voltage is applied, electrons tunnel through the vacuum barrier. The tunneling current is exponentially sensitive to distance, allowing sub-angstrom resolution.",
          correctAnswer: "Exponential sensitivity of tunneling current to tip-sample distance.",
          marksAwarded: 0,
          feedback: ''
        }
      ]
    }
  ],
  '6': [ // HIST-224 Italian Renaissance Critical Essay
    {
      id: 'att-6-1',
      studentName: 'Ananya Sen',
      studentEmail: 'ananya@test.com',
      submittedAt: '2026-06-15 09:40',
      status: 'Pending',
      score: 0,
      totalMarks: 100,
      answers: [
        {
          questionId: 'q-6-1',
          questionText: "Analyze the stylistic evolution of linear perspective from Giotto to Brunelleschi and its impact on spatial realism.",
          type: 'essay',
          maxMarks: 50,
          studentAnswer: "Giotto used intuitive perspective and architectural frameworks to suggest depth, but Brunelleschi mathematically formalized the single vanishing point system. This transformed art from symbolic representation to a window into three-dimensional space.",
          correctAnswer: "Comparison of intuitive volumetric shading with mathematical grid vanishing point construction.",
          marksAwarded: 0,
          feedback: ''
        },
        {
          questionId: 'q-6-2',
          questionText: "Critique the thematic role of patronage in the Florentine Renaissance.",
          type: 'essay',
          maxMarks: 50,
          studentAnswer: "Wealthy families like the Medici used art patronage as political soft power and civic duty, funding public monuments to legitimize their wealth.",
          correctAnswer: "Social and political role of the merchant class in funding art.",
          marksAwarded: 0,
          feedback: ''
        }
      ]
    }
  ]
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>(INITIAL_ASSESSMENTS);
  const [attemptsDb, setAttemptsDb] = useState<Record<string, StudentAttempt[]>>(INITIAL_MOCK_ATTEMPTS);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // Establish Socket.io connection for real-time submission listening
  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('🔌 Admin connected to real-time socket server');
    });

    socket.on('assessment_submitted', (data: { assessmentId: string; studentName: string; assessmentTitle: string; attemptId: string }) => {
      toast.success(`${data.studentName} submitted attempt for "${data.assessmentTitle}"!`, {
        icon: '📝',
        duration: 5000
      });

      // Increment turn-in ratio
      setAssessments(prev => prev.map(a => {
        if (a.id === data.assessmentId) {
          const newSubmitted = a.submittedCount + 1;
          const newStatus = newSubmitted >= a.totalCount ? 'Grading' : a.status;
          return { ...a, submittedCount: newSubmitted, status: newStatus as any };
        }
        return a;
      }));

      // Add student submission in attempts queue
      setAttemptsDb(prev => {
        const list = prev[data.assessmentId] || [];
        if (list.some(att => att.id === data.attemptId)) return prev;

        const assessmentQs = MOCK_QUESTIONS[data.assessmentId] || [];
        const dummyAnswers = assessmentQs.map((q, idx) => ({
          questionId: `q-${data.assessmentId}-${idx + 1}`,
          questionText: q.text,
          type: q.type,
          maxMarks: q.maxMarks,
          studentAnswer: q.type === 'coding'
            ? 'def solution():\n  # Live student submission code\n  pass'
            : 'Live student essay response submitted via portal.',
          correctAnswer: 'Detailed theoretical breakdown of syllabus topics.',
          marksAwarded: 0,
          feedback: ''
        }));

        const newAttempt: StudentAttempt = {
          id: data.attemptId,
          studentName: data.studentName,
          studentEmail: `${data.studentName.toLowerCase().replace(' ', '')}@test.com`,
          submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'Pending',
          score: 0,
          totalMarks: assessmentQs.reduce((sum, q) => sum + q.maxMarks, 0) || 100,
          answers: dummyAnswers
        };

        return { ...prev, [data.assessmentId]: [...list, newAttempt] };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // New Assessment Form States
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Exam' | 'Quiz' | 'Project' | 'Homework'>('Quiz');
  const [course, setCourse] = useState('CS-402');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState(15);
  const [maxCapacity, setMaxCapacity] = useState(60);

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    const courseNames: Record<string, string> = {
      'CS-402': 'Advanced Cryptography',
      'CS-380': 'Machine Learning Models',
      'ECON-201': 'Microeconomic Theory',
      'EE-104': 'Digital Systems & Design',
      'PHYS-410': 'Quantum Mechanics II',
    };

    const newAssessment: Assessment = {
      id: Date.now().toString(),
      title,
      type,
      courseCode: course,
      courseName: courseNames[course] || 'General Elective',
      dueDate,
      submittedCount: 0,
      totalCount: maxCapacity,
      status: 'Active',
      weight: Number(weight),
    };

    setAssessments([newAssessment, ...assessments]);
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setType('Quiz');
    setCourse('CS-402');
    setDueDate('');
    setWeight(15);
    setMaxCapacity(60);
    toast.success('Assessment created successfully!');
  };

  const handleOpenGrade = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    const attempts = attemptsDb[assessment.id] || [];
    setSelectedAttemptId(attempts[0]?.id || null);
    setIsGradeOpen(true);
  };

  const handleOpenAudit = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsAuditOpen(true);
  };

  const handleUpdateMarks = (attemptId: string, qId: string, marks: number) => {
    if (!selectedAssessment) return;
    setAttemptsDb(prev => {
      const list = prev[selectedAssessment.id] || [];
      const updatedList = list.map(att => {
        if (att.id === attemptId) {
          const updatedAnswers = att.answers.map(ans => {
            if (ans.questionId === qId) {
              return { ...ans, marksAwarded: Math.min(ans.maxMarks, Math.max(0, marks)) };
            }
            return ans;
          });
          return { ...att, answers: updatedAnswers };
        }
        return att;
      });
      return { ...prev, [selectedAssessment.id]: updatedList };
    });
  };

  const handleUpdateFeedback = (attemptId: string, qId: string, feedback: string) => {
    if (!selectedAssessment) return;
    setAttemptsDb(prev => {
      const list = prev[selectedAssessment.id] || [];
      const updatedList = list.map(att => {
        if (att.id === attemptId) {
          const updatedAnswers = att.answers.map(ans => {
            if (ans.questionId === qId) {
              return { ...ans, feedback };
            }
            return ans;
          });
          return { ...att, answers: updatedAnswers };
        }
        return att;
      });
      return { ...prev, [selectedAssessment.id]: updatedList };
    });
  };

  const handleSubmitAttemptGrade = (attemptId: string) => {
    if (!selectedAssessment) return;
    
    // Find the attempt to get details
    const currentAttempt = (attemptsDb[selectedAssessment.id] || []).find(att => att.id === attemptId);
    if (!currentAttempt) return;

    const totalScore = currentAttempt.answers.reduce((sum, ans) => sum + ans.marksAwarded, 0);

    // Emit socket event to notify student in real-time
    try {
      const socket = io('http://localhost:3001');
      socket.emit('submit_grade', {
        studentEmail: currentAttempt.studentEmail,
        score: totalScore,
        totalMarks: currentAttempt.totalMarks,
        assessmentTitle: selectedAssessment.title,
        feedback: currentAttempt.answers.map(a => a.feedback).filter(Boolean).join('. ') || 'Well done!'
      });
      socket.disconnect();
    } catch (socketErr) {
      console.warn('⚠️ Failed to emit submit_grade socket event:', socketErr);
    }

    setAttemptsDb(prev => {
      const list = prev[selectedAssessment.id] || [];
      const updatedList = list.map(att => {
        if (att.id === attemptId) {
          return {
            ...att,
            status: 'Graded' as const,
            score: totalScore,
          };
        }
        return att;
      });

      // Verify if all attempts for this assessment are now graded
      const allGraded = updatedList.every(att => att.status === 'Graded');
      if (allGraded) {
        setAssessments(prevAssessments => 
          prevAssessments.map(a => a.id === selectedAssessment.id ? { ...a, status: 'Graded' as const } : a)
        );
        toast.success(`All submissions for "${selectedAssessment.title}" have been graded! Status updated to Graded.`, {
          icon: '🎉',
          duration: 4000
        });
      } else {
        toast.success(`Grades saved successfully for this student!`);
      }

      return { ...prev, [selectedAssessment.id]: updatedList };
    });
  };

  const getFilteredData = () => {
    return assessments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || a.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const columns = [
    {
      header: 'Course',
      accessor: (row: Assessment) => (
        <div>
          <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider block">
            {row.courseCode}
          </span>
          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
            {row.courseName}
          </span>
        </div>
      ),
    },
    {
      header: 'Assessment Title',
      accessor: (row: Assessment) => (
        <div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
            {row.title}
          </span>
          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
            Weight: {row.weight}% of term
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (row: Assessment) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
          row.type === 'Exam' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
          row.type === 'Quiz' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450' :
          row.type === 'Project' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400' :
          'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
        }`}>
          {row.type}
        </span>
      ),
      sortable: true,
      sortKey: 'type' as keyof Assessment,
    },
    {
      header: 'Turn-in Ratio',
      accessor: (row: Assessment) => {
        const ratio = Math.round((row.submittedCount / row.totalCount) * 100) || 0;
        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
              <span>{row.submittedCount}/{row.totalCount}</span>
              <span>{ratio}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${ratio}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Deadline',
      accessor: (row: Assessment) => (
        <span className="text-slate-600 dark:text-slate-350">{row.dueDate}</span>
      ),
      sortable: true,
      sortKey: 'dueDate' as keyof Assessment,
    },
    {
      header: 'Workflow Stage',
      accessor: (row: Assessment) => (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
          row.status === 'Graded'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
            : row.status === 'Grading'
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
            : row.status === 'Active'
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {row.status}
        </span>
      ),
      sortable: true,
      sortKey: 'status' as keyof Assessment,
    },
  ];

  const actions = (row: Assessment) => (
    <div className="flex space-x-2 justify-end">
      {row.status !== 'Draft' && (
        <button 
          onClick={() => handleOpenGrade(row)}
          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-blue-500 active:scale-95 transition cursor-pointer"
        >
          Grade
        </button>
      )}
      <button 
        onClick={() => handleOpenAudit(row)}
        className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-[9px] font-bold rounded-lg transition cursor-pointer"
      >
        Audit
      </button>
    </div>
  );

  const activeAttempt = selectedAssessment && selectedAttemptId
    ? (attemptsDb[selectedAssessment.id] || []).find(att => att.id === selectedAttemptId)
    : null;

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
            Assessments Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure examinations, review submissions, and manage term grade weight structures
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Active', value: assessments.filter(a => a.status === 'Active').length, icon: Award, color: 'text-blue-500 bg-blue-500/10' },
          { title: 'Awaiting Grading', value: assessments.filter(a => a.status === 'Grading').length, icon: Calendar, color: 'text-amber-500 bg-amber-500/10' },
          { title: 'Completed Term', value: assessments.filter(a => a.status === 'Graded').length, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
          { title: 'Weight Allocated', value: `${assessments.reduce((acc, curr) => acc + curr.weight, 0)}%`, icon: BarChart, color: 'text-purple-500 bg-purple-500/10' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center space-x-3.5">
              <div className={`p-2.5 rounded-2xl ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-md font-black text-slate-800 dark:text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </section>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        
        {/* Search */}
        <div className="flex items-center w-full md:flex-1 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5">
          <Search className="h-4.5 w-4.5 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search assessment name or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900">All Categories</option>
            <option value="Exam" className="dark:bg-slate-900">Exam</option>
            <option value="Quiz" className="dark:bg-slate-900">Quiz</option>
            <option value="Project" className="dark:bg-slate-900">Project</option>
            <option value="Homework" className="dark:bg-slate-900">Homework</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer w-full md:w-auto"
        >
          <option value="All" className="dark:bg-slate-900">All Stages</option>
          <option value="Active" className="dark:bg-slate-900">Active</option>
          <option value="Grading" className="dark:bg-slate-900">Grading</option>
          <option value="Graded" className="dark:bg-slate-900">Graded</option>
          <option value="Draft" className="dark:bg-slate-900">Draft</option>
        </select>
      </div>

      {/* Table Section */}
      <DataTable
        columns={columns}
        data={getFilteredData()}
        actions={actions}
        searchPlaceholder="Type to filter..."
      />

      {/* 1. Assessment Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden relative z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white">Create Assessment</h3>
                    <p className="text-[10px] text-slate-455 uppercase tracking-widest mt-0.5">Term Syllabus allocation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-455 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAssessment} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">Assessment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-term Theoretical Paper"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">Category</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-750 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="Quiz">Quiz</option>
                      <option value="Exam">Exam</option>
                      <option value="Project">Project</option>
                      <option value="Homework">Homework</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">Target Course</label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-750 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="CS-402">CS-402 (Advanced Cryptography)</option>
                      <option value="CS-380">CS-380 (Machine Learning)</option>
                      <option value="ECON-201">ECON-201 (Microeconomic Theory)</option>
                      <option value="EE-104">EE-104 (Digital Systems)</option>
                      <option value="PHYS-410">PHYS-410 (Quantum Mechanics II)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-semibold text-slate-750 dark:text-slate-200 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">Grade Weight (%)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">Cohort Student Count</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={200}
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Grading Sheet Modal */}
      <AnimatePresence>
        {isGradeOpen && selectedAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGradeOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white">Grading Desk: {selectedAssessment.title}</h3>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">{selectedAssessment.courseCode} ({selectedAssessment.courseName})</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGradeOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-455 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body Container */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Submitted student attempts */}
                <div className="w-80 border-r border-slate-100 dark:border-slate-800/80 overflow-y-auto p-4 space-y-2.5 shrink-0 bg-slate-50/30 dark:bg-slate-950/20">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Submissions</h4>
                  {(attemptsDb[selectedAssessment.id] || []).map(att => {
                    const isSelected = selectedAttemptId === att.id;
                    return (
                      <div
                        key={att.id}
                        onClick={() => setSelectedAttemptId(att.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/[0.03] shadow-sm'
                            : 'border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900/40'
                        }`}
                      >
                        <Avatar name={att.studentName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-black text-slate-800 dark:text-white truncate">{att.studentName}</h5>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{att.submittedAt}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          att.status === 'Graded'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {att.status}
                        </span>
                      </div>
                    );
                  })}
                  {(attemptsDb[selectedAssessment.id] || []).length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-10">No attempts submitted.</p>
                  )}
                </div>

                {/* Main: Submission Sheet Details */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeAttempt ? (
                    <div className="space-y-6">
                      {/* Student details header card */}
                      <div className="p-5 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl shadow-sm border border-slate-900 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <Avatar name={activeAttempt.studentName} size="md" />
                          <div>
                            <h4 className="text-sm font-black">{activeAttempt.studentName}</h4>
                            <p className="text-[10px] text-slate-300 mt-0.5">{activeAttempt.studentEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Total Score</span>
                          <span className="text-xl font-black text-blue-300">{activeAttempt.answers.reduce((s, a) => s + a.marksAwarded, 0)} / {activeAttempt.totalMarks} Pts</span>
                        </div>
                      </div>

                      {/* Answers Grading block */}
                      <div className="space-y-6">
                        {activeAttempt.answers.map((ans, idx) => (
                          <div key={ans.questionId} className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                              <h5 className="text-xs font-black text-slate-800 dark:text-white flex items-start gap-2 max-w-xl">
                                <span className="h-5 w-5 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</span>
                                {ans.questionText}
                              </h5>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">Max Marks: {ans.maxMarks} Pts</span>
                            </div>

                            {/* Student Answer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-850/50">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Student's Answer</span>
                              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-350 bg-transparent border-none p-0 m-0">
                                {ans.studentAnswer}
                              </pre>
                            </div>

                            {/* Correct Reference Answer */}
                            <div className="p-4 bg-emerald-500/[0.02] rounded-xl border border-emerald-500/10">
                              <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest block mb-1">Correct Reference Answer</span>
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                                {ans.correctAnswer}
                              </p>
                            </div>

                            {/* Marks & Feedback Configurator */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center border-t border-slate-50 dark:border-slate-800/80 pt-4">
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Assign Score</label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    min={0}
                                    max={ans.maxMarks}
                                    value={ans.marksAwarded}
                                    onChange={(e) => handleUpdateMarks(activeAttempt.id, ans.questionId, Number(e.target.value))}
                                    className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold text-center"
                                  />
                                  <span className="text-xs font-bold text-slate-400">/ {ans.maxMarks} Pts</span>
                                </div>
                              </div>

                              <div className="sm:col-span-8 space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Feedback Notes</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Good derivation. Output correct."
                                  value={ans.feedback}
                                  onChange={(e) => handleUpdateFeedback(activeAttempt.id, ans.questionId, e.target.value)}
                                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Submit Grade actions */}
                      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          onClick={() => handleSubmitAttemptGrade(activeAttempt.id)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition"
                        >
                          Submit Grade Sheet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-3">
                      <User className="h-10 w-10 text-slate-300" />
                      <p className="text-xs text-slate-400 italic">Select a student submission to begin grading.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Assessment Audit Modal */}
      <AnimatePresence>
        {isAuditOpen && selectedAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuditOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="w-full max-w-4xl h-[75vh] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden relative z-10 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white">Audit Log: {selectedAssessment.title}</h3>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">{selectedAssessment.courseCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuditOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-455 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto space-y-6 pt-4">
                
                {/* General stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850/80">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weighting</span>
                    <h4 className="text-md font-black text-slate-800 dark:text-white mt-1">{selectedAssessment.weight}% of Total term</h4>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-855/80">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Submission Ratio</span>
                    <h4 className="text-md font-black text-slate-800 dark:text-white mt-1">{selectedAssessment.submittedCount} / {selectedAssessment.totalCount} ({Math.round((selectedAssessment.submittedCount / selectedAssessment.totalCount) * 100)}%)</h4>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850/80">
                    <span className="text-[9px] font-black text-slate-455 uppercase tracking-widest">Status stage</span>
                    <h4 className="text-md font-black text-slate-850 dark:text-white mt-1 uppercase tracking-wider">{selectedAssessment.status}</h4>
                  </div>
                </div>

                {/* Exam syllabus layout */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-500" /> Syllabus Questions Outlines
                  </h4>
                  
                  <div className="space-y-3">
                    {(MOCK_QUESTIONS[selectedAssessment.id] || []).map((q, idx) => (
                      <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs space-y-2">
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-200">
                          {idx + 1}. {q.text}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex gap-4">
                          <span>Max Marks: {q.maxMarks} Pts</span>
                          <span>Category type: {q.type}</span>
                        </p>
                      </div>
                    ))}
                    {(!MOCK_QUESTIONS[selectedAssessment.id] || MOCK_QUESTIONS[selectedAssessment.id].length === 0) && (
                      <p className="text-xs text-slate-450 italic">No syllabus questions configured.</p>
                    )}
                  </div>
                </div>

                {/* Proctoring logs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-500" /> Proctoring Violations Log
                  </h4>
                  
                  <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          <th className="p-4">Student</th>
                          <th className="p-4">Event Violation</th>
                          <th className="p-4">Timestamp</th>
                          <th className="p-4 text-right">Flag Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-700 dark:text-slate-300">
                        <tr>
                          <td className="p-4">Haris Choudhary</td>
                          <td className="p-4 text-rose-500">2 Browser Tab Switches</td>
                          <td className="p-4 text-slate-400">2026-06-15 10:28</td>
                          <td className="p-4 text-right">
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600">Flagged</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4">Ananya Sen</td>
                          <td className="p-4">1 Fullscreen Exit</td>
                          <td className="p-4 text-slate-400">2026-06-15 11:12</td>
                          <td className="p-4 text-right">
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600">Flagged</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
