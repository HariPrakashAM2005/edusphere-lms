'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Search, Sun, Moon, Menu } from 'lucide-react';
import NotificationBell from '../NotificationBell';

interface HeaderProps {
  onMobileToggle: () => void;
}

export default function Header({ onMobileToggle }: HeaderProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 w-full h-18 bg-white/75 dark:bg-gray-900/75 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80 transition-colors duration-300 flex items-center justify-between px-6">
      
      {/* Left side Search & mobile menu trigger */}
      <div className="flex items-center space-x-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-2 rounded-xl border border-gray-150 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Animated Search Bar */}
        <motion.div
          animate={{ width: searchFocused ? 260 : 180 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`hidden sm:flex items-center bg-gray-50/50 dark:bg-gray-800/30 border rounded-2xl p-1 px-3.5 transition-all ${
            searchFocused
              ? 'border-blue-500 shadow-md shadow-blue-500/5 focus-within:ring-2 focus-within:ring-blue-500/15'
              : 'border-gray-150 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search classes, logs..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent border-0 outline-none text-xs font-semibold text-gray-750 dark:text-gray-200 placeholder-gray-400"
          />
        </motion.div>
      </div>

      {/* Right side notification and profile buttons */}
      <div className="flex items-center space-x-3.5">
        
        {/* Shaking Notification Bell */}
        <NotificationBell />

        {/* Rotating Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          whileTap={{ scale: 0.92, rotate: 15 }}
          className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-850 transition flex items-center justify-center"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div initial={{ rotate: 90 }} animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
              <Moon className="h-4.5 w-4.5 text-indigo-650" />
            </motion.div>
          )}
        </motion.button>
      </div>

    </header>
  );
}
