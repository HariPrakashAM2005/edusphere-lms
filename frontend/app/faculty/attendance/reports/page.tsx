'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useCourses } from '../../../../hooks/useDashboard';
import {
  useFacultyAttendance,
  useAttendanceAnalytics,
  useManualOverrideAttendance
} from '../../../../hooks/useAttendance';
import api from '../../../../lib/api';
import {
  Download,
  Search,
  Filter,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Edit2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function FacultyReportsPage() {
  const { data: courses } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Queries & Mutations
  const { data: records, isLoading: recordsLoading } = useFacultyAttendance(selectedCourseId);
  const { data: analytics, isLoading: analyticsLoading } = useAttendanceAnalytics(selectedCourseId);
  const overrideMutation = useManualOverrideAttendance();

  // Set default course ID
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].courseId);
    }
  }, [courses, selectedCourseId]);

  // Handle CSV Download
  const handleDownloadCSV = async () => {
    if (!selectedCourseId) return;
    setDownloading(true);
    try {
      const res = await api.get(`/attendance/faculty/attendance/report/${selectedCourseId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${selectedCourseId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV report', err);
    } finally {
      setDownloading(false);
    }
  };

  // Handle status override
  const handleStatusOverride = (attendanceId: string, status: string) => {
    overrideMutation.mutate(
      { attendanceId, status },
      {
        onSuccess: () => {
          setEditingRecordId(null);
        }
      }
    );
  };

  // Filter local records
  const filteredRecords = records?.filter((record) => {
    // Search filter
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    // Date range filters
    const recordDate = new Date(record.date);
    const matchesStart = startDate ? recordDate >= new Date(startDate + 'T00:00:00') : true;
    const matchesEnd = endDate ? recordDate <= new Date(endDate + 'T23:59:59') : true;

    return matchesSearch && matchesStart && matchesEnd;
  }) || [];

  const isLoading = recordsLoading || analyticsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Attendance Analytics & Reports</h1>
            <p className="mt-1 text-gray-550 dark:text-gray-400">
              Audit student attendance records, override markers manually, and export compliance reports
            </p>
          </div>
          
          <button
            onClick={handleDownloadCSV}
            disabled={downloading || !selectedCourseId}
            className="flex items-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-sm shrink-0 disabled:opacity-70"
          >
            <Download className="h-4.5 w-4.5 mr-2" />
            {downloading ? 'Exporting...' : 'Export CSV Report'}
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          
          {/* Course select */}
          <div className="w-full md:w-1/3">
            <label className="block text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm appearance-none cursor-pointer"
            >
              {courses?.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="w-full md:w-1/3 relative">
            <label className="block text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name or Email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Date pickers */}
          <div className="w-full md:w-1/3 flex gap-3">
            <div className="flex-1">
              <label className="block text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>

        </div>

        {/* Analytics summary rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Average Attendance</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {analytics?.averageAttendance || 0}%
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-450">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Defaulter Count</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {analytics?.defaulters?.length || 0} <span className="text-xs font-bold text-gray-400 dark:text-gray-550">Students (&lt;75%)</span>
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-655">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider">Total Lecture Sessions</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {analytics?.totalSessions || 0}
              </h3>
            </div>
          </div>

        </div>

        {/* Split view columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Attendance sheet list (ColSpan 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold">Attendance Records Sheet</h3>
                <span className="text-xxs font-bold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                  Showing {filteredRecords.length} records
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-4 py-8">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="h-14 bg-gray-50 dark:bg-gray-850 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="py-16 text-center text-gray-400 dark:text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-800 mb-3" />
                  <p className="text-sm font-bold">No records found</p>
                  <p className="text-xs text-gray-500 mt-1">Try broadening your date filters or searching another student.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-850 text-xxs font-extrabold uppercase tracking-wider text-gray-450 dark:text-gray-500">
                        <th className="pb-3 pr-4">Student</th>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Method</th>
                        <th className="pb-3 pr-4">Location</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                      {filteredRecords.map((record) => {
                        let statusColor = 'bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-400';
                        if (record.status === 'present') statusColor = 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400';
                        else if (record.status === 'late') statusColor = 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450';
                        else if (record.status === 'absent') statusColor = 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-450';
                        else if (record.status === 'excused') statusColor = 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400';

                        const isEditing = editingRecordId === record.id;

                        return (
                          <tr key={record.id} className="text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50/40 dark:hover:bg-gray-850/20 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="font-bold text-gray-900 dark:text-white">{record.studentName}</div>
                              <div className="text-xxs text-gray-400 mt-0.5">{record.studentEmail}</div>
                            </td>
                            <td className="py-4 pr-4 font-semibold">
                              {new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              <div className="text-xxs text-gray-400 mt-0.5 font-mono">
                                {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              {isEditing ? (
                                <select
                                  value={record.status}
                                  onChange={(e) => handleStatusOverride(record.id, e.target.value)}
                                  className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg text-xs"
                                >
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                  <option value="late">Late</option>
                                  <option value="excused">Excused</option>
                                </select>
                              ) : (
                                <span className={`text-xxs font-extrabold px-2.5 py-0.5 rounded-full capitalize ${statusColor}`}>
                                  {record.status}
                                </span>
                              )}
                            </td>
                            <td className="py-4 pr-4 text-xxs font-bold text-gray-500 uppercase tracking-wider">{record.method}</td>
                            <td className="py-4 pr-4 font-mono text-xxs text-gray-400 truncate max-w-[100px]">{record.location}</td>
                            <td className="py-4 text-right">
                              {isEditing ? (
                                <button
                                  onClick={() => setEditingRecordId(null)}
                                  className="text-xxs font-bold text-gray-550 dark:text-gray-450 hover:underline"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingRecordId(record.id)}
                                  disabled={overrideMutation.isPending}
                                  className="text-blue-600 hover:text-blue-700 p-1 bg-blue-50 dark:bg-blue-950/40 rounded-lg transition hover:scale-105"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Defaulter warning board (ColSpan 1) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm h-full flex flex-col">
              
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-4">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Defaulter Board (&lt;75%)</h3>
              </div>

              <p className="text-xxs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Students listed here have slipped below the mandatory attendance requirement. Reach out or schedule advisory counseling sessions.
              </p>

              {isLoading ? (
                <div className="space-y-3.5 flex-1">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-12 bg-gray-50 dark:bg-gray-850 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : !analytics?.defaulters || analytics.defaulters.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center py-10 text-center text-gray-400">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2.5" />
                  <p className="text-xs font-bold text-gray-900 dark:text-white">No Defaulters!</p>
                  <p className="text-xxs text-gray-500 mt-0.5">All student attendance parameters are fully compliant.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {analytics.defaulters.map((defaulter, idx) => (
                    <div key={idx} className="p-3.5 border border-red-100 dark:border-red-950/20 bg-red-50/20 dark:bg-red-950/10 rounded-xl flex justify-between items-center">
                      <div className="min-w-0 flex-1 mr-2">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{defaulter.name}</h4>
                        <p className="text-xxs text-gray-550 dark:text-gray-400 truncate mt-0.5">{defaulter.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xxs font-extrabold px-2.5 py-0.5 bg-red-100 dark:bg-red-950 text-red-650 dark:text-red-400 rounded-full">
                          {defaulter.attendance}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
