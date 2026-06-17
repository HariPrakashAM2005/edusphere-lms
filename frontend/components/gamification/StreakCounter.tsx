import React from 'react';
import { Flame, CheckSquare, Calendar, Award } from 'lucide-react';

interface StreakCounterProps {
  loginStreak: number;
  longestLoginStreak: number;
  assignmentStreak: number;
  attendanceStreak: number;
}

export default function StreakCounter({
  loginStreak,
  longestLoginStreak,
  assignmentStreak,
  attendanceStreak,
}: StreakCounterProps) {
  
  // Calculate next milestone progress for login streak
  const getNextMilestone = (current: number) => {
    if (current < 7) return { target: 7, progress: (current / 7) * 100 };
    if (current < 30) return { target: 30, progress: (current / 30) * 100 };
    if (current < 100) return { target: 100, progress: (current / 100) * 100 };
    return { target: 365, progress: (current / 365) * 100 };
  };

  const milestone = getNextMilestone(loginStreak);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition">
      
      {/* Header */}
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
        <Flame className="h-5 w-5 text-orange-500 fill-orange-500 animate-bounce" />
        <span>Active Streaks</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily Login Streak */}
        <div className="flex items-center space-x-4 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-orange-550/5 rounded-full scale-100 group-hover:scale-150 transition-all duration-500" />
          <div className="h-12 w-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 text-2xl font-black">
            🔥
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Login Streak
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {loginStreak} Days
            </div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Record: {longestLoginStreak} Days
            </div>
          </div>
        </div>

        {/* Assignment Streak */}
        <div className="flex items-center space-x-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-blue-500/5 rounded-full scale-100 group-hover:scale-150 transition-all duration-500" />
          <div className="h-12 w-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Assignment Streak
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {assignmentStreak} Submits
            </div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Consecutive Submissions
            </div>
          </div>
        </div>

        {/* Attendance Streak */}
        <div className="flex items-center space-x-4 bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-900/30 p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-teal-500/5 rounded-full scale-100 group-hover:scale-150 transition-all duration-500" />
          <div className="h-12 w-12 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-teal-650 dark:text-teal-400 uppercase tracking-wider">
              Attendance Streak
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {attendanceStreak} Days
            </div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Consecutive Present Status
            </div>
          </div>
        </div>

      </div>

      {/* Login Milestone Progress */}
      <div className="mt-6 border-t border-gray-100 dark:border-gray-850 pt-5">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2.5">
          <div className="flex items-center space-x-1">
            <Award className="h-4 w-4 text-amber-500" />
            <span>Next Milestone: {milestone.target}-Day Login Streak</span>
          </div>
          <span>{Math.floor(milestone.progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-105 dark:bg-gray-805 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
      </div>

    </div>
  );
}
