'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Award,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  collapsed: propCollapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose = () => {},
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [localCollapsed, setLocalCollapsed] = useState(false);

  const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
  const toggleCollapse = onToggle || (() => setLocalCollapsed(!localCollapsed));

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Assessments', href: '/assessments', icon: Award },
    { name: 'Students', href: '/students', icon: Users },
  ];

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 h-full ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">A</span>
          {!collapsed && (
            <span className="text-md font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              EduSphere Admin
            </span>
          )}
        </div>

        <button
          onClick={toggleCollapse}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center py-3 px-3.5 rounded-xl text-xs font-bold transition-all relative ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {/* Active glow line */}
              {isActive && (
                <motion.div
                  layoutId="adminActiveGlow"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-md shadow-blue-500/50"
                />
              )}

              <Icon className={`h-4.5 w-4.5 shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              {!collapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile and Sign Out */}
      <div className="p-4 border-t border-slate-800">
        {!collapsed ? (
          <div className="p-3 bg-slate-800/40 rounded-2xl flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
              FA
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black truncate">Faculty Admin</h4>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Faculty Room</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-455 transition"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-1">
            <div className="h-8 w-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
              FA
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-455 transition"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

    </motion.aside>
    </>
  );
}
