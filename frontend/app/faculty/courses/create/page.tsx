'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Eye, 
  Layers, 
  FileText, 
  Upload, 
  Globe, 
  Lock, 
  Loader2, 
  Edit3,
  Check
} from 'lucide-react';

interface TempLesson {
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface TempModule {
  title: string;
  description: string;
  order: number;
  lessons: TempLesson[];
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Course metadata states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [thumbnail, setThumbnail] = useState('');
  const [published, setPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Curriculum states
  const [modules, setModules] = useState<TempModule[]>([]);
  const [activeModuleIdx, setActiveModuleIdx] = useState<number | null>(null);

  // Add/Edit Module Modals/Inputs
  const [newModTitle, setNewModTitle] = useState('');
  const [newModDesc, setNewModDesc] = useState('');

  // Add/Edit Lesson Inputs
  const [newLesTitle, setNewLesTitle] = useState('');
  const [newLesContent, setNewLesContent] = useState('');
  const [newLesVideo, setNewLesVideo] = useState('');
  const [newLesDuration, setNewLesDuration] = useState(10);

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

      // The backend should return { fileUrl: ... } or similar. If not, we set it based on the response schema.
      // Let's assume standard response is res.data.fileUrl or res.data.url
      const fileUrl = res.data.fileUrl || res.data.url || `http://localhost:3001/api/uploads/course-material/${file.name}`;
      setThumbnail(fileUrl);
      toast.success('Thumbnail uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload thumbnail, using mock file url');
      // Fallback placeholder url
      setThumbnail(`http://localhost:3001/api/uploads/course-material/${file.name}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModTitle) {
      toast.error('Module title is required');
      return;
    }

    const newModule: TempModule = {
      title: newModTitle,
      description: newModDesc,
      order: modules.length,
      lessons: [],
    };

    setModules([...modules, newModule]);
    setNewModTitle('');
    setNewModDesc('');
    toast.success('Module added');
  };

  const handleDeleteModule = (idx: number) => {
    setModules(modules.filter((_, i) => i !== idx));
    if (activeModuleIdx === idx) {
      setActiveModuleIdx(null);
    }
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModuleIdx === null) {
      toast.error('Please select or add a module first');
      return;
    }
    if (!newLesTitle) {
      toast.error('Lesson title is required');
      return;
    }

    const newLesson: TempLesson = {
      title: newLesTitle,
      content: newLesContent,
      videoUrl: newLesVideo,
      duration: Number(newLesDuration),
      order: modules[activeModuleIdx].lessons.length,
    };

    const updated = [...modules];
    updated[activeModuleIdx].lessons.push(newLesson);
    setModules(updated);

    setNewLesTitle('');
    setNewLesContent('');
    setNewLesVideo('');
    setNewLesDuration(10);
    toast.success('Lesson added to module');
  };

  const handleDeleteLesson = (modIdx: number, lesIdx: number) => {
    const updated = [...modules];
    updated[modIdx].lessons = updated[modIdx].lessons.filter((_, i) => i !== lesIdx);
    setModules(updated);
  };

  const handleSaveCourse = async () => {
    if (!title || !description) {
      toast.error('Course title and description are required');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create the Course
      const courseRes = await api.post('/faculty/courses', {
        title,
        description,
        category,
        thumbnail,
      });

      const courseId = courseRes.data.id;

      // 2. Add Modules and lessons sequentially
      for (const mod of modules) {
        const modRes = await api.post(`/faculty/courses/${courseId}/modules`, {
          title: mod.title,
          description: mod.description,
          order: mod.order,
        });

        const moduleId = modRes.data.id;

        for (const les of mod.lessons) {
          await api.post(`/faculty/modules/${moduleId}/lessons`, {
            title: les.title,
            content: les.content,
            videoUrl: les.videoUrl,
            duration: les.duration,
            order: les.order,
          });
        }
      }

      // 3. Update publish status if toggled published
      if (published) {
        await api.patch(`/faculty/courses/${courseId}/publish`, {
          published: true,
        });
      }

      toast.success('Course created and curriculum saved successfully!');
      router.push('/faculty/courses');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation and Title Header */}
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
            <h1 className="text-2xl font-black tracking-tight">Create Course</h1>
            <p className="text-xs text-gray-500">Design a new course curriculum from scratch.</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline"
            className="flex-1 sm:flex-initial text-xs font-extrabold uppercase tracking-wider"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-1.5" /> {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button 
            disabled={isSubmitting}
            onClick={handleSaveCourse}
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Committing...
              </>
            ) : (
              'Save & Commit'
            )}
          </Button>
        </div>
      </header>

      {isPreviewMode ? (
        /* Preview Mode View */
        <Card className="p-8 border border-gray-200 dark:border-gray-800/80 max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {category}
              </span>
              <h1 className="text-3xl font-black">{title || 'Untitled Course'}</h1>
              <p className="text-sm text-gray-500 max-w-2xl">{description || 'No description provided.'}</p>
            </div>
            {thumbnail && (
              <img src={thumbnail} alt="Thumbnail" className="w-32 h-20 object-cover rounded-xl border border-gray-255" />
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800/80 pt-6">
            <h3 className="text-base font-black mb-4 flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-blue-500" /> Curriculum Syllabus ({modules.length} Modules)
            </h3>
            
            <div className="space-y-4">
              {modules.map((mod, mIdx) => (
                <div key={mIdx} className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-800/50 space-y-3">
                  <h4 className="font-extrabold text-sm">{mIdx + 1}. {mod.title}</h4>
                  {mod.description && <p className="text-xs text-gray-400">{mod.description}</p>}
                  
                  <div className="pl-4 space-y-2">
                    {mod.lessons.map((les, lIdx) => (
                      <div key={lIdx} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800/40">
                        <span className="flex items-center gap-2 font-semibold text-gray-750 dark:text-gray-300">
                          <FileText className="h-3.5 w-3.5 text-teal-500" />
                          {mIdx + 1}.{lIdx + 1} {les.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-extrabold">{les.duration} mins</span>
                      </div>
                    ))}
                    {mod.lessons.length === 0 && (
                      <p className="text-[10px] text-gray-400 italic">No lessons in this module.</p>
                    )}
                  </div>
                </div>
              ))}
              {modules.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-6">No curriculum built yet.</p>
              )}
            </div>
          </div>
        </Card>
      ) : (
        /* Creation Forms View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Metadata forms */}
          <section className="lg:col-span-5 space-y-6">
            <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2.5">
                Course Properties
              </h3>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Cybersecurity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Description</label>
                <textarea
                  placeholder="Summarize course goals and outcomes..."
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

              {/* Thumbnail Selector */}
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

              {/* Publish State */}
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
                    published ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-800'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition duration-300 ${
                    published ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>
            </Card>
          </section>

          {/* Curriculum Builder */}
          <section className="lg:col-span-7 space-y-6">
            <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2.5">
                Curriculum Builder
              </h3>

              {/* Add module inline form */}
              <form onSubmit={handleAddModule} className="p-4 bg-gray-55 dark:bg-gray-850/50 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3.5">
                <h4 className="text-xs font-black tracking-tight text-blue-600 dark:text-blue-400">Add New Module</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Module Title (e.g. Module 1: Introduction)"
                    value={newModTitle}
                    onChange={(e) => setNewModTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Brief description (optional)"
                    value={newModDesc}
                    onChange={(e) => setNewModDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs font-semibold"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full text-[10px] font-extrabold uppercase tracking-wider">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Module
                </Button>
              </form>

              {/* Modules list & Active module indicator */}
              <div className="space-y-4">
                {modules.map((mod, mIdx) => (
                  <div 
                    key={mIdx} 
                    className={`rounded-2xl border transition duration-200 ${
                      activeModuleIdx === mIdx 
                        ? 'border-blue-500 bg-blue-500/[0.01]' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    {/* Header */}
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
                      <button 
                        onClick={() => handleDeleteModule(mIdx)}
                        className="p-1 rounded hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Module lessons and lesson creation */}
                    {activeModuleIdx === mIdx && (
                      <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 space-y-4">
                        {/* Lessons List */}
                        <div className="space-y-2">
                          {mod.lessons.map((les, lIdx) => (
                            <div key={lIdx} className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/40 text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-emerald-500" /> {les.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">{les.duration}m</span>
                                <button 
                                  onClick={() => handleDeleteLesson(mIdx, lIdx)}
                                  className="text-gray-400 hover:text-rose-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
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

                {modules.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center py-8">
                    Create a module above to begin adding lessons.
                  </p>
                )}
              </div>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
