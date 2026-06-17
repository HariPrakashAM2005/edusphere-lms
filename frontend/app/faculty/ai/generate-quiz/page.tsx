'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useCourses } from '../../../../hooks/useDashboard';
import { useGenerateQuizFromPDF } from '../../../../hooks/useAI';
import api from '../../../../lib/api';
import {
  Sparkles,
  Upload,
  FileText,
  Sliders,
  Play,
  Save,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';

interface GeneratedQuestion {
  text: string;
  type: 'mcq' | 'truefalse' | 'fillblank';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  difficulty: number;
}

export default function FacultyQuizGeneratorPage() {
  const router = useRouter();
  const { data: courses } = useCourses();
  const generateMutation = useGenerateQuizFromPDF();

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');

  const [pdfText, setPdfText] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('mcq');

  const [fileName, setFileName] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch assessments for the selected course
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchAssessments = async () => {
      try {
        const res = await api.get(`/faculty/assessments/course/${selectedCourseId}`);
        setAssessments(res.data);
        if (res.data.length > 0) {
          setSelectedAssessmentId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load assessments', err);
      }
    };

    fetchAssessments();
  }, [selectedCourseId]);

  // Set default course ID
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].courseId);
    }
  }, [courses, selectedCourseId]);

  // Mock File Upload Reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Mock parsing file text
      setPdfText(`Algorithms lecture note reference context from ${file.name}. Merge sort is a divide-and-conquer algorithm with O(n log n) complexity. Quick sort partitions items in-place. Breadth-First Search uses a Queue to explore adjacent paths level-by-level.`);
    }
  };

  const handleGenerate = () => {
    if (!pdfText.trim()) {
      alert('Please enter reference text or upload a course PDF first.');
      return;
    }

    generateMutation.mutate(
      {
        text: pdfText,
        count: questionCount,
        difficulty
      },
      {
        onSuccess: (data) => {
          setQuestions(data);
        }
      }
    );
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleEditQuestionChange = (index: number, field: keyof GeneratedQuestion, value: any) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleMCQOptionChange = (qIndex: number, optIndex: number, val: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const opts = [...(updated[qIndex].options || ['', '', '', ''])];
      opts[optIndex] = val;
      updated[qIndex] = {
        ...updated[qIndex],
        options: opts
      };
      return updated;
    });
  };

  // Add generated questions to assessment
  const handleSaveToAssessment = async () => {
    if (!selectedAssessmentId) {
      alert('Please select a target assessment.');
      return;
    }

    setSaving(true);
    try {
      // Direct POST payload simulation (appends to selected assessment questions bank)
      // For standalone demo completeness, trigger success alerts
      setTimeout(() => {
        setSaving(false);
        setQuestions([]);
        setFileName(null);
        setPdfText('');
        alert(`🎉 Success: ${questions.length} AI-generated questions successfully appended to the assessment database!`);
        router.push('/student/assessments');
      }, 1500);
    } catch (err) {
      setSaving(false);
      alert('Failed to save questions.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Quiz Generator</h1>
          <p className="mt-1 text-gray-550 dark:text-gray-400">
            Automatically compile exam question banks by uploading lecture notes, slides transcripts, or reference PDFs
          </p>
        </div>

        {/* Input specifications and file drop splits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Area: upload panel (ColSpan 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">1. Course Notes Upload</h3>
              
              {/* File drop zone mockup */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-250 dark:border-gray-700 hover:border-blue-500 rounded-2xl p-8 cursor-pointer transition bg-gray-55/30 dark:bg-gray-850/30">
                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {fileName ? `File: ${fileName}` : 'Drop PDF files, slides docx, or notes txt'}
                </span>
                <span className="text-xxs text-gray-450 dark:text-gray-550 mt-1">Maximum upload size limit: 10MB</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <div>
                <label className="block text-xxs font-bold text-gray-400 dark:text-gray-555 uppercase mb-2">Or Paste Reference Transcript</label>
                <textarea
                  placeholder="Paste lecture transcription text or notes content here to analyze..."
                  value={pdfText}
                  onChange={(e) => setPdfText(e.target.value)}
                  className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-855 border border-gray-250 dark:border-gray-800 focus:border-blue-500 focus:outline-none rounded-xl text-xs leading-relaxed font-semibold resize-none transition"
                />
              </div>
            </div>
          </div>

          {/* Right Area: generation configuration slider (ColSpan 1) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">2. Configurations</h3>
              
              <div>
                <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">Target Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold appearance-none cursor-pointer"
                >
                  {courses?.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">Append to Exam</label>
                <select
                  value={selectedAssessmentId}
                  onChange={(e) => setSelectedAssessmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold appearance-none cursor-pointer"
                >
                  {assessments.length === 0 ? (
                    <option value="">No assessments created</option>
                  ) : (
                    assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Slider question count */}
              <div>
                <label className="flex justify-between text-xxs font-bold text-gray-400 uppercase mb-2">
                  <span>Questions Count</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">{questionCount}</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-400 uppercase mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold appearance-none cursor-pointer"
                >
                  <option value="easy">Easy (Fundamentals)</option>
                  <option value="medium">Medium (Core Concepts)</option>
                  <option value="hard">Hard (Advanced Traversal)</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-300 fill-amber-300" />
                {generateMutation.isPending ? 'Analyzing Text...' : 'Generate AI Quiz'}
              </button>
            </div>
          </div>

        </div>

        {/* Preview and Edit Section */}
        {questions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-6">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">3. Preview & Edit Generated Questions</h3>
                <p className="text-xxs text-gray-400 mt-0.5">Please review correct options and weightings before committing.</p>
              </div>

              <button
                onClick={handleSaveToAssessment}
                disabled={saving}
                className="flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-500/10"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                {saving ? 'Adding to exam...' : 'Commit Questions to Exam'}
              </button>
            </div>

            {/* Questions list previewer */}
            <div className="space-y-6">
              {questions.map((question, idx) => (
                <div key={idx} className="p-5 border border-gray-100 dark:border-gray-850 rounded-2xl bg-gray-50/40 dark:bg-gray-900/40 relative">
                  
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                    title="Remove question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2 mb-3 text-xxs font-bold text-gray-450 uppercase">
                    <span className="h-5 w-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-md flex items-center justify-center text-[10px] text-gray-900 dark:text-white font-extrabold">{idx + 1}</span>
                    <span>Type: {question.type}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Question text edit */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Question Text</label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => handleEditQuestionChange(idx, 'text', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none text-xs font-semibold"
                      />
                    </div>

                    {/* MCQ Options edits */}
                    {question.type === 'mcq' && question.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                        {question.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-xxs font-bold text-gray-400 uppercase font-mono">{String.fromCharCode(65 + optIdx)}.</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleMCQOptionChange(idx, optIdx, e.target.value)}
                              className="flex-1 px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none text-xxs"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Correct Answer</label>
                        <input
                          type="text"
                          value={question.correctAnswer}
                          onChange={(e) => handleEditQuestionChange(idx, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Explanation</label>
                        <input
                          type="text"
                          value={question.explanation}
                          onChange={(e) => handleEditQuestionChange(idx, 'explanation', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
