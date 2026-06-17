'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Award, 
  Plus, 
  Loader2, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Clock, 
  Eye, 
  TrendingUp,
  Globe,
  Lock,
  ArrowRight,
  X,
  ShieldAlert,
  CheckCircle,
  FileText,
  User,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useCourses } from '../../../hooks/useDashboard';

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  type: string;
  duration: number | null;
  passingScore: number;
  totalMarks: number;
  published: boolean;
  isProctored: boolean;
  _count?: {
    questions: number;
    attempts: number;
  };
}

export default function FacultyAssessmentsPage() {
  const router = useRouter();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);

  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedAssessmentFull, setSelectedAssessmentFull] = useState<any | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const handleOpenGrade = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsGradeOpen(true);
    setLoadingAttempts(true);
    try {
      const res = await api.get(`/faculty/assessments/${assessment.id}/attempts`);
      setAttempts(res.data);
      if (res.data.length > 0) {
        setSelectedAttemptId(res.data[0].id);
      } else {
        setSelectedAttemptId(null);
      }
    } catch (err) {
      toast.error('Failed to load assessment attempts');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleOpenAudit = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsAuditOpen(true);
    setLoadingAudit(true);
    try {
      const res = await api.get(`/faculty/assessments/${assessment.id}`);
      setSelectedAssessmentFull(res.data);
    } catch (err) {
      toast.error('Failed to load assessment details for audit log');
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleUpdateMarks = (attemptId: string, qId: string, marks: number) => {
    setAttempts(prev => prev.map(att => {
      if (att.id === attemptId) {
        const updatedAnswers = att.answers.map((ans: any) => {
          if (ans.questionId === qId) {
            return { ...ans, marksAwarded: Math.min(ans.maxMarks, Math.max(0, marks)) };
          }
          return ans;
        });
        return { ...att, answers: updatedAnswers };
      }
      return att;
    }));
  };

  const handleUpdateFeedback = (attemptId: string, qId: string, feedback: string) => {
    setAttempts(prev => prev.map(att => {
      if (att.id === attemptId) {
        const updatedAnswers = att.answers.map((ans: any) => {
          if (ans.questionId === qId) {
            return { ...ans, feedback };
          }
          return ans;
        });
        return { ...att, answers: updatedAnswers };
      }
      return att;
    }));
  };

  const handleSubmitAttemptGrade = async (attemptId: string) => {
    const currentAttempt = attempts.find(att => att.id === attemptId);
    if (!currentAttempt) return;

    setSubmittingGrade(true);
    try {
      const payloadAnswers = currentAttempt.answers.map((a: any) => ({
        questionId: a.questionId,
        marksAwarded: Number(a.marksAwarded),
        feedback: a.feedback
      }));

      await api.put(`/faculty/attempts/${attemptId}/grade`, {
        answers: payloadAnswers
      });

      toast.success(`Grades submitted successfully for ${currentAttempt.studentName}!`);
      
      // Update attempt status locally
      setAttempts(prev => prev.map(att => {
        if (att.id === attemptId) {
          const totalScore = att.answers.reduce((sum: number, a: any) => sum + (Number(a.marksAwarded) || 0), 0);
          return {
            ...att,
            status: 'Graded',
            score: totalScore
          };
        }
        return att;
      }));
    } catch (err) {
      toast.error('Failed to save manual grades');
    } finally {
      setSubmittingGrade(false);
    }
  };

  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].courseId);
    }
  }, [courses]);

  const fetchAssessments = async (courseId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/faculty/assessments/course/${courseId}`);
      setAssessments(res.data);
    } catch (error: any) {
      toast.error('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchAssessments(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handlePublishResults = async (id: string) => {
    try {
      await api.post(`/faculty/assessments/${id}/publish`);
      toast.success('Exam results published to student portals!');
      // Update local state
      setAssessments(prev => prev.map(a => a.id === id ? { ...a, published: true } : a));
    } catch (error: any) {
      toast.error('Failed to publish results');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Assessments Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            Author student evaluations, exams, and monitor academic proctoring logs.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/faculty/assessments/create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4.5 w-4.5" /> Design Exam
        </Button>
      </header>

      {/* Select course bar */}
      <Card className="p-5 border border-gray-200/50 dark:border-gray-850/60 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-white dark:bg-gray-900 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider">Select Curricular Course</h4>
          <p className="text-[10px] text-gray-400">View and manage tests specifically associated with each course.</p>
        </div>

        {coursesLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        ) : (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full sm:w-72 px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold cursor-pointer"
          >
            {courses?.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.title}
              </option>
            ))}
          </select>
        )}
      </Card>

      {/* Assessments Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-blue-500" />
          <p className="text-xs font-extrabold text-gray-450 uppercase tracking-widest">Loading assessments...</p>
        </div>
      ) : assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {assessments.map((ass) => (
            <Card key={ass.id} className="p-6 border border-gray-200/50 dark:border-gray-850/60 bg-white dark:bg-gray-900 !rounded-3xl hover:shadow-lg transition duration-200 flex flex-col justify-between h-64">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-50 dark:bg-gray-850 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-850">
                    {ass.type}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    ass.published 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {ass.published ? (
                      <>
                        <Globe className="h-3 w-3" /> Results Published
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Draft Results
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black tracking-tight line-clamp-1">{ass.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{ass.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4 flex flex-col gap-4">
                {/* Stats */}
                <div className="flex gap-4 text-[10px] font-bold text-gray-500">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                    {ass._count?.questions || 0} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-teal-500" />
                    {ass.duration || 'Unlimited'} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-purple-500" />
                    {ass.totalMarks} Marks
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-1.5"
                    onClick={() => router.push(`/faculty/assessments/${ass.id}/analytics`)}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" /> Analytics
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-1.5"
                    onClick={() => handleOpenAudit(ass)}
                  >
                    <FileText className="h-3 w-3 mr-1" /> Audit
                  </Button>

                  <Button 
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-1.5"
                    onClick={() => handleOpenGrade(ass)}
                  >
                    <Award className="h-3 w-3 mr-1" /> Grade
                  </Button>
                  
                  {!ass.published && (
                    <Button 
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold uppercase tracking-wider py-1.5"
                      onClick={() => handlePublishResults(ass.id)}
                    >
                      Publish Results
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl py-16 text-center max-w-xl mx-auto space-y-4">
          <Award className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto" />
          <div>
            <h3 className="text-base font-black">No assessments found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              No exams or online quizzes have been created yet for this course.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/faculty/assessments/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20"
          >
            Create First Exam
          </Button>
        </div>
      )}
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
              className="w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">Grading Desk: {selectedAssessment.title}</h3>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mt-0.5">
                      Max Score: {selectedAssessment.totalMarks} Marks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGradeOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body Container */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Submitted student attempts */}
                <div className="w-80 border-r border-gray-100 dark:border-gray-800/80 overflow-y-auto p-4 space-y-2.5 shrink-0 bg-gray-50/30 dark:bg-gray-950/20">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Submissions</h4>
                  {loadingAttempts ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  ) : attempts.map(att => {
                    const isSelected = selectedAttemptId === att.id;
                    return (
                      <div
                        key={att.id}
                        onClick={() => setSelectedAttemptId(att.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/[0.03] shadow-sm'
                            : 'border-gray-100 dark:border-gray-800/50 hover:bg-gray-55/40 dark:hover:bg-gray-800/40 bg-white dark:bg-gray-900/45'
                        }`}
                      >
                        <Avatar name={att.studentName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-black text-gray-850 dark:text-white truncate">{att.studentName}</h5>
                          <span className="text-[9px] text-gray-450 font-bold block mt-0.5">{att.submittedAt}</span>
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
                  {!loadingAttempts && attempts.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-10">No attempts submitted yet.</p>
                  )}
                </div>

                {/* Main: Submission Sheet Details */}
                <div className="flex-1 overflow-y-auto p-6">
                  {attempts.find(att => att.id === selectedAttemptId) ? (
                    (() => {
                      const activeAttempt = attempts.find(att => att.id === selectedAttemptId);
                      return (
                        <div className="space-y-6">
                          {/* Student details header card */}
                          <div className="p-5 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl shadow-sm border border-slate-900 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <Avatar name={activeAttempt.studentName} size="md" />
                              <div>
                                <h4 className="text-sm font-black">{activeAttempt.studentName}</h4>
                                <p className="text-[10px] text-gray-300 mt-0.5">{activeAttempt.studentEmail}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block font-mono">Current Score</span>
                              <span className="text-xl font-black text-blue-300 font-mono">
                                {activeAttempt.answers.reduce((s: number, a: any) => s + (Number(a.marksAwarded) || 0), 0)} / {activeAttempt.totalMarks} Pts
                              </span>
                            </div>
                          </div>

                          {/* Answers Grading block */}
                          <div className="space-y-6">
                            {activeAttempt.answers.map((ans: any, idx: number) => (
                              <div key={ans.questionId} className="p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                  <h5 className="text-xs font-black text-gray-850 dark:text-white flex items-start gap-2 max-w-xl leading-relaxed">
                                    <span className="h-5 w-5 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</span>
                                    {ans.questionText}
                                  </h5>
                                  <span className="text-[10px] font-bold text-gray-400 shrink-0 uppercase">Type: {ans.type}</span>
                                </div>

                                {/* Student Answer */}
                                <div className="p-4 bg-gray-55 dark:bg-gray-950/60 rounded-xl border border-gray-100 dark:border-gray-855/50">
                                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 font-mono">Student's Answer</span>
                                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 bg-transparent border-none p-0 m-0">
                                    {ans.studentAnswer || 'No response submitted.'}
                                  </pre>
                                </div>

                                {/* Correct Reference Answer */}
                                {ans.correctAnswer && (
                                  <div className="p-4 bg-emerald-500/[0.02] rounded-xl border border-emerald-500/10">
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1 font-mono">Correct Reference Answer</span>
                                    <p className="text-xs font-semibold text-gray-650 dark:text-gray-305 leading-relaxed">
                                      {ans.correctAnswer}
                                    </p>
                                  </div>
                                )}

                                {/* Marks & Feedback Configurator */}
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center border-t border-gray-100 dark:border-gray-800/80 pt-4">
                                  <div className="sm:col-span-4 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Assign Score</label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        min={0}
                                        max={ans.maxMarks}
                                        value={ans.marksAwarded}
                                        onChange={(e) => handleUpdateMarks(activeAttempt.id, ans.questionId, Number(e.target.value))}
                                        className="w-20 px-3 py-1.5 bg-gray-55 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold text-center text-gray-850 dark:text-gray-200"
                                      />
                                      <span className="text-xs font-bold text-gray-400">/ {ans.maxMarks} Pts</span>
                                    </div>
                                  </div>

                                  <div className="sm:col-span-8 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Feedback Notes</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Accurate syntax and logic. Well done."
                                      value={ans.feedback}
                                      onChange={(e) => handleUpdateFeedback(activeAttempt.id, ans.questionId, e.target.value)}
                                      className="w-full px-4 py-2 bg-gray-55 dark:bg-gray-855 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold text-gray-805 dark:text-gray-200"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Submit Grade actions */}
                          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800/80">
                            <button
                              onClick={() => handleSubmitAttemptGrade(activeAttempt.id)}
                              disabled={submittingGrade}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-750 disabled:opacity-75 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition flex items-center gap-1.5"
                            >
                              {submittingGrade ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>Submit Grade Sheet</>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-3">
                      <User className="h-10 w-10 text-gray-300 dark:text-gray-750" />
                      <p className="text-xs text-gray-400 italic">Select a student submission from the list to begin grading.</p>
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
              className="w-full max-w-4xl h-[75vh] bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-2xl p-6 overflow-hidden relative z-10 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                    <Activity className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-905 dark:text-white">Audit Log: {selectedAssessment.title}</h3>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mt-0.5">Exam Specifications</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuditOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto space-y-6 pt-4">
                
                {/* General stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-55 dark:bg-gray-950/40 rounded-2xl border border-gray-100 dark:border-gray-850/80">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">Passing Criteria</span>
                    <h4 className="text-md font-black text-gray-800 dark:text-white mt-1">{selectedAssessment.passingScore}% minimum threshold</h4>
                  </div>
                  <div className="p-4 bg-gray-55 dark:bg-gray-950/40 rounded-2xl border border-gray-100 dark:border-gray-850/80">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">Duration limit</span>
                    <h4 className="text-md font-black text-gray-800 dark:text-white mt-1">{selectedAssessment.duration || 'Unlimited'} Minutes</h4>
                  </div>
                  <div className="p-4 bg-gray-55 dark:bg-gray-950/40 rounded-2xl border border-gray-100 dark:border-gray-855/80">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">Workflow Status</span>
                    <h4 className="text-md font-black text-gray-800 dark:text-white mt-1 uppercase tracking-wider font-mono">
                      {selectedAssessment.published ? 'Published' : 'Draft'}
                    </h4>
                  </div>
                </div>

                {/* Exam syllabus layout */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <FileText className="h-4 w-4 text-blue-500" /> Syllabus Questions Outlines
                  </h4>
                  
                  {loadingAudit ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : selectedAssessmentFull?.questions ? (
                    <div className="space-y-3">
                      {selectedAssessmentFull.questions.map((q: any, idx: number) => (
                        <div key={q.id || idx} className="p-4 bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-xl text-xs space-y-2.5">
                          <h5 className="font-extrabold text-gray-800 dark:text-gray-200">
                            {idx + 1}. {q.text}
                          </h5>
                          <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider flex gap-4 font-mono">
                            <span>Max Marks: {q.marks} Pts</span>
                            <span>Type: {q.type}</span>
                          </p>
                          {q.correctAnswer && (
                            <div className="mt-1 p-2 bg-gray-55 dark:bg-gray-950 rounded-lg text-xxs font-mono text-gray-500">
                              <span className="font-bold text-gray-400 uppercase">Answer assert:</span> {q.correctAnswer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-10">No questions found in this assessment.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
