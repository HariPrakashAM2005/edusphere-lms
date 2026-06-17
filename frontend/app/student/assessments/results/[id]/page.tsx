'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import CertificateCard from '../../../../../components/certificate/CertificateCard';
import api from '../../../../../lib/api';
import {
  Trophy,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  AwardIcon,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface GradedAnswer {
  id: string;
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
  marksAwarded: number;
  totalQuestionMarks: number;
  feedback: string;
}

interface AttemptResult {
  attemptId: string;
  title: string;
  type: string;
  courseTitle: string;
  courseId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  endTime: string;
  rank: number;
  totalStudents: number;
  answers: GradedAnswer[];
  certificate?: any | null;
}

export default function StudentExamResultsPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;
  const queryClient = useQueryClient();

  const [claiming, setClaiming] = useState(false);
  const [claimedCert, setClaimedCert] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Query attempt result
  const { data: result, isLoading } = useQuery<AttemptResult>({
    queryKey: ['examResult', assessmentId],
    queryFn: async () => {
      const res = await api.get(`/student/assessments/${assessmentId}/result`);
      return res.data;
    },
    enabled: !!assessmentId
  });

  // Load claimed certificate from database result on page load
  useEffect(() => {
    if (result?.certificate) {
      setClaimedCert(result.certificate);
    }
  }, [result]);

  // Mutation to claim certificate
  const claimCertificateMutation = useMutation({
    mutationFn: async (courseId: string) => {
      setErrorMsg(null);
      const res = await api.post(`/student/certificates/${courseId}/generate`);
      return res.data;
    },
    onSuccess: (data) => {
      setClaimedCert(data);
      queryClient.invalidateQueries({ queryKey: ['studentCertificates'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Failed to generate certificate.');
    }
  });

  const handleClaimCertificate = () => {
    if (!result) return;
    setClaiming(true);
    claimCertificateMutation.mutate(result.courseId, {
      onSettled: () => setClaiming(false)
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-40 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
            <div className="h-96 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-gray-500">
          <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold">No scorecard record found</h3>
          <p className="text-xs text-gray-400 mt-1">Please make sure the exam attempt has been finalized.</p>
          <button
            onClick={() => router.push('/student/assessments')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold transition"
          >
            Go back to assessments
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const correctAnswersCount = result.answers.filter((a) => a.isCorrect).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Navigation path & Title */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-4">
          <button
            onClick={() => router.push('/student/assessments')}
            className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Exams
          </button>
          
          <span className="text-xxs font-mono text-gray-400">
            Attempt Ref: {result.attemptId.slice(-10)}
          </span>
        </div>

        {/* Scorecard Header Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Circular Score display card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest mb-3">Overall Performance</p>
            
            <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-8 border-gray-100 dark:border-gray-800">
              {/* Colored status track */}
              <div className={`absolute inset-0 rounded-full border-8 border-t-transparent border-l-transparent ${
                result.isPassed ? 'border-emerald-500' : 'border-red-500'
              }`} />
              
              <div className="text-center">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{result.score}</span>
                <span className="text-xs text-gray-450 dark:text-gray-500 block mt-0.5">/ {result.totalMarks} Marks</span>
              </div>
            </div>

            <p className="text-xxs font-bold text-gray-400 dark:text-gray-500 mt-4 uppercase">
              Percentage: <span className="font-extrabold text-gray-900 dark:text-white">{result.percentage}%</span>
            </p>
          </div>

          {/* Metrics list card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xxs font-bold text-blue-650 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full capitalize">
                {result.type} scorecard
              </span>
              <div>
                <h3 className="text-base font-extrabold text-gray-905 dark:text-white leading-snug">{result.title}</h3>
                <p className="text-xxs text-gray-400 mt-1 font-semibold">{result.courseTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-gray-50 dark:border-gray-850">
              <div>
                <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Pass Status</p>
                <span className={`inline-block text-xxs font-extrabold px-2.5 py-0.5 rounded-full mt-1 ${
                  result.isPassed 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-450'
                }`}>
                  {result.isPassed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              
              <div>
                <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Class Standing</p>
                <div className="flex items-center gap-1 mt-1 text-sm font-extrabold text-gray-900 dark:text-white">
                  <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>{result.rank} <span className="text-xxs text-gray-400 font-semibold">of {result.totalStudents}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Claim portal */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center">
            {result.isPassed ? (
              claimedCert ? (
                // Display earned badge/card
                <div className="w-full">
                  <CertificateCard certificate={claimedCert} />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <AwardIcon className="h-10 w-10 text-amber-500 mx-auto animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Certificate Earned!</h4>
                    <p className="text-xxs text-gray-400 mt-1 leading-normal max-w-xs">
                      You completed all evaluations successfully. Claim your verifiable blockchain-referenced certification.
                    </p>
                  </div>
                  
                  {errorMsg && (
                    <p className="text-xxs font-semibold text-red-550">{errorMsg}</p>
                  )}

                  <button
                    onClick={handleClaimCertificate}
                    disabled={claiming}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
                  >
                    {claiming ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Claim Certification Badge</span>
                      </>
                    )}
                  </button>
                </div>
              )
            ) : (
              <div className="text-center space-y-3.5 py-6">
                <XCircle className="h-10 w-10 text-red-450 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Certificate Locked</h4>
                  <p className="text-xxs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Passing threshold of <span className="font-bold">50%</span> was not met. Re-study syllabus modules and request a re-evaluation from faculty.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Detailed Question breakdown */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Detailed Evaluation Report</h3>
            <span className="text-xxs font-bold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">
              {correctAnswersCount} / {result.answers.length} Correct assertions
            </span>
          </div>

          <div className="space-y-6 divide-y divide-gray-100 dark:divide-gray-850">
            {result.answers.map((answer, index) => {
              // MCQ answers display format mapper
              const isMcqOrTF = answer.questionText.toLowerCase().includes('select') || answer.studentAnswer.length < 50;

              return (
                <div key={answer.id} className={`pt-6 ${index === 0 ? 'pt-0' : ''} space-y-4`}>
                  {/* Question header info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-2">
                      <span className="h-5 w-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center text-xxs font-bold text-gray-550 shrink-0">
                        {index + 1}
                      </span>
                      <h4 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-250 leading-relaxed">
                        {answer.questionText}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      {answer.isCorrect ? (
                        <span className="flex items-center text-xxs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Correct
                        </span>
                      ) : (
                        <span className="flex items-center text-xxs font-bold text-red-650 bg-red-50 dark:text-red-400 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3 mr-1" />
                          Incorrect
                        </span>
                      )}
                      
                      <span className="text-xxs font-bold text-gray-500">
                        {answer.marksAwarded} / {answer.totalQuestionMarks} Marks
                      </span>
                    </div>
                  </div>

                  {/* Student vs Expected Output display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xxs font-mono leading-relaxed mt-3">
                    <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-850/50">
                      <p className="font-bold text-gray-450 dark:text-gray-500 uppercase tracking-widest mb-1.5">Your Submission:</p>
                      <pre className={`whitespace-pre-wrap font-semibold ${answer.isCorrect ? 'text-emerald-655 dark:text-emerald-400' : 'text-red-650 dark:text-red-400'}`}>
                        {answer.studentAnswer || 'Empty submission'}
                      </pre>
                    </div>

                    <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-55/60 dark:bg-gray-850/80">
                      <p className="font-bold text-gray-450 dark:text-gray-500 uppercase tracking-widest mb-1.5">Expected Assertions:</p>
                      <pre className="whitespace-pre-wrap text-blue-600 dark:text-blue-400 font-semibold">
                        {answer.correctAnswer || 'Empty (Subjective manual audit)'}
                      </pre>
                    </div>
                  </div>

                  {/* Explanation feedback block */}
                  {(answer.explanation || answer.feedback) && (
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl flex items-start gap-2 text-xxs leading-relaxed">
                      <HelpCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        {answer.feedback && (
                          <p className="text-gray-700 dark:text-gray-300 font-semibold">
                            <span className="font-bold">Feedback:</span> {answer.feedback}
                          </p>
                        )}
                        {answer.explanation && (
                          <p className="text-gray-500 mt-1">
                            <span className="font-bold">Explanation:</span> {answer.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
