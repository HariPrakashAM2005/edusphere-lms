'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  FileCheck, 
  Megaphone, 
  Award, 
  Calendar, 
  TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, isConnected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment_graded':
        return (
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <FileCheck className="h-4 w-4" />
          </div>
        );
      case 'new_announcement':
        return (
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Megaphone className="h-4 w-4" />
          </div>
        );
      case 'certificate_issued':
        return (
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Award className="h-4 w-4" />
          </div>
        );
      case 'attendance_marked':
        return (
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Calendar className="h-4 w-4" />
          </div>
        );
      case 'quiz_result_available':
        return (
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-550 dark:text-gray-400">
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return `${interval}y ago`;
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return `${interval}mo ago`;
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return `${interval}d ago`;
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return `${interval}h ago`;
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return `${interval}m ago`;
      return 'just now';
    } catch {
      return 'some time ago';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition relative ${
          isOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
        }`}
      >
        <Bell className="h-5 w-5" />
        
        {/* Pulsating unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-gray-900">
            {unreadCount}
          </span>
        )}

        {/* Live socket connection status indicator */}
        <span 
          className={`absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-white dark:ring-gray-900 ${
            isConnected ? 'bg-emerald-500' : 'bg-amber-400'
          }`} 
          title={isConnected ? 'Connected to live notifications' : 'Connecting to notifications...'}
        />
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-150">Notifications</h4>
                <p className="text-[10px] text-gray-500">
                  {unreadCount} unread • {isConnected ? 'connected' : 'connecting...'}
                </p>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={() => markRead('all')}
                  className="text-xxs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            {/* List Body */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-850">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                  <Bell className="h-8 w-8 text-gray-300 dark:text-gray-750 mb-2" />
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-600">No notifications yet</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-650 mt-1 max-w-[220px]">
                    You will receive real-time notifications when your assignments are graded, certificates are issued, or attendance is marked.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 flex gap-3 transition-colors ${
                      notif.isRead 
                        ? 'bg-white hover:bg-gray-50/50 dark:bg-gray-900 dark:hover:bg-gray-850/40' 
                        : 'bg-blue-50/20 hover:bg-blue-50/40 dark:bg-blue-950/10 dark:hover:bg-blue-950/20'
                    }`}
                  >
                    {/* Event Type Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Notification Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs text-gray-900 dark:text-gray-150 truncate ${notif.isRead ? 'font-medium' : 'font-bold'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[9px] text-gray-450 dark:text-gray-550 flex-shrink-0 mt-0.5">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-1 leading-relaxed break-words">
                        {notif.message}
                      </p>

                      {/* Individual Mark Read trigger */}
                      {!notif.isRead && (
                        <button
                          onClick={() => markRead(notif.id)}
                          className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
