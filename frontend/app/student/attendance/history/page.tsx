'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import AttendanceCalendar from '../../../../components/attendance/AttendanceCalendar';
import { useStudentAttendanceHistory } from '../../../../hooks/useAttendance';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  Filter,
  BarChart3,
  TrendingDown,
  Info,
  ChevronRight
} from 'lucide-react';

export default function StudentAttendanceHistoryPage() {
  const router = useRouter();
  const { data: records, isLoading } = useStudentAttendanceHistory();
  const [selectedCourse, setSelectedCourse] = useState('all');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
            <div className="h-96 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter records based on selected course
  const filteredRecords = records?.filter(record => 
    selectedCourse === 'all' || record.courseId === selectedCourse
  ) || [];

  // Extract unique courses from records for filter dropdown
  const uniqueCourses = Array.from(
    new Map(records?.map(r => [r.courseId, r.courseTitle])).entries()
  ).map(([id, title]) => ({ id, title }));

  // Calculate statistics
  const totalCount = filteredRecords.length;
  const presentCount = filteredRecords.filter(r => r.status === 'present').length;
  const lateCount = filteredRecords.filter(r => r.status === 'late').length;
  const excusedCount = filteredRecords.filter(r => r.status === 'excused').length;
  const absentCount = filteredRecords.filter(r => r.status === 'absent').length;

  // Percentage calculation: present + excused + (late counts as present or partial? Let's say present for simple rate)
  const attendanceRate = totalCount > 0 
    ? Math.round(((presentCount + excusedCount + lateCount) / totalCount) * 100) 
    : 100;

  const isLowAttendance = attendanceRate < 75;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Attendance History & Heatmap</h1>
            <p className="mt-1 text-gray-550 dark:text-gray-400">
              Track your attendance logs, calendar heatmaps, and monitor compliance metrics
            </p>
          </div>
          
          <button
            onClick={() => router.push('/student/attendance/mark')}
            className="flex items-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-sm shrink-0"
          >
            <QrCode className="h-4.5 w-4.5 mr-2" />
            Mark Attendance Now
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Filter className="h-4 w-4" />
            <span className="font-semibold">Filter by Course:</span>
          </div>
          <div className="w-full sm:w-72">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm appearance-none cursor-pointer"
            >
              <option value="all">All Enrolled Courses</option>
              {uniqueCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Low Attendance Warning Alert */}
        {isLowAttendance && totalCount > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-5 text-red-800 dark:text-red-300 flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="font-bold text-sm">Attendance Shortfall Alert!</h4>
              <p className="text-xs text-red-700 dark:text-red-300/80 leading-relaxed">
                Your overall attendance rate is currently <span className="font-extrabold text-red-650 dark:text-red-450">{attendanceRate}%</span>, which is below the institution's mandatory threshold of <span className="font-bold">75%</span>. Missing further lectures may disqualify you from participating in semester-end final examinations.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => router.push('/dashboard/student')}
                  className="text-xs font-bold flex items-center text-red-750 dark:text-red-400 hover:underline"
                >
                  View academic guidelines <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              isLowAttendance 
                ? 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-450' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-655'
            }`}>
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Attendance Rate</p>
              <h3 className={`text-xl font-extrabold mt-0.5 ${isLowAttendance ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {attendanceRate}%
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sessions Present</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {presentCount} <span className="text-xs font-bold text-gray-400 dark:text-gray-550">/ {totalCount} total</span>
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Late / Excused</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {lateCount + excusedCount}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-450">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Absences Logged</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {absentCount}
              </h3>
            </div>
          </div>

        </div>

        {/* Heatmap Calendar and Details List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Heatmap */}
          <div className="lg:col-span-2 space-y-6">
            <AttendanceCalendar records={filteredRecords} />
          </div>

          {/* Side Feed: Recent Logs */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold">Recent History Logs</h3>
                <span className="text-xxs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                  Sorted by date
                </span>
              </div>
              
              {filteredRecords.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center py-12 text-center text-gray-400 dark:text-gray-500">
                  <Calendar className="h-10 w-10 mb-3 text-gray-300 dark:text-gray-800" />
                  <p className="text-xs font-semibold">No attendance sessions logged</p>
                  <p className="text-xxs text-gray-500 mt-1">Check-in using the QR code portal in your class</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[360px] pr-1.5">
                  {filteredRecords.slice(0, 10).map((record) => {
                    let statusTheme = 'bg-gray-550 text-white';
                    if (record.status === 'present') statusTheme = 'bg-green-500 text-white';
                    else if (record.status === 'late') statusTheme = 'bg-amber-500 text-white';
                    else if (record.status === 'absent') statusTheme = 'bg-red-500 text-white';
                    else if (record.status === 'excused') statusTheme = 'bg-blue-400 text-white';

                    return (
                      <div key={record.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-850/50 flex justify-between items-center">
                        <div className="min-w-0 flex-1 mr-2">
                          <h4 className="text-xs font-bold truncate">{record.courseTitle}</h4>
                          <div className="flex items-center space-x-2 mt-1 text-xxs text-gray-400">
                            <span>{new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{record.method}</span>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-full capitalize ${statusTheme}`}>
                            {record.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-850 flex items-center space-x-2 text-xxs text-gray-450 dark:text-gray-500">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span>Showing up to last 10 session checkpoints</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
