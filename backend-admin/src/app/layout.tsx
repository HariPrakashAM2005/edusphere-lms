'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NotificationCenter from '../components/NotificationCenter';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Toaster position="top-right" reverseOrder={false} />
        
        {isLoginPage ? (
          /* Login Page: Plain render */
          <main className="min-h-screen flex items-center justify-center bg-premium-gradient">
            {children}
          </main>
        ) : (
          /* Admin Dashboard Layout */
          <div className="min-h-screen flex">
            {/* Collapsible Sidebar */}
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              mobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
            />

            {/* Content frame */}
            <div
              className="flex-1 flex flex-col min-h-screen transition-all duration-300"
              style={{ paddingLeft: sidebarCollapsed ? '80px' : '260px' }}
            >
              {/* Header */}
              <Header
                onMobileToggle={() => setMobileSidebarOpen(true)}
                onNotificationsToggle={() => setNotificationsOpen(true)}
                unreadCount={3}
              />

              {/* Page Contents */}
              <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto relative z-0">
                {children}
              </main>
            </div>

            {/* Real-time Alerts Drawer */}
            <NotificationCenter
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>
        )}

      </body>
    </html>
  );
}
// Add simple fallback type for mobileOpen on Sidebar props
interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}
