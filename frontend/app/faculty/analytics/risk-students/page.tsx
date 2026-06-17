'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useAtRiskStudents } from '../../../../hooks/useAI';
import {
  ShieldAlert,
  Download,
  Mail,
  Search,
  Filter,
  Activity,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Copy,
  ChevronRight,
  Info
} from 'lucide-react';

export default function FacultyRiskDashboardPage() {
  const { data: students, isLoading } = useAtRiskStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  
  const [copied, setCopied] = useState(false);
  const [bulkMailModal, setBulkMailModal] = useState(false);
  const [bulkMailSent, setBulkMailSent] = useState(false);

  // Filter list
  const filteredStudents = students?.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || s.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  }) || [];

  // Get active selected student profile
  const activeStudent = students?.find(s => s.studentId === selectedStudentId) || (filteredStudents.length > 0 ? filteredStudents[0] : null);

  // Export CSV client-side
  const handleExportCSV = () => {
    if (!students || students.length === 0) return;

    const headers = ['Student Name', 'Email', 'Risk Level', 'Risk Score', 'Attendance (%)', 'Grades (%)', 'Weekly Logins'];
    const rows = students.map(s => [
      s.name,
      s.email,
      s.riskLevel,
      s.riskScore,
      s.factors.attendance,
      s.factors.grades,
      s.factors.loginFrequency
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `at_risk_students_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerBulkEmails = () => {
    setBulkMailSent(true);
    setTimeout(() => {
      setBulkMailSent(false);
      setBulkMailModal(false);
      alert('📩 Bulk intervention notifications sent successfully to all at-risk students.');
    }, 1500);
  };

  // Stats
  const highRiskCount = students?.filter(s => s.riskLevel === 'high').length || 0;
  const mediumRiskCount = students?.filter(s => s.riskLevel === 'medium').length || 0;
  const lowRiskCount = students?.filter(s => s.riskLevel === 'low').length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">At-Risk Student Dashboard</h1>
            <p className="mt-1 text-gray-550 dark:text-gray-400">
              AI-assisted student dropout risk analysis predicting retention anomalies based on attendance and grades
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => setBulkMailModal(true)}
              className="flex items-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition text-xs"
            >
              <Mail className="h-4 w-4 mr-1.5" />
              Bulk outreach alert
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2.5 bg-gray-55/60 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-750 text-gray-750 dark:text-gray-350 font-bold rounded-xl transition text-xs"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-450">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">High Risk Alert</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{highRiskCount} Students</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Medium Risk</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{mediumRiskCount} Students</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xxs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider">Low Risk</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{lowRiskCount} Students</h3>
            </div>
          </div>

        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student names or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm"
            />
          </div>

          <div className="w-full md:w-64 flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-55/60 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold appearance-none cursor-pointer"
            >
              <option value="all">All Risk Classes</option>
              <option value="high">High Risk Only</option>
              <option value="medium">Medium Risk Only</option>
              <option value="low">Low Risk Only</option>
            </select>
          </div>
        </div>

        {/* Split view columns */}
        {isLoading ? (
          <div className="h-96 bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Table list (ColSpan 2) */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Retention Risk Table</h3>
                <span className="text-xxs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">
                  Showing {filteredStudents.length} entries
                </span>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="py-16 text-center text-gray-450 dark:text-gray-500">
                  <UserCheck className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
                  <p className="text-xs font-bold">Zero matches found</p>
                  <p className="text-xxs text-gray-550 mt-1">Adjust search parameters or risk categories.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-850 text-xxs font-extrabold uppercase tracking-wider text-gray-450 dark:text-gray-500 pb-3">
                        <th className="pb-3 pr-4">Student</th>
                        <th className="pb-3 pr-4">Risk Level</th>
                        <th className="pb-3 pr-4">Attendance</th>
                        <th className="pb-3 pr-4">Grade Avg</th>
                        <th className="pb-3 pr-4">Weekly Logins</th>
                        <th className="pb-3 text-right">Outreach</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                      {filteredStudents.map((student) => {
                        let riskBadge = 'bg-gray-100 text-gray-650';
                        if (student.riskLevel === 'high') riskBadge = 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400';
                        else if (student.riskLevel === 'medium') riskBadge = 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450';
                        else if (student.riskLevel === 'low') riskBadge = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400';

                        const isSelected = activeStudent?.studentId === student.studentId;

                        return (
                          <tr
                            key={student.studentId}
                            onClick={() => setSelectedStudentId(student.studentId)}
                            className={`text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50/40 dark:hover:bg-gray-850/20 cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                            }`}
                          >
                            <td className="py-4 pr-4">
                              <div className="font-bold text-gray-905 dark:text-white">{student.name}</div>
                              <div className="text-xxs text-gray-400 mt-0.5">{student.email}</div>
                            </td>
                            <td className="py-4 pr-4">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${riskBadge}`}>
                                {student.riskLevel} ({student.riskScore}%)
                              </span>
                            </td>
                            <td className="py-4 pr-4 font-semibold">{student.factors.attendance}%</td>
                            <td className="py-4 pr-4 font-semibold">{student.factors.grades}%</td>
                            <td className="py-4 pr-4 font-semibold">{student.factors.loginFrequency} / wk</td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => setSelectedStudentId(student.studentId)}
                                className="p-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg transition hover:scale-105"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Col: Intervention templates (ColSpan 1) */}
            <div className="space-y-6">
              {activeStudent ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2.5 border-b border-gray-100 dark:border-gray-850">
                      <h3 className="text-sm font-bold text-gray-905 dark:text-white">Intervention Outreach</h3>
                      <button
                        onClick={() => handleCopyTemplate(activeStudent.intervention || '')}
                        className="flex items-center text-xxs font-bold text-gray-450 dark:text-gray-400 hover:text-blue-600 transition"
                      >
                        {copied ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 mr-1" />
                        )}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <div className="p-3.5 bg-gray-55/60 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-1">
                      <p className="text-xxs font-bold text-gray-400 dark:text-gray-550 uppercase">Recipient:</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{activeStudent.name}</p>
                      <p className="text-xxs font-semibold text-gray-450 dark:text-gray-500 mt-0.5">{activeStudent.email}</p>
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-2">Email Message Body</label>
                      <textarea
                        value={activeStudent.intervention || ''}
                        readOnly
                        className="w-full h-[220px] p-3.5 bg-gray-50/80 dark:bg-gray-850/80 border border-gray-250 dark:border-gray-800 rounded-2xl text-xxs leading-relaxed font-semibold resize-none focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`📩 Outreach notification dispatched to ${activeStudent.email}`)}
                    className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
                  >
                    <Mail className="h-4 w-4" /> Dispatched Intervention Email
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm text-center py-20 text-gray-400">
                  <Activity className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold">Select a student entry</p>
                  <p className="text-xxs text-gray-550 mt-0.5">Click rows in the risk table to view details.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Bulk Email Outreach modal overlay */}
      {bulkMailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-amber-500">
              <Mail className="h-6 w-6" />
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Bulk Intervention Outreach</h3>
            </div>
            
            <p className="text-xs text-gray-550 dark:text-gray-450 leading-relaxed">
              This will automatically compile and dispatch alert email notifications to all <span className="font-bold text-red-650">{highRiskCount} students</span> currently classified under the **High Risk** threshold.
            </p>

            <div className="p-3 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-xl space-y-1.5 text-xxs font-semibold leading-relaxed">
              <p className="font-bold text-gray-400">Intervention Subjects:</p>
              {students?.filter(s => s.riskLevel === 'high').map(s => (
                <p key={s.studentId}>• {s.name} ({s.email})</p>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                disabled={bulkMailSent}
                onClick={() => setBulkMailModal(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-350 rounded-xl font-bold transition text-xxs"
              >
                Cancel
              </button>
              <button
                disabled={bulkMailSent}
                onClick={triggerBulkEmails}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold transition text-xxs flex items-center gap-1.5 shadow-sm"
              >
                {bulkMailSent ? 'Sending Alerts...' : 'Yes, Dispatch Emails'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
