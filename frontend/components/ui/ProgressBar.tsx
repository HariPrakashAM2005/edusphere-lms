'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // percentage 0-100
  colorScheme?: 'blue' | 'green' | 'orange' | 'purple' | 'teal' | 'pink';
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  colorScheme = 'blue',
  showLabel = true,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, value));

  const gradients = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-400 to-teal-500',
    orange: 'from-orange-400 to-amber-500',
    purple: 'from-purple-500 to-fuchsia-600',
    teal: 'from-teal-400 to-cyan-500',
    pink: 'from-pink-500 to-rose-600',
  };

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-500">
          <span>Progress</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-800 dark:text-gray-200"
          >
            {Math.round(percent)}%
          </motion.span>
        </div>
      )}
      
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800/80 rounded-full relative overflow-hidden">
        {/* Shimmer Overlay */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer pointer-events-none z-10" />

        {/* Core Fill Bar with Spring Entrance */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.1 }}
          className={`h-full bg-gradient-to-r ${gradients[colorScheme]} rounded-full relative z-0`}
        />
      </div>
    </div>
  );
}
