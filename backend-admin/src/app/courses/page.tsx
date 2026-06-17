'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Search, Users, Shield, GraduationCap, X, Filter, Archive, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  department: string;
  enrolled: number;
  capacity: number;
  status: 'Active' | 'Draft' | 'Archived';
  gradient: 'blue' | 'green' | 'orange' | 'purple' | 'teal';
}

const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Advanced Cryptography & Security',
    code: 'CS-402',
    instructor: 'Dr. Sarah Jenkins',
    department: 'Computer Science',
    enrolled: 42,
    capacity: 60,
    status: 'Active',
    gradient: 'blue',
  },
  {
    id: '2',
    title: 'Machine Learning Models & Analytics',
    code: 'CS-380',
    instructor: 'Prof. Alan Turing',
    department: 'Computer Science',
    enrolled: 58,
    capacity: 60,
    status: 'Active',
    gradient: 'purple',
  },
  {
    id: '3',
    title: 'Microeconomic Theory & Paradigms',
    code: 'ECON-201',
    instructor: 'Dr. Emily Zhang',
    department: 'Economics',
    enrolled: 85,
    capacity: 100,
    status: 'Active',
    gradient: 'teal',
  },
  {
    id: '4',
    title: 'Quantum Mechanics II',
    code: 'PHYS-410',
    instructor: 'Prof. Richard Feynman',
    department: 'Physics',
    enrolled: 15,
    capacity: 30,
    status: 'Draft',
    gradient: 'orange',
  },
  {
    id: '5',
    title: 'Digital Systems & Design Fundamentals',
    code: 'EE-104',
    instructor: 'Dr. Marcus Vance',
    department: 'Electrical Eng.',
    enrolled: 112,
    capacity: 120,
    status: 'Active',
    gradient: 'green',
  },
  {
    id: '6',
    title: 'Renaissance Art History',
    code: 'HIST-224',
    instructor: 'Dr. Helena Rossi',
    department: 'History',
    enrolled: 24,
    capacity: 40,
    status: 'Archived',
    gradient: 'orange',
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new course
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newDept, setNewDept] = useState('Computer Science');
  const [newCapacity, setNewCapacity] = useState(50);
  const [newGrad, setNewGrad] = useState<'blue' | 'green' | 'orange' | 'purple' | 'teal'>('blue');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode || !newInstructor) return;

    const course: Course = {
      id: Date.now().toString(),
      title: newTitle,
      code: newCode,
      instructor: newInstructor,
      department: newDept,
      enrolled: 0,
      capacity: Number(newCapacity),
      status: 'Active',
      gradient: newGrad,
    };

    setCourses([course, ...courses]);
    setIsModalOpen(false);

    // Reset Form
    setNewTitle('');
    setNewCode('');
    setNewInstructor('');
    setNewDept('Computer Science');
    setNewCapacity(50);
    setNewGrad('blue');
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const getGradientClass = (grad: string) => {
    switch (grad) {
      case 'blue': return 'from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700';
      case 'green': return 'from-emerald-400 to-teal-600 dark:from-emerald-500 dark:to-teal-700';
      case 'orange': return 'from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600';
      case 'purple': return 'from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700';
      case 'teal': return 'from-teal-400 to-cyan-600 dark:from-teal-500 dark:to-cyan-700';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const departments = ['All', 'Computer Science', 'Economics', 'Physics', 'Electrical Eng.', 'History'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                          course.code.toLowerCase().includes(search.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || course.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
            Curriculum Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, audit, and distribute academic learning flows and syllabi
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm">
        
        {/* Search */}
        <div className="flex items-center w-full md:flex-1 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5">
          <Search className="h-4.5 w-4.5 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search code, title, or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Dept filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            {departments.map((d) => (
              <option key={d} value={d} className="dark:bg-slate-900">{d}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer w-full md:w-auto"
        >
          <option value="All" className="dark:bg-slate-900">All Statuses</option>
          <option value="Active" className="dark:bg-slate-900">Active</option>
          <option value="Draft" className="dark:bg-slate-900">Draft</option>
          <option value="Archived" className="dark:bg-slate-900">Archived</option>
        </select>
      </div>

      {/* Courses Cards Grid */}
      <motion.section
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course) => {
            const fillPercentage = Math.round((course.enrolled / course.capacity) * 100);
            return (
              <motion.div
                layout
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-200 dark:hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Gradient Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-3xl bg-gradient-to-r ${getGradientClass(course.gradient)}`} />

                <div className="space-y-4 pt-2">
                  
                  {/* Code & status badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {course.code}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      course.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : course.status === 'Draft'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                    }`}>
                      {course.status}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                      {course.department}
                    </p>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center space-x-2.5">
                    <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {course.instructor.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-650 dark:text-slate-350">{course.instructor}</p>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Faculty Lead</p>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                      <span>Enrollment</span>
                      <span>{course.enrolled} / {course.capacity} ({fillPercentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getGradientClass(course.gradient)} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, fillPercentage)}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Actions Panel */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-5">
                  <span className="text-[10px] font-bold text-slate-450 flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1" /> Enrolled
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition cursor-pointer animate-none"
                      title="Archive Course"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer">
                      Manage
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-3">
            <BookOpen className="h-8 w-8 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No courses match criteria</h3>
            <p className="text-xs text-slate-450 max-w-xs">Try searching another query or creating a new syllabus instance.</p>
          </div>
        )}
      </motion.section>

      {/* Add Course Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
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
                    <h3 className="text-sm font-black text-slate-850 dark:text-white">Register Course</h3>
                    <p className="text-[10px] text-slate-450 uppercase tracking-widest mt-0.5">Academic Registry</p>
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
              <form onSubmit={handleCreateCourse} className="space-y-4 pt-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Database Architectures"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                  />
                </div>

                {/* Code & Instructor */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Course Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-480"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Lead Instructor</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Grace Hopper"
                      value={newInstructor}
                      onChange={(e) => setNewInstructor(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                    />
                  </div>
                </div>

                {/* Dept & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {departments.filter(d => d !== 'All').map((d) => (
                        <option key={d} value={d} className="dark:bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Max Capacity</label>
                    <input
                      type="number"
                      min={10}
                      max={300}
                      required
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold transition"
                    />
                  </div>
                </div>

                {/* Theme Gradient Pick */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Card Visual Theme</label>
                  <div className="flex items-center space-x-3.5">
                    {(['blue', 'green', 'orange', 'purple', 'teal'] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewGrad(color)}
                        className={`h-7 w-7 rounded-full bg-gradient-to-r ${getGradientClass(color)} border-2 flex items-center justify-center transition active:scale-90 cursor-pointer ${
                          newGrad === color ? 'border-slate-950 dark:border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
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
