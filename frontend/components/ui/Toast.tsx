'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface ToastProps {
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number; // duration in ms
}

export default function Toast({
  title,
  message,
  variant = 'info',
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <ShieldAlert className="h-5 w-5 text-rose-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const borders = {
    success: 'border-l-4 border-l-emerald-500 border-gray-200/50 dark:border-gray-800/60',
    error: 'border-l-4 border-l-rose-500 border-gray-200/50 dark:border-gray-800/60',
    warning: 'border-l-4 border-l-amber-500 border-gray-200/50 dark:border-gray-800/60',
    info: 'border-l-4 border-l-blue-500 border-gray-200/50 dark:border-gray-800/60',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`w-full max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-xl p-4 flex gap-3.5 relative overflow-hidden ${borders[variant]}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-tight">
          {title}
        </h4>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
          variant === 'success'
            ? 'from-emerald-400 to-teal-500'
            : variant === 'error'
            ? 'from-rose-400 to-pink-500'
            : variant === 'warning'
            ? 'from-amber-400 to-orange-500'
            : 'from-blue-400 to-indigo-500'
        }`}
      />
    </motion.div>
  );
}
