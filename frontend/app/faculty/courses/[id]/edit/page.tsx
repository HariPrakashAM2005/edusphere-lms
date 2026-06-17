'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import useRealtime from '../../../../../hooks/useRealtime';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Layers, 
  FileText, 
  Upload, 
  Globe, 
  Lock, 
  Loader2, 
  Users, 
  UserPlus, 
  Shield, 
  Check, 
  BookOpen 
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  duration: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Enrollment {
  id: string;
  userId: string;
  user: UserSummary;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string | null;
  thumbnail: string | null;
  published: boolean;
  facultyId: string | null;
  faculty: UserSummary | null;
  modules: Module[];
  enrollments: Enrollment[];
}

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'enrollments' | 'instructors'>('content');

  // Course metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [thumbnail, setThumbnail] = useState('');
  const [published, setPublished] = useState(false);
  const [facultyId, setFacultyId] = useState('');

  // Course curriculum
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModuleIdx, setActiveModuleIdx] = useState<number | null>(null);

  // Instructors list
  const [instructors, setInstructors] = useState<UserSummary[]>([]);
  
  // Enrollments list
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Add Module Inputs
  const [newModTitle, setNewModTitle] = useState('');
  const [newModDesc, setNewModDesc] = useState('');

  // Add Lesson Inputs
  const [newLesTitle, setNewLesTitle] = useState('');
  const [newLesContent, setNewLesContent] = useState('');
  const [newLesVideo, setNewLesVideo] = useState('');
  const [newLesDuration, setNewLesDuration] = useState(10);

  const [isUploading, setIsUploading] = useState(false);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, instructorsRes, enrollmentsRes] = await Promise.all([
        api.get(`/faculty/courses/${id}`),
        api.get('/faculty/instructors'),
        api.get(`/faculty/courses/${id}/enrollments`)
      ]);

      const course: Course = courseRes.data;
      setTitle(course.title);
      setDescription(course.description);
      setCategory(course.category || 'Computer Science');
      setThumbnail(course.thumbnail || '');
      setPublished(course.published);
      setFacultyId(course.facultyId || '');
      setModules(course.modules);
      setInstructors(instructorsRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch course details');
      router.push('/faculty/courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  // Real-time synchronization
  useRealtime(id, {
    course_updated: (updatedCourse: Course) => {
      if (updatedCourse.id === id) {
        setTitle(updatedCourse.title);
        setDescription(updatedCourse.description);
        setCategory(updatedCourse.category || 'Computer Science');
        setThumbnail(updatedCourse.thumbnail || '');
        setPublished(updatedCourse.published);
        setFacultyId(updatedCourse.facultyId || '');
        setModules(updatedCourse.modules);
      }
    },
    enrollment_updated: (data: any) => {
      // Reload enrollments dynamically
      api.get(`/faculty/courses/${id}/enrollments`).then((res) => {
        setEnrollments(res.data);
      });
    }
  });

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload/course-material', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = res.data.fileUrl || res.data.url || `http://localhost:3001/api/uploads/course-material/${file.name}`;
      setThumbnail(fileUrl);
      toast.success('Thumbnail uploaded successfully');
    } catch (error: any) {
      toast.error('Using mock thumbnail url');
      setThumbnail(`http://localhost:3001/api/uploads/course-material/${file.name}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateCourseMetadata = async () => {
    try {
      setIsSaving(true);
      await api.put(`/faculty/courses/${id}`, {
        title,
        description,
        category,
        thumbnail,
        published,
      });
      toast.success('Course properties saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update course properties');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModTitle) return;

    try {
      await api.post(`/faculty/courses/${id}/modules`, {
        title: newModTitle,
        description: newModDesc,
        order: modules.length,
      });
      setNewModTitle('');
      setNewModDesc('');
      toast.success('Module created successfully');
      // Refetch
      const res = await api.get(`/faculty/courses/${id}`);
      setModules(res.data.modules);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add module');
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModuleIdx === null || !newLesTitle) return;

    const activeModule = modules[activeModuleIdx];

    try {
      await api.post(`/faculty/modules/${activeModule.id}/lessons`, {
        title: newLesTitle,
        content: newLesContent,
        videoUrl: newLesVideo,
        duration: Number(newLesDuration),
        order: activeModule.lessons.length,
      });

      setNewLesTitle('');
      setNewLesContent('');
      setNewLesVideo('');
      setNewLesDuration(10);
      toast.success('Lesson created successfully');
      
      // Refetch
      const res = await api.get(`/faculty/courses/${id}`);
      setModules(res.data.modules);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add lesson');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail) return;

    try {
      setIsAddingStudent(true);
      await api.post(`/faculty/courses/${id}/enrollments`, {
        email: newStudentEmail,
      });
      setNewStudentEmail('');
      toast.success('Student enrolled successfully');
      
      // Refetch enrollments
      const enrollRes = await api.get(`/faculty/courses/${id}/enrollments`);
      setEnrollments(enrollRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Student not found or already enrolled');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the course?')) return;

    try {
      await api.delete(`/faculty/courses/${id}/enrollments/${enrollmentId}`);
      toast.success('Enrollment removed successfully');
      setEnrollments(enrollments.filter((e) => e.id !== enrollmentId));
    } catch (error: any) {
      toast.error('Failed to remove enrollment');
    }
  };

  const handleAssignInstructor = async (instructorId: string) => {
    try {
      await api.post(`/faculty/courses/${id}/instructor`, {
        facultyId: instructorId,
      });
      setFacultyId(instructorId);
      toast.success('Course assigned to new instructor');
    } catch (error: any) {
      toast.error('Failed to assign instructor');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-sm font-extrabold text-gray-450 uppercase tracking-widest">Loading course data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/faculty/courses')}
            className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Configure Course</h1>
            <p className="text-xs text-gray-500">Edit course properties, manage syllabus, and view enrollments.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleUpdateCourseMetadata} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20"
          >
            {isSaving ? 'Saving...' : 'Save Properties'}
          </Button>
        </div>
      </header>

      {/* Tabs list */}
      <div className="flex border-b border-gray-150 dark:border-gray-800 gap-6">
        {[
          { id: 'content', label: 'Course Curriculum', icon: BookOpen },
          { id: 'enrollments', label: 'Registered Students', icon: Users },
          { id: 'instructors', label: 'Assigned Instructors', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3.5 text-xs font-black uppercase tracking-wider transition-all relative ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Metadata properties */}
          <section className="lg:col-span-5 space-y-6">
            <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2.5">
                Course Metadata
              </h3>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-medium leading-relaxed"
                />
              </div>

              {/* Category input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Arts & Humanities">Arts & Humanities</option>
                </select>
              </div>

              {/* Thumbnail selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Thumbnail Image</label>
                <div className="flex items-center gap-3">
                  {thumbnail ? (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 w-24 h-16 shrink-0 bg-gray-50">
                      <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setThumbnail('')}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[9px] font-black uppercase"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-250 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-500/50 rounded-xl py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850/40 transition">
                      <Upload className="h-5 w-5 text-gray-400 mb-1" />
                      <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                        {isUploading ? 'Uploading...' : 'Choose File'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleThumbnailUpload} 
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Publish state */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2">
                  {published ? (
                    <Globe className="h-4.5 w-4.5 text-emerald-500" />
                  ) : (
                    <Lock className="h-4.5 w-4.5 text-amber-500" />
                  )}
                  <div>
                    <h5 className="text-xs font-black">Publish Course</h5>
                    <p className="text-[9px] text-gray-500">Make course discoverable immediately</p>
                  </div>
                </div>
                <button
                  onClick={() => setPublished(!published)}
                  className={`w-11 h-6 rounded-full transition duration-300 relative ${
                    published ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-880'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition duration-300 ${
                    published ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>
            </Card>
          </section>

          {/* Curriculum */}
          <section className="lg:col-span-7 space-y-6">
            <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2.5">
                Curriculum Builder
              </h3>

              {/* Add module form */}
              <form onSubmit={handleAddModule} className="p-4 bg-gray-55 dark:bg-gray-850/50 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                <h4 className="text-xs font-black tracking-tight text-blue-600 dark:text-blue-400">Add New Module</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Module Title"
                    value={newModTitle}
                    onChange={(e) => setNewModTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newModDesc}
                    onChange={(e) => setNewModDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full text-[10px] font-extrabold uppercase tracking-wider">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Module
                </Button>
              </form>

              {/* Syllabus list */}
              <div className="space-y-4">
                {modules.map((mod, mIdx) => (
                  <div 
                    key={mod.id} 
                    className={`rounded-2xl border transition duration-200 ${
                      activeModuleIdx === mIdx 
                        ? 'border-blue-500 bg-blue-500/[0.01]' 
                        : 'border-gray-205 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-900/40 rounded-t-2xl">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setActiveModuleIdx(activeModuleIdx === mIdx ? null : mIdx)}
                      >
                        <h4 className="text-xs font-black flex items-center gap-1.5">
                          <span className="h-5 w-5 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black">{mIdx + 1}</span>
                          {mod.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{mod.lessons.length} lessons</p>
                      </div>
                    </div>

                    {activeModuleIdx === mIdx && (
                      <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 space-y-4">
                        {/* Lessons List */}
                        <div className="space-y-2">
                          {mod.lessons.map((les, lIdx) => (
                            <div key={les.id} className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/40 text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-emerald-500" /> {les.title}
                              </span>
                              <span className="text-[10px] text-gray-400 font-extrabold">{les.duration} mins</span>
                            </div>
                          ))}
                        </div>

                        {/* Add Lesson form */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-150 dark:border-gray-800 space-y-3">
                          <h5 className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">New Lesson</h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Lesson Title"
                              value={newLesTitle}
                              onChange={(e) => setNewLesTitle(e.target.value)}
                              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none transition text-xs font-semibold"
                            />
                            <input
                              type="number"
                              placeholder="Duration (minutes)"
                              value={newLesDuration}
                              onChange={(e) => setNewLesDuration(Number(e.target.value))}
                              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none transition text-xs font-semibold"
                            />
                          </div>

                          <textarea
                            placeholder="Lesson Content details or video links..."
                            rows={2}
                            value={newLesContent}
                            onChange={(e) => setNewLesContent(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-lg focus:outline-none transition text-xs font-semibold leading-relaxed"
                          />

                          <Button 
                            onClick={handleAddLesson}
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700 text-[10px] font-extrabold uppercase tracking-wider"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Lesson
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      )}

      {activeTab === 'enrollments' && (
        <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Course Enrollments</h3>
              <p className="text-xs text-gray-500 mt-0.5">Enrolled student access list</p>
            </div>
            
            <form onSubmit={handleAddStudent} className="flex gap-2 w-full sm:w-80">
              <input
                type="email"
                placeholder="Student Email Address"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold"
              />
              <Button type="submit" disabled={isAddingStudent} size="sm" className="bg-teal-600 hover:bg-teal-700 shrink-0">
                <UserPlus className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="overflow-x-auto border border-gray-150 dark:border-gray-800 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-850 text-[10px] font-black uppercase tracking-widest text-gray-450 border-b border-gray-150 dark:border-gray-800">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-850/25 transition">
                    <td className="p-4 font-black">{enr.user.firstName} {enr.user.lastName}</td>
                    <td className="p-4 text-gray-450">{enr.user.email}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleRemoveStudent(enr.id)}
                        className="p-1 text-gray-400 hover:text-rose-500 transition"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400 italic">No students registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'instructors' && (
        <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 space-y-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">Course Instructor</h3>
            <p className="text-xs text-gray-500 mt-0.5">Assign primary faculty advisor for the course</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {instructors.map((instructor) => {
              const isAssigned = facultyId === instructor.id;
              return (
                <div 
                  key={instructor.id}
                  onClick={() => handleAssignInstructor(instructor.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex justify-between items-center ${
                    isAssigned 
                      ? 'border-blue-500 bg-blue-500/[0.02]' 
                      : 'border-gray-150 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-1">
                    <h5 className="text-xs font-black">{instructor.firstName} {instructor.lastName}</h5>
                    <p className="text-[10px] text-gray-400">{instructor.email}</p>
                  </div>
                  {isAssigned && (
                    <span className="p-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">
                      Assigned
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
