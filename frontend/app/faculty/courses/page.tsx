'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import useRealtime from '../../../hooks/useRealtime';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Globe, 
  Lock, 
  Layers, 
  Users, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Enrollment {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string | null;
  thumbnail: string | null;
  published: boolean;
  modules: Module[];
  enrollments: Enrollment[];
}

export default function FacultyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faculty/courses');
      setCourses(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Real-time synchronization
  useRealtime(undefined, {
    course_created: (newCourse: Course) => {
      setCourses((prev) => {
        // Prevent duplicate addition
        if (prev.some((c) => c.id === newCourse.id)) return prev;
        return [newCourse, ...prev];
      });
    },
    course_updated: (updatedCourse: Course) => {
      setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? { ...c, ...updatedCourse } : c)));
    },
    course_deleted: (data: { id: string }) => {
      setCourses((prev) => prev.filter((c) => c.id !== data.id));
    },
  });

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this course? This action is irreversible and will delete all modules, lessons, and student progress.')) {
      return;
    }

    try {
      await api.delete(`/faculty/courses/${courseId}`);
      toast.success('Course deleted successfully');
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  };

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      course.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            My Courses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Author curriculum modules, coordinate lessons, and review student rosters.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/faculty/courses/create')} 
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 uppercase tracking-wider transition"
        >
          <Plus className="h-4.5 w-4.5" /> Create Course
        </Button>
      </header>

      {/* Filter and Search Bar */}
      <section className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses by title or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm font-semibold"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat || 'all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider ${
                categoryFilter === cat
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'bg-gray-50 dark:bg-gray-850 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-sm font-extrabold text-gray-450 uppercase tracking-widest">Loading courses...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
            return (
              <Card 
                key={course.id} 
                className="group border border-gray-250/50 dark:border-gray-850/60 !rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 relative flex flex-col justify-between overflow-hidden h-[360px] bg-white dark:bg-gray-900"
              >
                {/* Upper body */}
                <div className="p-6 space-y-4">
                  {/* Category and publish state */}
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-50 dark:bg-gray-850 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                      {course.category || 'General'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      course.published 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {course.published ? (
                        <>
                          <Globe className="h-3 w-3" /> Published
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Draft
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title and description */}
                  <div className="space-y-1">
                    <h3 className="text-base font-black tracking-tight text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition duration-200">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-450 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Footer metadata & actions */}
                <div className="border-t border-gray-100 dark:border-gray-800/80 p-6 bg-gray-50/50 dark:bg-gray-900/40">
                  {/* Stats list */}
                  <div className="flex gap-4 text-[10px] font-bold text-gray-500 mb-5">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-blue-500" />
                      {course.modules.length} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-teal-500" />
                      {totalLessons} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-purple-500" />
                      {course.enrollments?.length || 0} Enrolled
                    </span>
                  </div>

                  {/* Actions bar */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-[10px] font-extrabold uppercase tracking-wider"
                      onClick={() => router.push(`/faculty/courses/${course.id}/edit`)}
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1 text-blue-500" /> Configure
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-rose-500 hover:bg-rose-500/5 text-[10px] font-extrabold uppercase tracking-wider border border-transparent hover:border-rose-500/20"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl py-20 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-750 mx-auto" />
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">No courses authored yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Create your first online curriculum course to populate the listing grid.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/faculty/courses/create')} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20"
          >
            Get Started
          </Button>
        </div>
      )}
    </div>
  );
}
