'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useCourseRecommendations } from '../../../hooks/useAI';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import {
  Sparkles,
  RefreshCw,
  X,
  Compass,
  ArrowRight,
  BookmarkPlus,
  BookOpen,
  Activity,
  Award,
  AlertTriangle
} from 'lucide-react';

interface LearningPathTimelineItem {
  phase: string;
  topics: string[];
  status: 'completed' | 'recommended';
  completionRate: number;
}

interface LearningPathResponse {
  pace: string;
  recommendedFocus: string;
  timeline: LearningPathTimelineItem[];
}

export default function StudentRecommendationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: recommendations, isLoading: recsLoading, refetch } = useCourseRecommendations();

  const [dismissedCourseIds, setDismissedCourseIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Query: Student customized learning path
  const { data: pathData, isLoading: pathLoading } = useQuery<LearningPathResponse>({
    queryKey: ['learningPath', user?.id],
    queryFn: async () => {
      const res = await api.get(`/ai/learning-path/${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setDismissedCourseIds([]);
    setRefreshing(false);
  };

  const handleDismiss = (courseId: string) => {
    setDismissedCourseIds(prev => [...prev, courseId]);
  };

  const activeRecs = recommendations?.filter(r => !dismissedCourseIds.includes(r.courseId)) || [];
  const isLoading = recsLoading || pathLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Personalized Recommendations</h1>
            <p className="mt-1 text-gray-550 dark:text-gray-400">
              AI-driven course matching algorithms and personalized curriculum path visualizations
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-xs shrink-0 disabled:opacity-75"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Recommendations
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
            <div className="h-96 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Learning Path Visualizer (ColSpan 2) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-850 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">AI-Optimized Learning Path</h3>
                    <p className="text-xxs text-gray-400 mt-0.5">Study Pace: <span className="font-bold text-blue-600 capitalize">{pathData?.pace || 'standard'}</span></p>
                  </div>

                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 text-xxs font-bold rounded-full">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    Custom Timeline
                  </span>
                </div>

                {/* Path Focus Alert block */}
                {pathData?.recommendedFocus && (
                  <div className="p-4 bg-blue-50/15 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl text-xxs font-bold text-blue-650 dark:text-blue-400 mb-6 leading-relaxed flex gap-2">
                    <Activity className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-bold">Next Curriculum Focus Recommendations:</p>
                      <p className="opacity-90 font-semibold mt-0.5">{pathData.recommendedFocus}</p>
                    </div>
                  </div>
                )}

                {/* Vertical Step Timeline graph */}
                <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                  {pathData?.timeline?.map((item, idx) => (
                    <div key={idx} className="flex gap-6 relative pl-8 select-text">
                      {/* Circle dot marker */}
                      <span className={`absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-white dark:bg-gray-950 transition ${
                        item.status === 'completed' 
                          ? 'border-emerald-500 bg-emerald-500' 
                          : 'border-blue-500 bg-blue-500'
                      }`} />

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center gap-4">
                          <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{item.phase}</h4>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            item.status === 'completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                              : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Topics badges */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.topics.map((t, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 rounded text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="pt-2">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                            <span>Completion Rate</span>
                            <span>{item.completionRate}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                item.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${item.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Right Col: Matches cards feed (ColSpan 1) */}
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-gray-400 dark:text-gray-550 uppercase tracking-widest flex items-center gap-2">
                <Compass className="h-4.5 w-4.5" />
                Collaborative Recommendations
              </h3>

              {activeRecs.length === 0 ? (
                <div className="p-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl text-center text-gray-400">
                  <X className="h-10 w-10 mx-auto text-gray-300 mb-2.5" />
                  <p className="text-xs font-bold">No active matches found</p>
                  <p className="text-xxs text-gray-500 mt-0.5">Refetch recommendations to reset dismissed suggestions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRecs.map((rec) => (
                    <div
                      key={rec.courseId}
                      className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm space-y-4 relative hover:shadow-md transition group"
                    >
                      {/* Dismiss button */}
                      <button
                        onClick={() => handleDismiss(rec.courseId)}
                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Dismiss recommendation"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <div className="space-y-2">
                        {/* Match score Badge */}
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                          {rec.score}% Match Score
                        </span>

                        <h4 className="font-extrabold text-gray-905 dark:text-white text-xs md:text-sm leading-snug pr-6">
                          {rec.title}
                        </h4>
                        
                        <p className="text-xxs text-gray-550 leading-relaxed truncate-2-lines">
                          {rec.description}
                        </p>
                      </div>

                      {/* Reason labels */}
                      <div className="pt-3 border-t border-gray-50 dark:border-gray-850 flex items-center justify-between gap-4">
                        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider truncate max-w-[160px]">
                          {rec.reason}
                        </span>

                        <button className="flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0">
                          Inspect <ArrowRight className="h-3 w-3 ml-0.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
