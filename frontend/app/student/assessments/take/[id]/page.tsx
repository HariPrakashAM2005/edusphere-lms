'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import MCQQuestion from '../../../../../components/assessment/MCQQuestion';
import CodingQuestion from '../../../../../components/assessment/CodingQuestion';
import Timer from '../../../../../components/assessment/Timer';
import QuestionPalette from '../../../../../components/assessment/QuestionPalette';
import api from '../../../../../lib/api';
import {
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  Maximize,
  AlertTriangle
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: string;
  options: any;
  marks: number;
  difficulty: number;
  order: number;
}

interface AssessmentDetails {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  passingScore: number;
  totalMarks: number;
  isProctored: boolean;
  questions: Question[];
}

export default function StudentExamPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<string[]>([]);
  
  // Fullscreen and proctoring states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assessment questions
  const { data: assessment, isLoading } = useQuery<AssessmentDetails>({
    queryKey: ['takeAssessment', assessmentId],
    queryFn: async () => {
      const res = await api.get(`/student/assessments/${assessmentId}`);
      return res.data;
    },
    enabled: !!assessmentId
  });

  // Mutation to start attempt
  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/student/assessments/${assessmentId}/start`);
      return res.data;
    },
    onSuccess: (data) => {
      setAttemptId(data.attemptId);
      
      // Load saved answers from localStorage if any
      const savedAnswers = localStorage.getItem(`answers_${data.attemptId}`);
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
    }
  });

  // Trigger start attempt once assessment details are fetched
  useEffect(() => {
    if (assessment) {
      startAttemptMutation.mutate();
    }
  }, [assessment]);

  // Track visited questions
  useEffect(() => {
    if (assessment && assessment.questions.length > 0 && attemptId) {
      const activeQId = assessment.questions[currentIdx].id;
      if (!visitedQuestions.includes(activeQId)) {
        setVisitedQuestions((prev) => [...prev, activeQId]);
      }
    }
  }, [currentIdx, assessment, attemptId]);

  // Auto-save answers local backup every 10 seconds
  useEffect(() => {
    if (!attemptId || Object.keys(answers).length === 0) return;

    const interval = setInterval(() => {
      localStorage.setItem(`answers_${attemptId}`, JSON.stringify(answers));
      console.log('📝 Exam answers auto-saved locally.');
    }, 10000);

    return () => clearInterval(interval);
  }, [answers, attemptId]);

  // Enforce Fullscreen
  const containerRef = useRef<HTMLDivElement>(null);

  const requestFullscreen = async () => {
    if (containerRef.current) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error('Failed to request fullscreen', err);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFull = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFull);
      if (!isCurrentlyFull && attemptId && assessment?.isProctored) {
        // Log exited fullscreen violation
        api.post(`/student/assessments/${attemptId}/proctor/fullscreen-exit`, {
          details: { timestamp: new Date(), description: 'Student exited fullscreen player mode' }
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [attemptId, assessment]);

  // Tab switch proctoring triggers
  useEffect(() => {
    if (!attemptId || !assessment?.isProctored) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchCount((prev) => prev + 1);
        // Post tab switch incident to backend proctoring log
        api.post(`/student/assessments/${attemptId}/proctor/tab-switch`, {
          details: { timestamp: new Date(), switchNumber: tabSwitchCount + 1 }
        });
        alert('⚠️ Warning: Leaving the exam tab is a proctoring violation and has been logged.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attemptId, assessment, tabSwitchCount]);

  if (isLoading || !assessment || !attemptId) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-gray-500 animate-pulse">
          <ShieldAlert className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold">Locking Exam Environment...</h3>
          <p className="text-xs text-gray-400 mt-1">Please authorize webcam permissions if prompted.</p>
        </div>
      </DashboardLayout>
    );
  }

  const questions = assessment.questions;
  const activeQuestion = questions[currentIdx];

  if (!questions || questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-8 text-center shadow-md flex flex-col items-center">
          <ShieldAlert className="h-12 w-12 text-blue-500 mb-4 animate-bounce" />
          <h3 className="text-base font-extrabold text-gray-955 dark:text-white">No Questions Configured</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            This assessment does not contain any questions yet. Please contact your instructor to publish the exam content.
          </p>
          <button
            onClick={() => router.push('/student/assessments')}
            className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs"
          >
            Back to Assessments
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: value
    }));
  };

  const handleToggleMark = () => {
    setMarkedForReview((prev) => {
      if (prev.includes(activeQuestion.id)) {
        return prev.filter((id) => id !== activeQuestion.id);
      }
      return [...prev, activeQuestion.id];
    });
  };

  // Submit attempt
  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      const answerPayload = Object.keys(answers).map((qId) => ({
        questionId: qId,
        answer: answers[qId]
      }));

      await api.put(`/student/assessments/${attemptId}/submit`, {
        answers: answerPayload
      });

      // Clear local storage backups
      localStorage.removeItem(`answers_${attemptId}`);
      localStorage.removeItem(`exam_end_${attemptId}`);

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      router.push(`/student/assessments/results/${assessmentId}`);
    } catch (err) {
      console.error('Failed to submit exam attempt', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Enforce fullscreen display check
  if (assessment.isProctored && !isFullscreen) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-8 text-center shadow-md flex flex-col items-center">
          <ShieldAlert className="h-12 w-12 text-amber-500 mb-4 animate-pulse" />
          <h3 className="text-base font-extrabold text-gray-950 dark:text-white">Proctoring Verification Required</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            This examination is proctored. To prevent academic dishonesty, you must lock this window in Fullscreen mode before viewing questions.
          </p>

          <div className="mt-4 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xxs text-amber-800 dark:text-amber-400 text-left space-y-1">
            <p>• Tab switching triggers immediate automatic logging.</p>
            <p>• Leaving fullscreen counts as a proctoring violation.</p>
          </div>

          <button
            onClick={requestFullscreen}
            className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5"
          >
            <Maximize className="h-4 w-4" /> Enforce Fullscreen & Start
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Target Container wrapper for requestFullscreen */}
      <div ref={containerRef} className="space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen p-6">
        
        {/* Timer, Title and Controls bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl shadow-sm">
          <div>
            <span className="text-xxs font-extrabold text-blue-650 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 px-2 py-0.5 rounded-full capitalize">
              {assessment.type}
            </span>
            <h2 className="text-base md:text-lg font-bold text-gray-950 dark:text-white mt-1 leading-snug">{assessment.title}</h2>
          </div>

          <div className="flex gap-3 items-center shrink-0">
            <Timer
              attemptId={attemptId}
              durationMinutes={assessment.duration || 30}
              onExpire={handleSubmitExam}
            />

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Workspace details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Question view (ColSpan 2) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[420px]">
            
            {/* Header controls inside workspace */}
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-850">
                <span className="text-xs font-bold text-gray-400">
                  Question <span className="text-gray-900 dark:text-white">{currentIdx + 1}</span> of {questions.length}
                </span>

                <button
                  type="button"
                  onClick={handleToggleMark}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xxs font-bold transition ${
                    markedForReview.includes(activeQuestion.id)
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-305 text-amber-600'
                      : 'border-gray-250 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-55/40 dark:hover:bg-gray-850'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  Mark for Review
                </button>
              </div>

              {/* Renders appropriate component depending on type */}
              <div className="pt-2">
                {activeQuestion.type === 'mcq' || activeQuestion.type === 'truefalse' ? (
                  <MCQQuestion
                    question={activeQuestion}
                    selectedAnswer={answers[activeQuestion.id] || ''}
                    onChange={handleAnswerChange}
                  />
                ) : activeQuestion.type === 'coding' ? (
                  <CodingQuestion
                    question={activeQuestion}
                    value={answers[activeQuestion.id] || ''}
                    onChange={handleAnswerChange}
                  />
                ) : (
                  /* Essay / Short answers textarea text input fallback */
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-relaxed">
                        {activeQuestion.text}
                      </h4>
                      <span className="text-xxs font-extrabold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full shrink-0">
                        {activeQuestion.marks} Marks
                      </span>
                    </div>

                    <textarea
                      value={answers[activeQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="w-full h-44 p-4 bg-gray-50/60 dark:bg-gray-850 border border-gray-250 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:outline-none text-xs md:text-sm font-semibold transition leading-relaxed resize-none"
                      placeholder="Write your explanation here..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-850 pt-5 mt-6">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="flex items-center px-4 py-2 border border-gray-200 dark:border-gray-750 hover:bg-gray-55/60 dark:hover:bg-gray-850 text-gray-650 dark:text-gray-350 rounded-xl font-bold transition text-xxs disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Question
              </button>

              <button
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xxs disabled:opacity-40"
              >
                Next Question
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

          </div>

          {/* Right Col: Navigation details grid (ColSpan 1) */}
          <div className="space-y-6">
            <QuestionPalette
              questions={questions}
              currentQuestionIndex={currentIdx}
              answers={answers}
              markedForReview={markedForReview}
              visitedQuestions={visitedQuestions}
              onSelectQuestion={setCurrentIdx}
            />

            <div className="p-4 bg-blue-50/20 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl text-xxs font-bold text-blue-600 dark:text-blue-400 leading-normal flex gap-2">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <p>Your answers are synchronized and automatically saved locally every 10 seconds. Do not exit fullscreen mode.</p>
            </div>
          </div>

        </div>

      </div>

      {/* Submit Confirmation Modal Overlay */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2.5 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-extrabold text-gray-905 dark:text-white">Submit Examination?</h3>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed">
              Are you sure you want to finalize and submit your responses? You have answered{' '}
              <span className="font-bold text-blue-650 dark:text-blue-400">
                {Object.keys(answers).filter((k) => answers[k] && answers[k].trim() !== '').length}
              </span>{' '}
              out of {questions.length} questions. This action is irreversible.
            </p>

            <div className="flex gap-3 justify-end pt-3">
              <button
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-350 rounded-xl font-bold transition text-xxs"
              >
                Go Back
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmitExam}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition text-xxs shadow-sm flex items-center gap-1.5"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
                <CheckCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
