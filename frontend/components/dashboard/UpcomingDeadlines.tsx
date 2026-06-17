'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, AlertCircle } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  type: 'assignment' | 'exam';
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

export default function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  // Format simple countdown
  const getCountdown = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (deadlines.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
        <p className="text-sm font-medium">No upcoming deadlines</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-850">
      {deadlines.map((deadline) => {
        const isExam = deadline.type === 'exam';
        const isNear = new Date(deadline.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // less than 3 days

        return (
          <div key={deadline.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {deadline.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-405 truncate mt-0.5">
                {deadline.courseTitle}
              </p>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span className={`inline-block text-xxs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isExam 
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' 
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              }`}>
                {deadline.type}
              </span>
              
              <span className={`text-xxs font-semibold mt-1.5 flex items-center ${
                isNear ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <Calendar className="h-3 w-3 mr-1" />
                {getCountdown(deadline.dueDate)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
