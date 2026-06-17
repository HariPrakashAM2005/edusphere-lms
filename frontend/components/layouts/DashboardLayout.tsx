'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../ui/Toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{
    id?: string;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const detail = customEvent.detail;
      
      // Map event notification types to Toast variants
      let variant: 'success' | 'error' | 'warning' | 'info' = 'info';
      if (detail.type === 'certificate_issued') variant = 'success';
      else if (detail.type === 'attendance_marked') variant = 'success';
      else if (detail.type === 'assignment_graded') variant = 'success';
      
      setActiveToast({
        title: detail.title || '🔔 New Notification',
        message: detail.message || '',
        type: variant,
      });
    };
    
    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Sidebar - Handles both mobile and desktop states */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      {/* Sidebar is fixed, so desktop layout shifts right by sidebar width (width: 72 = pl-72, or collapsed: 20 = pl-20) */}
      {/* Using transition on padding to mirror sidebar slide */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Header */}
        <Header onMobileToggle={() => setMobileSidebarOpen(true)} />

        {/* Content Body */}
        <main className="flex-1 py-8 px-6 max-w-7xl w-full mx-auto relative z-0">
          {children}
        </main>
      </div>

      {/* Global Slide-In Toast Notification */}
      <div className="fixed top-20 right-6 z-55 w-full max-w-sm pointer-events-auto">
        <AnimatePresence>
          {activeToast && (
            <Toast
              title={activeToast.title}
              message={activeToast.message}
              variant={activeToast.type || 'info'}
              onClose={() => setActiveToast(null)}
            />
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
