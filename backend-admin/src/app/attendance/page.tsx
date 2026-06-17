'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, QrCode, Timer, Check, Plus, AlertCircle, Sparkles, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttendanceDay {
  date: string;
  dayNum: number;
  rate: number; // 0 to 100
  logins: number;
}

interface ActiveSession {
  id: string;
  courseName: string;
  courseCode: string;
  timeLeft: number; // seconds
  scans: number;
}

// Generate last 35 days of attendance data
const generateMockAttendance = (): AttendanceDay[] => {
  const data: AttendanceDay[] = [];
  const startDay = 1; // start from 1st of current month
  for (let i = 0; i < 35; i++) {
    const rate = Math.floor(Math.random() * 30) + 70; // 70 to 100
    data.push({
      date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
      dayNum: (i % 31) + 1,
      rate: rate,
      logins: Math.floor(rate * 1.5),
    });
  }
  return data;
};

const MOCK_CHECKINS = [
  { student: 'Haris Khan', id: 'STU-4291', course: 'CS-402', time: 'Just Now', status: 'verified' },
  { student: 'Sarah Connor', id: 'STU-3120', course: 'CS-380', time: '2 mins ago', status: 'verified' },
  { student: 'Bruce Wayne', id: 'STU-0077', course: 'ECON-201', time: '5 mins ago', status: 'verified' },
  { student: 'John Smith', id: 'STU-1829', course: 'PHYS-410', time: '8 mins ago', status: 'flagged' },
  { student: 'Diana Prince', id: 'STU-8822', course: 'EE-104', time: '12 mins ago', status: 'verified' },
];

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    { id: '1', courseName: 'Advanced Cryptography', courseCode: 'CS-402', timeLeft: 180, scans: 24 },
  ]);
  const [selectedCourse, setSelectedCourse] = useState('CS-380');
  const [qrValidMinutes, setQrValidMinutes] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSessionQr, setCurrentSessionQr] = useState<ActiveSession | null>(null);

  // Load attendance data
  useEffect(() => {
    setAttendanceData(generateMockAttendance());
  }, []);

  // Countdown for active sessions
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSessions((prev) =>
        prev
          .map((s) => ({ ...s, timeLeft: s.timeLeft - 1 }))
          .filter((s) => s.timeLeft > 0)
      );

      if (currentSessionQr) {
        setCurrentSessionQr((prev) => {
          if (!prev || prev.timeLeft <= 1) return null;
          return { ...prev, timeLeft: prev.timeLeft - 1, scans: prev.scans + (Math.random() > 0.7 ? 1 : 0) };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSessionQr]);

  const handleGenerateSession = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newSession: ActiveSession = {
        id: Date.now().toString(),
        courseName: selectedCourse === 'CS-380' ? 'Machine Learning Models' : selectedCourse === 'EE-104' ? 'Digital Systems' : 'Microeconomic Theory',
        courseCode: selectedCourse,
        timeLeft: qrValidMinutes * 60,
        scans: 0,
      };

      setActiveSessions((prev) => [newSession, ...prev]);
      setCurrentSessionQr(newSession);
      setIsGenerating(false);
    }, 1000);
  };

  const getHeatmapColor = (rate: number) => {
    if (rate >= 95) return 'bg-teal-600 dark:bg-teal-500 hover:ring-2 hover:ring-teal-400';
    if (rate >= 88) return 'bg-teal-400 dark:bg-teal-400/80 hover:ring-2 hover:ring-teal-300';
    if (rate >= 80) return 'bg-teal-200 dark:bg-teal-800/60 hover:ring-2 hover:ring-teal-700';
    if (rate >= 72) return 'bg-amber-200 dark:bg-amber-800/40 hover:ring-2 hover:ring-amber-500';
    return 'bg-rose-200 dark:bg-rose-900/40 hover:ring-2 hover:ring-rose-500';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
          Attendance Operations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor daily logs, generate dynamic secure QR sessions, and view institution attendance heatmaps
        </p>
      </div>

      {/* Grid Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-600 dark:text-teal-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Monthly Rate</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">88.4%</h3>
            <span className="text-[9px] text-emerald-500 font-bold mt-0.5 flex items-center">
              +1.2% from last cycle
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active QR Streams</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{activeSessions.length}</h3>
            <span className="text-[9px] text-blue-500 font-bold mt-0.5">
              Listening for WebSocket scans
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Scans Today</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">348</h3>
            <span className="text-[9px] text-purple-500 font-bold mt-0.5">
              Across all department lines
            </span>
          </div>
        </div>
      </section>

      {/* Main Sections Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Heatmap Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Daily Heatmap</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Aggregated attendance stability metrics</p>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
              June 2026
            </span>
          </div>

          {/* Grid Layout representing a month */}
          <div className="grid grid-cols-7 gap-2.5 pt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-[9px] font-black uppercase tracking-wider text-slate-400 py-1">
                {day}
              </div>
            ))}

            {/* Empty spacer blocks for calendar layout styling */}
            <div className="aspect-square bg-slate-50/20 dark:bg-slate-950/20 rounded-lg opacity-40 border border-dashed" />
            <div className="aspect-square bg-slate-50/20 dark:bg-slate-950/20 rounded-lg opacity-40 border border-dashed" />
            
            {attendanceData.map((d, idx) => (
              <div
                key={idx}
                className={`aspect-square ${getHeatmapColor(d.rate)} rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-between p-2 shadow-sm relative group`}
              >
                <span className="text-[9px] font-black text-white/80 dark:text-white">{d.dayNum}</span>
                
                {/* Popover tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-28 bg-slate-950 text-white text-[9px] font-bold p-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-10 text-center">
                  <p>Rate: {d.rate}%</p>
                  <p className="opacity-70 mt-0.5">{d.logins} Student Scans</p>
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap Legend */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Hover grid node for scan data</span>
            <div className="flex items-center space-x-1.5">
              <span>Low</span>
              <div className="h-2.5 w-2.5 rounded bg-rose-250 dark:bg-rose-900/40" />
              <div className="h-2.5 w-2.5 rounded bg-amber-250 dark:bg-amber-800/40" />
              <div className="h-2.5 w-2.5 rounded bg-teal-200 dark:bg-teal-800/60" />
              <div className="h-2.5 w-2.5 rounded bg-teal-400 dark:bg-teal-400/80" />
              <div className="h-2.5 w-2.5 rounded bg-teal-650" />
              <span>Optimal</span>
            </div>
          </div>
        </div>

        {/* QR Code Action Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Live QR Generator</h3>
            </div>

            {/* QR Setup Form */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-450">Target Stream</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="CS-380" className="dark:bg-slate-900">Machine Learning (CS-380)</option>
                  <option value="EE-104" className="dark:bg-slate-900">Digital Systems (EE-104)</option>
                  <option value="ECON-201" className="dark:bg-slate-900">Microeconomics (ECON-201)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-450">Link Validity</label>
                <select
                  value={qrValidMinutes}
                  onChange={(e) => setQrValidMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value={1} className="dark:bg-slate-900">1 Minute</option>
                  <option value={5} className="dark:bg-slate-900">5 Minutes</option>
                  <option value={10} className="dark:bg-slate-900">10 Minutes</option>
                  <option value={15} className="dark:bg-slate-900">15 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateSession}
            disabled={isGenerating}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 mr-2 animate-spin" /> Starting Stream...
              </>
            ) : (
              <>
                <QrCode className="h-4.5 w-4.5 mr-2" /> Generate Secure QR
              </>
            )}
          </button>
        </div>
      </section>

      {/* QR Active Window and Check-ins Log */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Session Display */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {currentSessionQr ? (
              <motion.div
                key="active-qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-5 w-full flex flex-col items-center"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider animate-pulse">
                    Live Session Active
                  </span>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white mt-2">
                    {currentSessionQr.courseName}
                  </h4>
                  <p className="text-[10px] text-slate-450 uppercase tracking-widest mt-0.5">
                    {currentSessionQr.courseCode}
                  </p>
                </div>

                {/* Secure Dynamic QR Code Block with radar sweep */}
                <div className="relative p-4 bg-white border border-slate-205 rounded-2xl shadow-sm h-40 w-40 flex items-center justify-center">
                  
                  {/* Radar Line Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 h-1/2 w-full animate-pulse border-b-2 border-blue-500 pointer-events-none" />

                  {/* QR Matrix Grid mock */}
                  <div className="grid grid-cols-10 gap-1 w-full h-full opacity-80">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs transition-colors duration-500 ${
                          (i % 3 === 0 && i % 4 !== 0) || (i < 15 && i > 3) || (i > 85 && i % 7 === 0)
                            ? 'bg-slate-950'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Absolute Center Badge */}
                  <div className="absolute p-2 bg-white rounded-lg border shadow-sm">
                    <QrCode className="h-5 w-5 text-blue-500" />
                  </div>
                </div>

                {/* Timer details */}
                <div className="flex items-center space-x-6 text-xs font-bold text-slate-500 pt-2">
                  <span className="flex items-center">
                    <Timer className="h-4 w-4 mr-1.5 text-blue-500" /> {formatTime(currentSessionQr.timeLeft)} left
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-emerald-500" /> {currentSessionQr.scans} check-ins
                  </span>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="no-active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 py-8"
              >
                <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-center text-slate-400 mx-auto">
                  <Clock className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white">No active QR generation</h4>
                <p className="text-xs text-slate-450 max-w-xs mx-auto">Generate a session on the right sidebar to start dynamic student verification.</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Live log of scans */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Dynamic Check-in Stream</h3>
            <p className="text-[10px] text-slate-455 mt-0.5">Real-time verification feeds synced via network tunnels</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {MOCK_CHECKINS.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 border border-slate-205 dark:border-slate-700">
                    {c.student.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800 dark:text-white">{c.student}</h5>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {c.id} • {c.course}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-slate-400 font-bold">{c.time}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    c.status === 'verified'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
