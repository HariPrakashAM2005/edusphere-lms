'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useCourses } from '../../../../hooks/useDashboard';
import api from '../../../../lib/api';
import {
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  Info,
  ShieldAlert
} from 'lucide-react';

interface QuestionForm {
  text: string;
  type: string; // 'mcq' | 'truefalse' | 'fillblank' | 'coding' | 'essay'
  options: string[]; // for MCQ choices
  correctAnswer: string;
  explanation: string;
  marks: number;
  difficulty: number;
}

export default function FacultyAssessmentCreatePage() {
  const router = useRouter();
  const { data: courses } = useCourses();

  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('exam'); // quiz, exam, assignment
  const [duration, setDuration] = useState('60'); // in minutes
  const [passingScore, setPassingScore] = useState('50'); // passing %
  const [isProctored, setIsProctored] = useState(false);
  
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Set default course ID
  useEffect(() => {
    if (courses && courses.length > 0 && !courseId) {
      setCourseId(courses[0].courseId);
    }
  }, [courses, courseId]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: '',
        type: 'mcq',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        marks: 5,
        difficulty: 3
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index: number, field: keyof QuestionForm, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleMCQOptionChange = (qIndex: number, optIndex: number, val: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const updatedOpts = [...updated[qIndex].options];
      updatedOpts[optIndex] = val;
      updated[qIndex] = {
        ...updated[qIndex],
        options: updatedOpts
      };
      return updated;
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!title || !courseId) {
        alert('Title and Course are required fields.');
        return;
      }
      if (questions.length === 0) {
        // Start with one empty question if none added
        handleAddQuestion();
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  // Submit assessment
  const handleSaveAssessment = async (publish: boolean) => {
    setSubmitting(true);
    try {
      // Clean options for non-MCQ types
      const cleanedQuestions = questions.map((q) => ({
        ...q,
        options: q.type === 'mcq' ? q.options.filter(o => o.trim() !== '') : null
      }));

      const res = await api.post('/faculty/assessments', {
        title,
        description,
        type,
        courseId,
        duration: duration ? parseInt(duration) : null,
        passingScore: passingScore ? parseFloat(passingScore) : 40,
        isProctored,
        questions: cleanedQuestions
      });

      const assessmentId = res.data.assessmentId;

      if (publish && assessmentId) {
        // Publish draft
        await api.post(`/faculty/assessments/${assessmentId}/publish`);
      }

      setStep(4); // Success step
    } catch (err) {
      console.error('Failed to create assessment', err);
      alert('Failed to save assessment. Verify fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + (parseFloat(q.marks.toString()) || 0), 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Create Assessment</h1>
          <p className="mt-1 text-gray-550 dark:text-gray-400">
            Build customized examinations, randomize question banks, and setup proctoring constraints
          </p>
        </div>

        {/* Wizard progress track */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl shadow-sm text-xxs font-extrabold uppercase tracking-wider text-gray-400">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            <span className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-800 flex items-center justify-center font-bold text-xxs">1</span>
            <span>Exam Specs</span>
          </div>
          <div className="h-px bg-gray-250 dark:bg-gray-800 flex-1 mx-4" />
          
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            <span className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-800 flex items-center justify-center font-bold text-xxs">2</span>
            <span>Questions Pool</span>
          </div>
          <div className="h-px bg-gray-250 dark:bg-gray-800 flex-1 mx-4" />

          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            <span className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-800 flex items-center justify-center font-bold text-xxs">3</span>
            <span>Publish Specs</span>
          </div>
        </div>

        {/* Step 1: Basic details */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-gray-905 dark:text-white">Step 1: Exam Configurations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Target Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm appearance-none cursor-pointer"
                >
                  {courses?.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Assessment Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm appearance-none cursor-pointer"
                >
                  <option value="quiz">Online Quiz</option>
                  <option value="exam">Semester Final Exam</option>
                  <option value="assignment">Homework Assignment</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xxs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-2">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures Midterm Evaluation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-55/60 dark:bg-gray-855 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm font-semibold text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xxs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  placeholder="Specify examination directives, instructions, or scope templates..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 px-4 py-2.5 bg-gray-55/60 dark:bg-gray-855 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold leading-relaxed resize-none text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-55/60 dark:bg-gray-855 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Passing Score Percentage (%)</label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-55/60 dark:bg-gray-855 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/20 rounded-xl">
                <div className="flex gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Enforce AI Proctoring</h4>
                    <p className="text-xxs text-gray-500 dark:text-gray-450 mt-0.5">Locks player fullscreen mode and records student browser tab switching events.</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isProctored}
                    onChange={(e) => setIsProctored(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-650 peer-checked:bg-blue-600"></div>
                </label>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-850">
              <button
                onClick={handleNextStep}
                className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs shadow-md shadow-blue-500/10"
              >
                Configure Questions Pool
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Questions pool */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-gray-905 dark:text-white">Step 2: Questions Configurator</h3>
                <p className="text-xxs text-gray-400 mt-0.5">Total assessment score: <span className="font-extrabold text-blue-650 dark:text-blue-400">{totalMarks} Points</span></p>
              </div>

              <button
                onClick={handleAddQuestion}
                className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition text-xxs"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Add Question
              </button>
            </div>

            {/* Questions list */}
            {questions.map((question, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-4 relative">
                
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveQuestion(idx)}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                  title="Delete Question"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>

                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500">
                  <span className="h-5 w-5 bg-gray-100 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg flex items-center justify-center text-xxs font-extrabold text-gray-900 dark:text-white">
                    {idx + 1}
                  </span>
                  <span>Question Metadata</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">Question Text</label>
                    <input
                      type="text"
                      placeholder="Type exam task statement..."
                      value={question.text}
                      onChange={(e) => handleQuestionChange(idx, 'text', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">Task Type</label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold cursor-pointer"
                    >
                      <option value="mcq">Single Selection MCQ</option>
                      <option value="truefalse">True / False</option>
                      <option value="fillblank">Fill in the Blank</option>
                      <option value="coding">Coding Console Terminal</option>
                      <option value="essay">Short Subjective Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">Marks Weight</label>
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => handleQuestionChange(idx, 'marks', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">Difficulty Scale (1-5)</label>
                    <select
                      value={question.difficulty}
                      onChange={(e) => handleQuestionChange(idx, 'difficulty', parseInt(e.target.value) || 3)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold cursor-pointer"
                    >
                      <option value="1">1 - Easiest</option>
                      <option value="2">2 - Easy</option>
                      <option value="3">3 - Balanced</option>
                      <option value="4">4 - Advanced</option>
                      <option value="5">5 - Extreme</option>
                    </select>
                  </div>
                </div>

                {/* Sub-inputs based on question type */}
                {question.type === 'mcq' && (
                  <div className="pt-4 border-t border-gray-50 dark:border-gray-850 space-y-4">
                    <label className="block text-xxs font-bold text-gray-400 uppercase">MCQ Choice Options</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="text-xxs font-bold text-gray-400 uppercase font-mono">{String.fromCharCode(65 + optIdx)}.</span>
                          <input
                            type="text"
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => handleMCQOptionChange(idx, optIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none transition text-xxs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Correct answer text block input */}
                {question.type !== 'essay' && (
                  <div className="pt-4 border-t border-gray-50 dark:border-gray-850 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">
                        {question.type === 'mcq' ? 'Correct Option text' : question.type === 'coding' ? 'Expected Stdout Assert' : 'Correct Response Value'}
                      </label>
                      <input
                        type="text"
                        placeholder={question.type === 'mcq' ? 'Must match options exactly' : question.type === 'truefalse' ? 'True or False' : 'Reference validation value...'}
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">Explanation Reference</label>
                      <input
                        type="text"
                        placeholder="Explain assertion guidelines..."
                        value={question.explanation}
                        onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}

              </div>
            ))}

            <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl shadow-sm">
              <button
                onClick={handlePrevStep}
                className="flex items-center px-4 py-2.5 border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-450 font-bold rounded-xl transition text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Go Back
              </button>

              <button
                onClick={handleNextStep}
                className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs shadow-md shadow-blue-500/10"
              >
                Review Specs
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final preview & publish */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-905 dark:text-white">Step 3: Exam Blueprint Verification</h3>
            
            <div className="p-4 bg-gray-55/40 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3.5 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                <span className="font-semibold text-gray-500">Exam Title:</span>
                <span className="font-bold">{title}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                <span className="font-semibold text-gray-500">Syllabus Course:</span>
                <span className="font-bold">{courses?.find(c => c.courseId === courseId)?.title || 'Course'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                <span className="font-semibold text-gray-500">Duration:</span>
                <span className="font-bold">{duration ? `${duration} Minutes` : 'Unlimited'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
                <span className="font-semibold text-gray-500">Questions Count:</span>
                <span className="font-bold">{questions.length} Questions</span>
              </div>
              <div className="flex justify-between items-center pb-1 font-bold text-sm">
                <span className="text-gray-500">Total Marks Weight:</span>
                <span className="text-blue-600 dark:text-blue-400">{totalMarks} Points</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-850">
              <button
                disabled={submitting}
                onClick={handlePrevStep}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-350 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Go Back
              </button>

              <button
                disabled={submitting}
                onClick={() => handleSaveAssessment(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-250 font-bold rounded-xl transition text-xs"
              >
                Save as Draft
              </button>

              <button
                disabled={submitting}
                onClick={() => handleSaveAssessment(true)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-xs shadow-md shadow-blue-500/10"
              >
                Publish Exam
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success confirmation screen */}
        {step === 4 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-8 shadow-sm text-center space-y-4 flex flex-col items-center">
            <CheckCircle className="h-14 w-14 text-emerald-500 animate-bounce" />
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Assessment Setup Complete!</h3>
              <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                The online exam structure has been synced successfully with the database. Students can now access evaluations from their respective dashboards.
              </p>
            </div>

            <div className="pt-4 flex gap-4 w-full max-w-xs justify-center">
              <button
                onClick={() => router.push('/faculty/courses')}
                className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-750 text-gray-700 dark:text-gray-350 rounded-xl font-bold transition text-xs"
              >
                My Courses
              </button>
              
              <button
                onClick={() => router.push('/faculty/assessments')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs shadow-sm"
              >
                Assessments List
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
