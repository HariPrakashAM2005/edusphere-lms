'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import api from '../../../../../lib/api';
import {
  BarChart3,
  ShieldAlert,
  ArrowLeft,
  Download,
  Users,
  Trophy,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface RankingStudent {
  name: string;
  email: string;
  score: number;
  percentage: number;
  isPassed: boolean;
  durationMinutes: number;
}

interface ProctoringViolation {
  studentName: string;
  studentEmail: string;
  attemptId: string;
  tabSwitches: number;
  fullscreenExits: number;
  reason: string;
}

interface ExamAnalytics {
  title: string;
  type: string;
  totalMarks: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  totalAttempts: number;
  rankings: RankingStudent[];
  proctoringViolations: ProctoringViolation[];
}

export default function FacultyAssessmentAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'proctoring'>('leaderboard');

  // Query assessment analytics
  const { data: analytics, isLoading } = useQuery<ExamAnalytics>({
    queryKey: ['assessmentAnalyticsData', assessmentId],
    queryFn: async () => {
      const res = await api.get(`/faculty/assessments/${assessmentId}/analytics`);
      return res.data;
    },
    enabled: !!assessmentId
  });

  // Export results CSV client-side
  const handleExportCSV = () => {
    if (!analytics || analytics.rankings.length === 0) return;

    const headers = ['Rank', 'Student Name', 'Email', 'Score', 'Percentage', 'Duration (Min)', 'Status'];
    const rows = analytics.rankings.map((r, index) => [
      index + 1,
      r.name,
      r.email,
      r.score,
      `${r.percentage}%`,
      r.durationMinutes,
      r.isPassed ? 'Passed' : 'Failed'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exam_results_${assessmentId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-40 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-32 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-gray-500">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold">No exam analytics records found</h3>
          <p className="text-xs text-gray-400 mt-1">Please ensure attempts have been logged by students.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold transition"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Course
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-blue-650 hover:bg-blue-705 text-white font-bold rounded-xl text-xs transition shadow-sm"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download Results CSV
          </button>
        </div>

        {/* Info Banner */}
        <div>
          <span className="text-xxs font-bold text-blue-650 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full capitalize">
            {analytics.type} Analytics
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">{analytics.title}</h1>
          <p className="text-xxs text-gray-400 mt-1 font-semibold">Total possible marks: {analytics.totalMarks} Points</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Total Attempts</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{analytics.totalAttempts}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Average Score</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {analytics.averageScore} <span className="text-xxs text-gray-450 dark:text-gray-500 font-semibold">/ {analytics.totalMarks}</span>
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-650">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Highest Score</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{analytics.highestScore}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-655">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider">Passing Rate</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{analytics.passRate}%</h3>
            </div>
          </div>

        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-3 text-xs md:text-sm font-extrabold uppercase tracking-wider transition relative ${
              activeTab === 'leaderboard' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-450 dark:text-gray-500 hover:text-gray-700'
            }`}
          >
            Syllabus Leaderboard
          </button>
          
          <button
            onClick={() => setActiveTab('proctoring')}
            className={`pb-3 text-xs md:text-sm font-extrabold uppercase tracking-wider transition relative flex items-center gap-1.5 ${
              activeTab === 'proctoring' 
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400' 
                : 'text-gray-450 dark:text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Proctoring Logs ({analytics.proctoringViolations.length})
          </button>
        </div>

        {/* View Grid Switch */}
        {activeTab === 'leaderboard' ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Student Rankings List</h3>
            
            {analytics.rankings.length === 0 ? (
              <div className="py-12 text-center text-gray-450 dark:text-gray-500">
                <Users className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-800 mb-3" />
                <p className="text-sm font-bold">No students have taken this exam yet</p>
                <p className="text-xs text-gray-500 mt-1">Schedules and upcoming test portals will display once attempts are loaded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-850 text-xxs font-extrabold uppercase tracking-wider text-gray-450 dark:text-gray-500 pb-3">
                      <th className="pb-3 pr-4">Rank</th>
                      <th className="pb-3 pr-4">Student</th>
                      <th className="pb-3 pr-4">Score</th>
                      <th className="pb-3 pr-4">Percentage</th>
                      <th className="pb-3 pr-4">Duration</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                    {analytics.rankings.map((student, idx) => (
                      <tr key={idx} className="text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50/40 dark:hover:bg-gray-850/20 transition-colors">
                        <td className="py-4 pr-4 font-bold text-gray-900 dark:text-white">#{idx + 1}</td>
                        <td className="py-4 pr-4">
                          <div className="font-bold text-gray-905 dark:text-white">{student.name}</div>
                          <div className="text-xxs text-gray-400 mt-0.5">{student.email}</div>
                        </td>
                        <td className="py-4 pr-4 font-semibold">
                          {student.score} <span className="text-xxs text-gray-400">/ {analytics.totalMarks}</span>
                        </td>
                        <td className="py-4 pr-4 font-mono font-bold text-blue-650 dark:text-blue-400">{student.percentage}%</td>
                        <td className="py-4 pr-4 text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{student.durationMinutes} Min</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`text-xxs font-extrabold px-2.5 py-0.5 rounded-full ${
                            student.isPassed 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-450'
                          }`}>
                            {student.isPassed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Proctoring Violations Log list view */
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-amber-500 mb-6">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Proctoring Suspicious Checks</h3>
            </div>

            {analytics.proctoringViolations.length === 0 ? (
              <div className="py-16 text-center text-gray-450 dark:text-gray-500 flex flex-col items-center justify-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
                <p className="text-sm font-bold">Zero Proctoring Incidents Logged</p>
                <p className="text-xs text-gray-550 mt-1 max-w-xs leading-normal">
                  All examined students complied with standard proctoring requirements. No abnormal tab switching or exiting fullscreen exits occurred.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.proctoringViolations.map((violation, idx) => (
                  <div key={idx} className="p-4 border border-amber-100 dark:border-amber-900/40 bg-amber-50/10 dark:bg-amber-950/10 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">{violation.studentName}</h4>
                        <p className="text-xxs text-gray-500 mt-0.5">{violation.studentEmail}</p>
                      </div>
                      
                      <span className="flex items-center text-xxs font-extrabold text-amber-600 bg-amber-50 dark:text-amber-450 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Flagged
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xxs font-bold uppercase tracking-wider text-gray-500 border-t border-gray-100 dark:border-gray-850 pt-2.5">
                      <div>
                        <p className="text-gray-400">Tab Switches:</p>
                        <p className="text-sm font-extrabold text-amber-600 dark:text-amber-450 mt-0.5">{violation.tabSwitches}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Fullscreen Exits:</p>
                        <p className="text-sm font-extrabold text-amber-600 dark:text-amber-450 mt-0.5">{violation.fullscreenExits}</p>
                      </div>
                    </div>

                    <p className="text-xxs text-gray-500 dark:text-gray-450 leading-relaxed border-t border-gray-100 dark:border-gray-850 pt-2.5">
                      <span className="font-bold">Proctor Reason:</span> {violation.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
