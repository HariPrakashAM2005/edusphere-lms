'use client';

import React, { useState } from 'react';
import { Users, Plus, Search, Mail, FileText, CheckCircle, Ban, Trash2, X, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../components/DataTable';

interface Student {
  id: string; // matches data type T extends { id: string | number }
  name: string;
  studentId: string;
  email: string;
  major: string;
  coursesCount: number;
  gpa: number; // percentage grade performance e.g. 92.4
  attendance: number; // percentage e.g. 96.5
  status: 'Active' | 'Suspended';
}

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Haris Khan', studentId: 'STU-4291', email: 'haris@edusphere.edu', major: 'Computer Science', coursesCount: 5, gpa: 94.2, attendance: 98.4, status: 'Active' },
  { id: '2', name: 'Sarah Connor', studentId: 'STU-3120', email: 'sarah@edusphere.edu', major: 'Robotics Engineering', coursesCount: 6, gpa: 88.5, attendance: 92.1, status: 'Active' },
  { id: '3', name: 'Bruce Wayne', studentId: 'STU-0077', email: 'bruce@edusphere.edu', major: 'Business Admin', coursesCount: 4, gpa: 91.0, attendance: 85.0, status: 'Active' },
  { id: '4', name: 'John Smith', studentId: 'STU-1829', email: 'john@edusphere.edu', major: 'Physics', coursesCount: 5, gpa: 68.2, attendance: 74.5, status: 'Active' },
  { id: '5', name: 'Diana Prince', studentId: 'STU-8822', email: 'diana@edusphere.edu', major: 'History', coursesCount: 5, gpa: 99.1, attendance: 99.8, status: 'Active' },
  { id: '6', name: 'Tony Stark', studentId: 'STU-3000', email: 'tony@edusphere.edu', major: 'Mechanical Eng.', coursesCount: 7, gpa: 98.9, attendance: 96.2, status: 'Active' },
  { id: '7', name: 'Peter Parker', studentId: 'STU-1962', email: 'peter@edusphere.edu', major: 'Journalism', coursesCount: 5, gpa: 82.3, attendance: 89.0, status: 'Active' },
  { id: '8', name: 'Clark Kent', studentId: 'STU-1938', email: 'clark@edusphere.edu', major: 'Journalism', coursesCount: 4, gpa: 85.6, attendance: 91.2, status: 'Active' },
  { id: '9', name: 'Barry Allen', studentId: 'STU-1956', email: 'barry@edusphere.edu', major: 'Chemistry', coursesCount: 5, gpa: 78.4, attendance: 100.0, status: 'Active' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [majorFilter, setMajorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form states for new student
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('Computer Science');
  const [gpa, setGpa] = useState(85);
  const [attendance, setAttendance] = useState(90);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId || !email) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      name,
      studentId,
      email,
      major,
      coursesCount: 5,
      gpa: Number(gpa),
      attendance: Number(attendance),
      status: 'Active',
    };

    setStudents([newStudent, ...students]);
    setIsModalOpen(false);

    // Reset Form
    setName('');
    setStudentId('');
    setEmail('');
    setMajor('Computer Science');
    setGpa(85);
    setAttendance(90);
  };

  const toggleStatus = (id: string) => {
    setStudents(students.map((s) => {
      if (s.id === id) {
        return { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return s;
    }));
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const getFilteredData = () => {
    return students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMajor = majorFilter === 'All' || s.major === majorFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesMajor && matchesStatus;
    });
  };

  const majors = ['All', 'Computer Science', 'Robotics Engineering', 'Business Admin', 'Physics', 'History', 'Mechanical Eng.', 'Journalism', 'Chemistry'];

  const columns = [
    {
      header: 'Student',
      accessor: (row: Student) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-black text-xs">
            {row.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
              {row.name}
            </span>
            <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">
              {row.email}
            </span>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'name' as keyof Student,
    },
    {
      header: 'Student ID',
      accessor: (row: Student) => (
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
          {row.studentId}
        </span>
      ),
      sortable: true,
      sortKey: 'studentId' as keyof Student,
    },
    {
      header: 'Major Track',
      accessor: 'major' as keyof Student,
      sortable: true,
      sortKey: 'major' as keyof Student,
    },
    {
      header: 'Classes Enrolled',
      accessor: (row: Student) => (
        <span className="font-bold text-slate-700 dark:text-slate-300">
          {row.coursesCount} Streams
        </span>
      ),
    },
    {
      header: 'GPA Average',
      accessor: (row: Student) => (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
          row.gpa >= 90
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
            : row.gpa >= 80
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
            : row.gpa >= 70
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455'
        }`}>
          {row.gpa}%
        </span>
      ),
      sortable: true,
      sortKey: 'gpa' as keyof Student,
    },
    {
      header: 'Attendance Ratio',
      accessor: (row: Student) => (
        <span className="text-slate-650 dark:text-slate-350">
          {row.attendance}%
        </span>
      ),
      sortable: true,
      sortKey: 'attendance' as keyof Student,
    },
    {
      header: 'Status',
      accessor: (row: Student) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          row.status === 'Active'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-400'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  const actions = (row: Student) => (
    <div className="flex space-x-2 justify-end">
      <button
        onClick={() => toggleStatus(row.id)}
        className={`p-1.5 rounded-lg transition cursor-pointer ${
          row.status === 'Active'
            ? 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500'
            : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20'
        }`}
        title={row.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
      >
        <Ban className="h-4 w-4" />
      </button>
      <button
        onClick={() => deleteStudent(row.id)}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition cursor-pointer"
        title="Delete Record"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
            Student Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit enrolled profiles, inspect academic averages, and manage access parameters
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-655 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Aggregate metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Enrolled</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{students.length} Students</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cohort GPA Average</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {(students.reduce((acc, curr) => acc + curr.gpa, 0) / students.length).toFixed(1)}%
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Attendance Rate</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {(students.reduce((acc, curr) => acc + curr.attendance, 0) / students.length).toFixed(1)}%
            </h3>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        
        {/* Search */}
        <div className="flex items-center w-full md:flex-1 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5">
          <Search className="h-4.5 w-4.5 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Major Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={majorFilter}
            onChange={(e) => setMajorFilter(e.target.value)}
            className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            {majors.map((m) => (
              <option key={m} value={m} className="dark:bg-slate-900">{m}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer w-full md:w-auto"
        >
          <option value="All" className="dark:bg-slate-900">All Statuses</option>
          <option value="Active" className="dark:bg-slate-900">Active</option>
          <option value="Suspended" className="dark:bg-slate-900">Suspended</option>
        </select>
      </div>

      {/* Student Table */}
      <DataTable
        columns={columns}
        data={getFilteredData()}
        actions={actions}
        searchPlaceholder="Type to filter..."
      />

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden relative z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white">Enroll Student</h3>
                    <p className="text-[10px] text-slate-455 uppercase tracking-widest mt-0.5">Cohort Operations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateStudent} className="space-y-4 pt-4">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marie Curie"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                  />
                </div>

                {/* Student ID & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Student ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STU-9901"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. marie@edusphere.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                    />
                  </div>
                </div>

                {/* Major */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Major Track</label>
                  <select
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-750 dark:text-slate-200 cursor-pointer"
                  >
                    {majors.filter(m => m !== 'All').map((m) => (
                      <option key={m} value={m} className="dark:bg-slate-900">{m}</option>
                    ))}
                  </select>
                </div>

                {/* GPA & Attendance */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Initial GPA (%)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={gpa}
                      onChange={(e) => setGpa(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Attendance (%)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={attendance}
                      onChange={(e) => setAttendance(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4.5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition cursor-pointer"
                  >
                    Create
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
