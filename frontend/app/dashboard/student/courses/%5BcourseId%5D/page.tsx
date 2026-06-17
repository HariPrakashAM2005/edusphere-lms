'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import {
  useCourseDetails,
  useCompleteLesson,
  useCourses
} from '../../../../../hooks/useDashboard';
import {
  BookOpen,
  CheckCircle,
  Play,
  FileText,
  Video,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Send,
  User,
  ArrowLeft
} from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  avatar: string;
  comment: string;
  time: string;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const { courseId } = useParams();
  const courseIdStr = courseId as string;

  const { data: courses } = useCourses();
  const { data: modules, isLoading: detailsLoading } = useCourseDetails(courseIdStr);
  const completeLessonMutation = useCompleteLesson();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');
  const [newComment, setNewComment] = useState('');
  
  // XP notification toast state
  const [showXpToast, setShowXpToast] = useState(false);
  const [gainedXp, setGainedXp] = useState(0);

  // Mock comments state
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', name: 'Sanjana Roy', avatar: 'SR', comment: 'What are the main libraries for stack implementations in Python?', time: '2 hours ago' },
    { id: '2', name: 'Dr. Ramesh Kumar', avatar: 'RK', comment: 'You should look at the collections.deque class. It is ideal for stack operations because it provides O(1) appends and pops.', time: '1 hour ago' },
  ]);

  // Find course details
  const course = courses?.find((c) => c.courseId === courseIdStr);

  // Get active lesson
  const allLessons = modules?.flatMap((m) => m.lessons) || [];
  const activeLesson = allLessons.find((l) => l.id === activeLessonId) || allLessons[0];

  // Set default active lesson on load
  useEffect(() => {
    if (allLessons.length > 0 && !activeLessonId) {
      setActiveLessonId(allLessons[0].id);
    }
  }, [modules, activeLessonId, allLessons]);

  const handleLessonComplete = async () => {
    if (!activeLesson || activeLesson.completed) return;

    completeLessonMutation.mutate(activeLesson.id, {
      onSuccess: (data) => {
        // Show XP toast
        setGainedXp(data.xpEarned);
        setShowXpToast(true);
        setTimeout(() => setShowXpToast(false), 3000);
      }
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: String(Date.now()),
      name: 'You (Student)',
      avatar: 'YS',
      comment: newComment,
      time: 'Just now',
    };

    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  const renderLessonIcon = (type: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />;
    }
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  if (detailsLoading || !activeLesson) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        
        {/* XP Toast Notification */}
        {showXpToast && (
          <div className="fixed top-20 right-6 z-50 flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-5 py-3.5 rounded-xl shadow-2xl animate-bounce">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-200 fill-yellow-200" />
            <span>+{gainedXp} XP Gained! Lesson Completed!</span>
          </div>
        )}

        {/* Back and Title */}
        <header className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/dashboard/student/courses')}
            className="p-2 border border-gray-250 dark:border-gray-800 hover:bg-gray-150 dark:hover:bg-gray-850 rounded-xl transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight truncate max-w-lg md:max-w-2xl">
              {course?.title || 'Course Dashboard'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-405 mt-0.5">
              Curriculum progress: {course?.progress || 0}%
            </p>
          </div>
        </header>

        {/* Course Details Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Player & Tabs (ColSpan 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Mock Player */}
            <div className="relative aspect-video w-full bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center shadow-lg group">
              <div className="text-center p-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md transition transform group-hover:scale-105">
                  {activeLesson.type === 'video' ? <Play className="h-8 w-8 fill-white" /> : <FileText className="h-8 w-8" />}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white tracking-wide">
                  {activeLesson.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  Type: {activeLesson.type} • {activeLesson.xpValue} XP reward
                </p>
              </div>

              {/* Decorative progress layer */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
                <div
                  className="bg-blue-600 h-1.5 rounded-r transition-all duration-300"
                  style={{ width: activeLesson.completed ? '100%' : '15%' }}
                />
              </div>
            </div>

            {/* Complete / Actions Bar */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-wider">
                XP reward: {activeLesson.xpValue} XP
              </span>

              <button
                onClick={handleLessonComplete}
                disabled={activeLesson.completed || completeLessonMutation.isPending}
                className={`flex items-center px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition ${
                  activeLesson.completed
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-250 cursor-default shadow-none dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {activeLesson.completed ? (
                  <>
                    <CheckCircle className="h-4.5 w-4.5 mr-2" /> Completed
                  </>
                ) : completeLessonMutation.isPending ? (
                  'Saving...'
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`pb-4 text-sm font-extrabold transition-all border-b-2 ${
                    activeTab === 'content'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Lesson Notes
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`pb-4 text-sm font-extrabold transition-all border-b-2 ${
                    activeTab === 'discussion'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Discussion Forum
                </button>
              </nav>
            </div>

            {/* Tab Content Panels */}
            {activeTab === 'content' ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold">About this lesson</h3>
                <p className="text-sm leading-relaxed text-gray-650 dark:text-gray-400">
                  This segment details the theoretical structures, time complexities (Big O notation), and practical applications of this lesson's topic. Pay attention to stack frames, heap allocations, and garbage collection mechanisms depending on the execution environment.
                </p>
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 tracking-wider mb-2">Key Takeaways</h4>
                  <ul className="list-disc list-inside text-xs text-gray-650 dark:text-gray-400 space-y-1">
                    <li>O(1) push and pop time complexity.</li>
                    <li>LIFO (Last In, First Out) ordering.</li>
                    <li>Utilized in runtime function call stacks and undo engines.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Comments Thread */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {comments.map((cmt) => (
                    <div key={cmt.id} className="flex gap-3 text-sm">
                      <div className="h-8 w-8 rounded-full bg-blue-150 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-200 text-xs flex-shrink-0">
                        {cmt.avatar}
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-850 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs">{cmt.name}</span>
                          <span className="text-xxs text-gray-500 dark:text-gray-400">{cmt.time}</span>
                        </div>
                        <p className="text-xs text-gray-650 dark:text-gray-400 leading-relaxed">
                          {cmt.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment box */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a message or ask a question..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs"
                  />
                  <button type="submit" className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition">
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Sidebar Modules (ColSpan 1) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold mb-4">Course Curriculum</h3>
              
              <div className="space-y-6">
                {modules?.map((mod) => (
                  <div key={mod.id} className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {mod.title}
                    </h4>

                    <div className="space-y-1.5">
                      {mod.lessons.map((les) => {
                        const isActive = les.id === activeLessonId;
                        return (
                          <button
                            key={les.id}
                            onClick={() => setActiveLessonId(les.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition text-left ${
                              isActive
                                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400'
                                : 'bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {renderLessonIcon(les.type, les.completed)}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
