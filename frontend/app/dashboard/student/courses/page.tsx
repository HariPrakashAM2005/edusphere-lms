'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import CourseCard from '../../../../components/dashboard/CourseCard';
import { useCourses } from '../../../../hooks/useDashboard';
import { Search, Filter, AlertCircle, BookOpen } from 'lucide-react';

type FilterType = 'all' | 'in_progress' | 'completed';

export default function CoursesPage() {
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredCourses = courses?.filter((course) => {
    // 1. Search filter
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Status filter
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'in_progress') return matchesSearch && course.progress < 100 && course.progress > 0;
    if (activeFilter === 'completed') return matchesSearch && course.progress === 100;
    
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Your Courses</h1>
            <p className="mt-1 text-gray-650 dark:text-gray-400">
              Manage your learning curricula and track lesson completions
            </p>
          </div>
        </header>

        {/* Filter controls and Search bar */}
        <section className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search course title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm"
            />
          </div>

          {/* Filter selector */}
          <div className="flex gap-2 bg-gray-50 dark:bg-gray-850 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            {(['all', 'in_progress', 'completed'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider ${
                  activeFilter === filter
                    ? 'bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </section>

        {/* Courses grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-80 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredCourses && filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.courseId}
                title={course.title}
                category={course.category}
                progress={course.progress}
                instructor={course.instructor}
                nextDeadline={course.nextDeadline}
                onClick={() => router.push(`/dashboard/student/courses/${course.courseId}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl py-16 text-center shadow-sm">
            <AlertCircle className="h-10 w-10 text-gray-300 dark:text-gray-750 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">No courses found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-405 mt-1 max-w-xs mx-auto">
              We couldn't find any courses matching your search criteria or active status filter.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
