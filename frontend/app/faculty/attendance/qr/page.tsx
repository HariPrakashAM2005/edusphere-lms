'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useGenerateQR, useFacultyAttendance } from '../../../../hooks/useAttendance';
import { useCourses } from '../../../../hooks/useDashboard';
import { RefreshCw, Play, Clock, Users, School } from 'lucide-react';

export default function FacultyQRPage() {
  const { data: courses } = useCourses();
  const generateMutation = useGenerateQR();

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);

  // Live student sign-ins mock list (adds students as time progresses)
  const [liveStudents, setLiveStudents] = useState<any[]>([]);

  // Set default selected course
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].courseId);
    }
  }, [courses, selectedCourseId]);

  // Handle countdown
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Token expired, auto-regenerate QR if active
      handleGenerateQR();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Handle live mock student sign-in triggers
  useEffect(() => {
    let timeout: any = null;
    if (isActive) {
      const names = ['Aravind Swamy', 'Sanjana Roy', 'Meera Patel', 'Rohit Sharma', 'Vikas Gupta'];
      const emails = ['aravind@nit001.edu', 'sanjana@nit001.edu', 'meera@nit001.edu', 'rohit@nit001.edu', 'vikas@nit001.edu'];
      
      const addNextStudent = (index: number) => {
        if (index >= names.length) return;
        timeout = setTimeout(() => {
          setLiveStudents((prev) => [
            ...prev,
            {
              name: names[index],
              email: emails[index],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              status: 'present',
            }
          ]);
          addNextStudent(index + 1);
        }, Math.random() * 8000 + 4000); // add every 4-12 seconds
      };

      setLiveStudents([]);
      addNextStudent(0);
    }

    return () => clearTimeout(timeout);
  }, [isActive, qrToken]);

  const handleGenerateQR = () => {
    if (!selectedCourseId) return;

    generateMutation.mutate(
      { courseId: selectedCourseId },
      {
        onSuccess: (data) => {
          setQrToken(data.token);
          setQrCodeImage(data.qrCodeDataUrl);
          setTimeLeft(data.expiresIn);
          setIsActive(true);
        },
      }
    );
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Smart Attendance QR</h1>
          <p className="mt-1 text-gray-550 dark:text-gray-400">
            Generate dynamic OTP-QR codes to verify student GPS locations and biometric face signatures in real time
          </p>
        </div>

        {/* Content Column grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* QR Code generator box (ColSpan 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm flex flex-col items-center">
              
              {/* Form Controls */}
              <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-sm appearance-none cursor-pointer"
                  >
                    {courses?.map((c) => (
                      <option key={c.courseId} value={c.courseId}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerateQR}
                  disabled={generateMutation.isPending}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition disabled:opacity-75 text-sm flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {generateMutation.isPending ? 'Generating...' : 'Refresh QR'}
                </button>
              </div>

              {/* QR Code display */}
              {qrCodeImage ? (
                <div className="flex flex-col items-center space-y-6">
                  {/* Outer glow container */}
                  <div className="p-6 bg-white dark:bg-white border-4 border-blue-500 rounded-3xl shadow-xl">
                    <img src={qrCodeImage} alt="Attendance QR Code" className="h-64 w-64 md:h-80 md:w-80" />
                  </div>

                  {/* Timer and active alerts */}
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center text-xs font-bold text-gray-750 dark:text-gray-300 bg-gray-50 dark:bg-gray-850 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800">
                      <Clock className="h-4.5 w-4.5 mr-2 text-blue-600 dark:text-blue-400" />
                      <span>Expires in: <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span></span>
                    </div>

                    <div className="flex items-center text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-4 py-2 rounded-full border border-green-250 dark:border-green-900/40">
                      <Users className="h-4.5 w-4.5 mr-2 animate-pulse" />
                      <span>Live sign-ins: <span className="font-extrabold">{liveStudents.length}</span></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-gray-500 max-w-sm">
                  <School className="h-12 w-12 text-gray-300 dark:text-gray-750 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">QR Code Projector</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-405 mt-1">
                    Select a course curriculum and click Generate QR to project the dynamic attendance scanner for students.
                  </p>
                  <button
                    onClick={handleGenerateQR}
                    className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition text-xs flex items-center justify-center mx-auto"
                  >
                    <Play className="h-4 w-4 mr-1.5 fill-white" /> Start Session QR
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Live attendance feed list (ColSpan 1) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm h-[500px] flex flex-col">
              <h3 className="text-base font-bold mb-4">Live Check-ins Feed</h3>
              
              {liveStudents.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-450 dark:text-gray-500">
                  <Users className="h-10 w-10 mb-3 text-gray-300 dark:text-gray-800" />
                  <p className="text-xs font-semibold">Waiting for student check-ins...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5">
                  {liveStudents.map((student, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-850">
                      <div>
                        <h4 className="text-xs font-bold">{student.name}</h4>
                        <p className="text-xxs text-gray-500 dark:text-gray-405 mt-0.5">{student.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xxs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full">
                          {student.status}
                        </span>
                        <p className="text-xxs text-gray-400 mt-1 font-mono">{student.time}</p>
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
