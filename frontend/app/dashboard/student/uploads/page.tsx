'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import FileUploader, { UploadResult } from '../../../../components/FileUploader';
import { 
  FileText, 
  ExternalLink, 
  Trash2, 
  FolderPlus,
  Compass,
  FileCheck,
  Server,
  CloudLightning,
  Send,
  Bell
} from 'lucide-react';
import api from '../../../../lib/api';

export default function UploadDemoPage() {
  const [uploadType, setUploadType] = useState<'course-material' | 'assignment-submission'>('course-material');
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Notification Sandbox State
  const [notifType, setNotifType] = useState<string>('assignment_graded');
  const [notifTitle, setNotifTitle] = useState<string>('Assignment Graded');
  const [notifMessage, setNotifMessage] = useState<string>('Your Data Structures Assignment has been graded: 92/100 (A).');
  const [isTriggering, setIsTriggering] = useState(false);

  const mockNotifs: Record<string, { title: string; message: string }> = {
    assignment_graded: {
      title: 'Assignment Graded',
      message: 'Your Data Structures Assignment has been graded: 92/100 (A).',
    },
    new_announcement: {
      title: 'New Lecture Announcement',
      message: 'Dr. Ramesh Kumar posted a new announcement: Tutorial session moved to Room 402.',
    },
    certificate_issued: {
      title: 'Certificate Issued! 🎓',
      message: 'Congratulations! Your completion certificate for Introduction to Python has been generated.',
    },
    attendance_marked: {
      title: 'Attendance Verified',
      message: 'Your attendance has been marked as Present for Machine Learning.',
    },
    quiz_result_available: {
      title: 'Quiz Result Released',
      message: 'Results for algorithms mid-term quiz are available. You passed with 85%.',
    },
  };

  const handleTypeChange = (type: string) => {
    setNotifType(type);
    if (mockNotifs[type]) {
      setNotifTitle(mockNotifs[type].title);
      setNotifMessage(mockNotifs[type].message);
    }
  };

  const handleTriggerNotification = async () => {
    setIsTriggering(true);
    try {
      await api.post('/notifications/test-trigger', {
        type: notifType,
        title: notifTitle,
        message: notifMessage,
      });
    } catch (err) {
      console.error('Failed to trigger mock notification:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleUploadSuccess = (files: UploadResult[]) => {
    // Append any new unique uploads to the local demo state
    setUploadedFiles(prev => {
      const merged = [...prev];
      files.forEach(newFile => {
        if (!merged.some(f => f.key === newFile.key)) {
          merged.push(newFile);
        }
      });
      return merged;
    });
    setErrorMsg(null);
  };

  const handleUploadError = (error: string) => {
    setErrorMsg(error);
  };

  const handleDeleteFile = async (key: string) => {
    try {
      // For testing, we call delete API (or let's just clean it up from frontend list)
      // Wait, is there a delete endpoint? In s3.service.ts there is deleteFile, but no route was asked.
      // We can just filter it out from the frontend preview state.
      setUploadedFiles(prev => prev.filter(f => f.key !== key));
    } catch (err: any) {
      console.error(err);
    }
  };

  // Helper to check if credentials are set to local fallback 'xxx'
  // S3 client defaults to true S3 if credentials are not 'xxx' and not empty
  const isLocalFallback = true; // For local dev, this shows fallback indicator

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Block */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AWS S3 File Storage</h1>
          <p className="mt-1 text-gray-550 dark:text-gray-400">
            Upload course syllabus, documents, or student assignments. Features automatic local filesystem fallback for sandbox testing.
          </p>
        </div>

        {/* Info Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Storage Environment</h4>
              <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">
                The storage backend is set to use **AWS S3** with local fallback capability if AWS credentials are set to default placeholders (`xxx`).
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <CloudLightning className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Security & Credentials</h4>
              <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">
                Files uploaded to `/api/upload/*` are processed on the server, authenticated using JWT, and streamed directly to S3 or written to the `backend/uploads/` folder.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Interface Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Uploader Column (Colspan 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-150">Upload Queue</h3>
                  <p className="text-xs text-gray-500">Pick the target folder bucket and select your files.</p>
                </div>
                
                {/* Select Type Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button
                    onClick={() => setUploadType('course-material')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      uploadType === 'course-material'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    Course Material
                  </button>
                  <button
                    onClick={() => setUploadType('assignment-submission')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      uploadType === 'assignment-submission'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <FileCheck className="h-3.5 w-3.5" />
                    Assignment
                  </button>
                </div>
              </div>

              {/* Error Toast / Alert */}
              {errorMsg && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Trash2 className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* File Uploader Component */}
              <FileUploader
                uploadType={uploadType}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                accept="image/*,application/pdf,video/*,.zip,.rar,.txt"
                maxFiles={3}
                maxSizeMB={25}
              />
            </div>

            {/* Notification Sandbox Test Panel */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-150 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-500 animate-bounce" />
                    Real-time Notifications Sandbox
                  </h3>
                  <p className="text-xs text-gray-550">
                    Trigger Socket.io events and verify the bell increments, list updates, and sliding toast overlays.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Event Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                    Notification Event Type
                  </label>
                  <select
                    value={notifType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="assignment_graded">assignment_graded</option>
                    <option value="new_announcement">new_announcement</option>
                    <option value="certificate_issued">certificate_issued</option>
                    <option value="attendance_marked">attendance_marked</option>
                    <option value="quiz_result_available">quiz_result_available</option>
                  </select>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="Enter notification title"
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                    Message Body
                  </label>
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="Enter notification details"
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Trigger Button */}
                <button
                  onClick={handleTriggerNotification}
                  disabled={isTriggering}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {isTriggering ? 'Triggering Event...' : 'Trigger Socket.io Event'}
                </button>
              </div>
            </div>
          </div>

          {/* Upload History / Review Column */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl shadow-sm h-full flex flex-col">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-150">Active Session Uploads</h3>
              <p className="text-xs text-gray-500">Access links of recently uploaded documents.</p>
            </div>

            <div className="flex-1 mt-4">
              {uploadedFiles.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4">
                  <Compass className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-2" />
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-600">
                    No files uploaded during this session yet. Upload a file on the left to test retrieval.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file, idx) => (
                    <div 
                      key={idx}
                      className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 flex flex-col gap-2 hover:border-gray-250 dark:hover:border-gray-700 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate" title={file.fileName}>
                            {file.fileName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteFile(file.key)}
                          className="text-gray-400 hover:text-rose-500 p-0.5 rounded transition"
                          title="Remove list record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1">
                        <p className="truncate">Key: <span className="font-mono text-gray-600 dark:text-gray-350">{file.key}</span></p>
                        <p>Mime: {file.mimetype} • Size: {Math.round(file.size / 1024)} KB</p>
                      </div>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 text-xxs font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                      >
                        <ExternalLink className="h-3 w-3" /> View / Download File
                      </a>
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
