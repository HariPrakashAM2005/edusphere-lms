'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';

interface FacultyLayoutProps {
  children: React.ReactNode;
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'FACULTY' && user.role !== 'INSTITUTION_ADMIN') {
        router.push('/dashboard/student');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user || (user.role !== 'FACULTY' && user.role !== 'INSTITUTION_ADMIN')) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
