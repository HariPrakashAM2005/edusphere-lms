'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import CertificateCard from '../../../components/certificate/CertificateCard';
import api from '../../../lib/api';
import {
  FileText,
  Clock,
  Award,
  Search,
  Filter,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Trophy,
  History,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  courseTitle: string;
  courseId: string;
  duration: number | null;
  totalMarks: number;
  isProctored: boolean;
  attemptStatus: 'not-started' | 'in-progress' | 'submitted' | 'timed-out';
  attemptId: string | null;
  score: number | null;
}

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'exams' | 'certificates'>('exams');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  // Query: Student Assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery<Assessment[]>({
    queryKey: ['studentAssessments'],
    queryFn: async () => {
      const res = await api.get('/student/assessments/upcoming');
      return res.data;
    }
  });

  // Query: Student Certificates
  const { data: certificates, isLoading: certificatesLoading } = useQuery<any[]>({
    queryKey: ['studentCertificates'],
    queryFn: async () => {
      const res = await api.get('/student/certificates');
      return res.data;
    }
  });

  const isLoading = assessmentsLoading || certificatesLoading;

  // Filter listings
  const filteredAssessments = assessments?.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'all' || a.courseId === courseFilter;
    return matchesSearch && matchesCourse;
  }) || [];

  // Extract unique course IDs & titles
  const coursesList = Array.from(
    new Map(assessments?.map(a => [a.courseId, a.courseTitle])).entries()
  ).map(([id, title]) => ({ id, title }));

  // Separate active/upcoming from completed assessments
  const activeExams = filteredAssessments.filter(a => a.attemptStatus !== 'submitted');
  const pastAttempts = filteredAssessments.filter(a => a.attemptStatus === 'submitted');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Assessments & Certifications</h1>
          <p className="mt-1 text-gray-550 dark:text-gray-400">
            Take exams, audit previous grading results, review proctored checklists, and download verifiable blockchain credentials
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6">
          <button
            onClick={() => setActiveTab('exams')}
            className={`pb-3 text-xs md:text-sm font-extrabold uppercase tracking-wider transition relative ${
              activeTab === 'exams' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-450 dark:text-gray-500 hover:text-gray-700'
            }`}
          >
            Active & Past Exams
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 text-xs md:text-sm font-extrabold uppercase tracking-wider transition relative ${
              activeTab === 'certificates' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-450 dark:text-gray-500 hover:text-gray-700'
            }`}
          >
            My Certifications ({certificates?.length || 0})
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessment keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm"
            />
          </div>

          <div className="w-full md:w-64 flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold appearance-none cursor-pointer"
            >
              <option value="all">All Enrolled Courses</option>
              {coursesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-44 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'exams' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Active assessments (ColSpan 2) */}
            <div className="lg:col-span-2 space-y-5">
              <h3 className="text-sm font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5" />
                Active Test Portals
              </h3>
              
              {activeExams.length === 0 ? (
                <div className="py-12 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl text-center text-gray-450 dark:text-gray-500">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">All tests completed!</p>
                  <p className="text-xs text-gray-550 mt-1">There are no upcoming or pending online examinations assigned.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeExams.map((exam) => (
                    <div key={exam.id} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                      <div className="space-y-3">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <span className="text-xxs font-bold text-blue-650 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 px-2 py-0.5 rounded-full capitalize">
                            {exam.type}
                          </span>
                          {exam.isProctored && (
                            <span className="flex items-center gap-1 text-xxs font-bold text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 px-2 py-0.5 rounded-full ring-1 ring-amber-200 dark:ring-amber-900/40">
                              <ShieldAlert className="h-3 w-3 animate-pulse" />
                              AI Proctored
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-extrabold text-gray-900 dark:text-white text-sm md:text-base leading-snug">{exam.title}</h4>
                          <p className="text-xxs text-gray-400 dark:text-gray-500 mt-1 font-semibold">{exam.courseTitle}</p>
                        </div>
                        
                        <p className="text-xxs text-gray-550 leading-relaxed truncate-2-lines">{exam.description || 'No description provided.'}</p>
                        
                        <div className="flex gap-4 pt-2 border-t border-gray-50 dark:border-gray-850 text-xxs text-gray-500 font-semibold">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-450" />
                            <span>{exam.duration ? `${exam.duration} Min` : 'No Limit'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-gray-450" />
                            <span>{exam.totalMarks} Marks</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/student/assessments/take/${exam.id}`)}
                        className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-xs shadow-md shadow-blue-500/10 flex items-center justify-center gap-1 hover:gap-1.5"
                      >
                        {exam.attemptStatus === 'in-progress' ? 'Resume Attempt' : 'Enter Test Portal'}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Grading outcomes & feedback logs (ColSpan 1) */}
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-gray-400 dark:text-gray-550 uppercase tracking-widest flex items-center gap-2">
                <History className="h-4.5 w-4.5" />
                Grading Outcomes
              </h3>
              
              {pastAttempts.length === 0 ? (
                <div className="py-12 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl text-center text-gray-400 dark:text-gray-550">
                  <AlertCircle className="h-9 w-9 mx-auto mb-2 text-gray-300 dark:text-gray-800" />
                  <p className="text-xs font-semibold">No graded logs found</p>
                  <p className="text-xxs text-gray-550 mt-0.5">Submit exam sessions to register automatic scorecard metrics.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      onClick={() => router.push(`/student/assessments/results/${attempt.id}`)}
                      className="p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 hover:border-gray-250 dark:hover:border-gray-700 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <h4 className="font-bold text-xs truncate text-gray-900 dark:text-white">{attempt.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xxs text-gray-500 font-semibold">
                          <span className="truncate max-w-[120px]">{attempt.courseTitle}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Trophy className="h-3 w-3" />
                            Grade Score
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-gray-900 dark:text-white font-extrabold text-sm">
                        <span>{attempt.score}</span>
                        <span className="text-xxs text-gray-400">/ {attempt.totalMarks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Certificates tab view */
          <div className="space-y-5">
            <h3 className="text-sm font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Award className="h-4.5 w-4.5" />
              Awarded Verifications
            </h3>

            {certificates && certificates.length === 0 ? (
              <div className="py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl text-center text-gray-450 dark:text-gray-500">
                <Award className="h-12 w-12 text-gray-300 dark:text-gray-850 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-850 dark:text-gray-250">No certifications earned yet</p>
                <p className="text-xs text-gray-550 mt-1 max-w-sm mx-auto">
                  Earn academic achievements by completing syllabus curriculums and achieving passing grades (&gt;= passing threshold) on examination metrics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates?.map((cert) => (
                  <CertificateCard key={cert.id} certificate={cert} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
