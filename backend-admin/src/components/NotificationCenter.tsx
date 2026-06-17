'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Bell, AlertTriangle, AlertCircle, Info, Calendar } from 'lucide-react';

export interface AdminNotification {
  id: string;
  type: 'critical' | 'system' | 'academic' | 'attendance';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  { id: '1', type: 'critical', title: 'Critical Attendance Drop', message: 'Student Amit Kumar attendance fell to 68% in Web Dev.', date: 'Today', isRead: false },
  { id: '2', type: 'academic', title: 'New Exam Created', message: 'Faculty Prof. Sharma published Mid Term MCQ quiz.', date: 'Today', isRead: false },
  { id: '3', type: 'system', title: 'DB Backup Complete', message: 'Academic database snapshot completed successfully.', date: 'Yesterday', isRead: true },
  { id: '4', type: 'attendance', title: 'QR Session Expired', message: 'Token generated for Nit001 lecture was expired automatically.', date: 'Yesterday', isRead: false },
];

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-rose-500/10 text-rose-500 border-l-rose-500';
      case 'academic': return 'bg-purple-500/10 text-purple-500 border-l-purple-500';
      case 'attendance': return 'bg-emerald-500/10 text-emerald-500 border-l-emerald-500';
      default: return 'bg-blue-500/10 text-blue-500 border-l-blue-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-4.5 w-4.5" />;
      case 'academic': return <Calendar className="h-4.5 w-4.5" />;
      case 'attendance': return <Check className="h-4.5 w-4.5" />;
      default: return <Info className="h-4.5 w-4.5" />;
    }
  };

  // Group notifications by date
  const grouped = notifications.reduce((groups, item) => {
    const group = item.date;
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, AdminNotification[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shadow-2xl z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4.5 w-4.5 text-blue-500" />
                <h3 className="text-base font-black text-slate-850 dark:text-white tracking-tight">Admin Alerts</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition cursor-pointer"
                aria-label="Close panel"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Notification List Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {Object.keys(grouped).map((groupTitle) => (
                <div key={groupTitle} className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {groupTitle}
                  </h4>

                  <div className="space-y-3">
                    {grouped[groupTitle].map((n) => (
                      <motion.div
                        key={n.id}
                        layout
                        className={`flex gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-800/20 border-l-4 rounded-r-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group ${
                          n.isRead ? 'opacity-50' : ''
                        } ${getColors(n.type)}`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-4">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {n.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                        </div>

                        {/* Mark read button */}
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="absolute right-2 top-2 p-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                            aria-label="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="py-20 text-center text-slate-400 text-xs">
                  All clean! No alerts at the moment.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
                className="text-[10px] font-black uppercase tracking-wider text-blue-500 hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
