'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  method: string;
  location: string;
}

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

export default function AttendanceCalendar({ records }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'late': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'absent': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'excused': return 'bg-blue-400 hover:bg-blue-500 text-white';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
    }
  };

  const getRecordForDay = (day: Date) => {
    return records.find((r) => isSameDay(new Date(r.date), day));
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm">
      
      {/* Month Control Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-lg text-xs transition"
          >
            Prev
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-lg text-xs transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Weekdays indicator */}
      <div className="grid grid-cols-7 gap-2 text-center text-xxs font-bold uppercase tracking-wider text-gray-400 mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Month days grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Spacer offset for first day of week */}
        {Array.from({ length: monthStart.getDay() }).map((_, idx) => (
          <div key={`space-${idx}`} className="aspect-square opacity-0 pointer-events-none" />
        ))}

        {daysInMonth.map((day) => {
          const record = getRecordForDay(day);
          const colorClass = getStatusColor(record?.status || '');
          const isToday = isSameDay(new Date(), day);

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition duration-150 cursor-pointer relative group ${colorClass} ${
                isToday && !record ? 'border-2 border-blue-500' : ''
              }`}
            >
              <span>{format(day, 'd')}</span>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 hidden group-hover:block z-40 bg-gray-950 text-white rounded-lg p-2 text-xxs shadow-xl border border-gray-800">
                <p className="font-bold">{format(day, 'MMM d, yyyy')}</p>
                {record ? (
                  <>
                    <p className="capitalize mt-1 font-bold">Status: {record.status}</p>
                    <p className="text-gray-400 mt-0.5 truncate">Course: {record.courseTitle}</p>
                    <p className="text-gray-400 mt-0.5">Method: {record.method}</p>
                  </>
                ) : (
                  <p className="text-gray-400 mt-1">No attendance logged</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-850 flex flex-wrap gap-4 items-center justify-center text-xxs font-bold text-gray-500 uppercase tracking-wider">
        <div className="flex items-center">
          <span className="h-3.5 w-3.5 rounded bg-emerald-500 mr-1.5" />
          <span>Present</span>
        </div>
        <div className="flex items-center">
          <span className="h-3.5 w-3.5 rounded bg-amber-500 mr-1.5" />
          <span>Late</span>
        </div>
        <div className="flex items-center">
          <span className="h-3.5 w-3.5 rounded bg-red-500 mr-1.5" />
          <span>Absent</span>
        </div>
        <div className="flex items-center">
          <span className="h-3.5 w-3.5 rounded bg-blue-400 mr-1.5" />
          <span>Excused</span>
        </div>
        <div className="flex items-center">
          <span className="h-3.5 w-3.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 mr-1.5" />
          <span>Unmarked</span>
        </div>
      </div>

    </div>
  );
}
