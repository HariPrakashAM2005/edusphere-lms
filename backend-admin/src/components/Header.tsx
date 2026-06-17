'use client';

import React, { useState } from 'react';
import { Sun, Moon, Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onMobileToggle: () => void;
  onNotificationsToggle: () => void;
  unreadCount?: number;
}

export default function Header({
  onMobileToggle,
  onNotificationsToggle,
  unreadCount = 0,
}: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-300 flex items-center justify-between px-6">
      
      {/* Left Area - Mobile menu trigger */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          aria-label="Open mobile menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Institution Control Center
        </span>
      </div>

      {/* Right Area - Toggles & Actions */}
      <div className="flex items-center space-x-3.5">
        
        {/* Real-time Notifications Bell */}
        <button
          onClick={onNotificationsToggle}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800/80 transition relative flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-white dark:border-slate-900 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800/80 transition flex items-center justify-center"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-650" />}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2.5 p-1 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
          >
            <div className="h-7 w-7 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              FA
            </div>
            <span className="hidden md:inline text-xs font-bold text-slate-750 dark:text-slate-200">
              Admin
            </span>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                {/* Click outside overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                >
                  <button className="w-full flex items-center px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left">
                    <User className="h-4 w-4 mr-2 text-slate-400" /> My Profile
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left">
                    <Settings className="h-4 w-4 mr-2 text-slate-400" /> settings
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition text-left">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
}
