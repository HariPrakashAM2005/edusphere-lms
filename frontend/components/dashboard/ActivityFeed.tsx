'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Award, LogIn, Clock } from 'lucide-react';
import Card from '../ui/Card';

export interface ActivityItem {
  id: string;
  type: 'lesson' | 'xp' | 'badge' | 'login';
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

// Fallback mock activities if none provided
const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'xp', title: 'Claimed Daily Streak XP', description: 'Earned +50 XP points today.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', type: 'lesson', title: 'Completed Video Lesson', description: 'Watched "Introduction to React Hooks" in Web Dev.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', type: 'badge', title: 'Unlocked Badge: Speed Demon', description: 'Completed a quiz in under 2 minutes.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: '4', type: 'login', title: 'Account Checked-In', description: 'Signed in from New Delhi, IN.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
];

export default function ActivityFeed({ activities = MOCK_ACTIVITIES }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'xp': return <Trophy className="h-4 w-4" />;
      case 'badge': return <Award className="h-4 w-4" />;
      default: return <LogIn className="h-4 w-4" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'xp': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'badge': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const listItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Recent Activity</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Live feed of your learning audit logs</p>
        </div>
      </div>

      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {activities.map((act) => (
          <motion.div
            key={act.id}
            variants={listItem}
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="group flex items-start gap-4 p-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 rounded-2xl cursor-pointer transition-all duration-200"
          >
            {/* Status dot and icon */}
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${getColors(act.type)}`}>
              {getIcon(act.type)}
            </div>

            {/* Content Details */}
            <div className="flex-grow min-w-0 pr-2">
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {act.title}
              </h4>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed truncate group-hover:whitespace-normal group-hover:line-clamp-none transition-all duration-300">
                {act.description}
              </p>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0 mt-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(act.timestamp)}
            </div>

          </motion.div>
        ))}
      </motion.div>
    </Card>
  );
}
