'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  Award,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trophy,
  MessageSquare,
  TrendingUp,
  Users
} from 'lucide-react';
import Avatar from '../ui/Avatar';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isStudent = user?.role === 'STUDENT';

  const navigation = isStudent ? [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Courses', href: '/dashboard/student/courses', icon: BookOpen },
    { name: 'Attendance History', href: '/student/attendance/history', icon: FileSpreadsheet },
    { name: 'Mark Attendance', href: '/student/attendance/mark', icon: Calendar },
    { name: 'Exams & Certs', href: '/student/assessments', icon: Award },
    { name: 'AI Chatbot', href: '/ai/chat', icon: MessageSquare },
    { name: 'Recommendations', href: '/student/recommendations', icon: TrendingUp },
    { name: 'Gamification', href: '/student/gamification', icon: Trophy }
  ] : [
    { name: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/faculty/courses', icon: BookOpen },
    { name: 'Project QR', href: '/faculty/attendance/qr', icon: Calendar },
    { name: 'Attendance Reports', href: '/faculty/attendance/reports', icon: FileSpreadsheet },
    { name: 'Assessments', href: '/faculty/assessments', icon: Award },
    { name: 'Students', href: '/faculty/students', icon: Users },
    { name: 'Analytics', href: '/faculty/analytics', icon: TrendingUp },
    { name: 'AI Chatbot', href: '/ai/chat', icon: MessageSquare }
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    onMobileClose();
  };

  const sidebarWidth = collapsed ? 'w-20' : 'w-72';

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Element */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 288 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center space-x-3.5 overflow-hidden">
            <span className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">E</span>
            {!collapsed && (
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-400">
                EduSphere
              </span>
            )}
          </div>

          {/* Collapse Trigger Button (Desktop Only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`w-full flex items-center py-3 px-3.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-500/5'
                    : 'text-gray-550 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                }`}
              >
                {/* Active glow dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute left-0 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50"
                  />
                )}

                <Icon className={`h-4.5 w-4.5 shrink-0 ${collapsed ? 'mx-auto' : 'mr-3.5'} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                {!collapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Profile and Logout Section */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/80">
          {!collapsed ? (
            <div className="p-3 bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-gray-850/60 rounded-2xl flex items-center space-x-3.5">
              <Avatar name={`${user?.firstName || ''} ${user?.lastName || ''}`} isOnline size="sm" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </h4>
                <p className="text-[9px] font-black text-gray-450 uppercase tracking-widest mt-0.5">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-450 hover:bg-white hover:text-rose-500 dark:hover:bg-gray-800 transition"
                aria-label="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <Avatar name={`${user?.firstName || ''} ${user?.lastName || ''}`} isOnline size="sm" />
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-455 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-rose-500 transition"
                aria-label="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </div>

      </motion.aside>
    </>
  );
}
