'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, ArrowRight, User } from 'lucide-react';

interface CourseCardProps {
  title: string;
  category: string;
  progress: number;
  instructor: string;
  nextDeadline: string;
  onClick?: () => void;
}

export default function CourseCard({
  title,
  category,
  progress,
  instructor,
  nextDeadline,
  onClick
}: CourseCardProps) {
  // Format simple date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.08)' }}
      className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-full transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        {/* Category Label */}
        <span className="inline-block text-xxs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
          {category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-3 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-450 mt-3">
          <User className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{instructor}</span>
        </div>

        {/* Next Deadline */}
        {nextDeadline && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-450 mt-2">
            <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span>Deadline: {formatDate(nextDeadline)}</span>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-2 border-t border-gray-50 dark:border-gray-850">
        {/* Progress bar */}
        <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <span>Course Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button className="w-full flex items-center justify-center py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl text-xs font-bold transition">
          Continue Learning <ArrowRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </motion.div>
  );
}
