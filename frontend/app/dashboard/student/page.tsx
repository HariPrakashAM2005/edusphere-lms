'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import StatsCard from '../../../components/dashboard/StatsCard';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ProgressChart from '../../../components/dashboard/ProgressChart';
import UpcomingDeadlines from '../../../components/dashboard/UpcomingDeadlines';
import WelcomeBanner from '../../../components/dashboard/WelcomeBanner';
import ActivityFeed from '../../../components/dashboard/ActivityFeed';
import {
  useStats,
  useProgress,
  useUpcoming,
  useBadges,
  useClaimStreak
} from '../../../hooks/useDashboard';
import {
  BookOpen,
  Trophy,
  Award,
  Clock,
  Sparkles,
  Footprints,
  Plane,
  Shield,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: progress, isLoading: progressLoading } = useProgress();
  const { data: deadlines, isLoading: deadlinesLoading } = useUpcoming();
  const { data: badges, isLoading: badgesLoading } = useBadges();

  const claimStreakMutation = useClaimStreak();

  const handleClaimStreak = () => {
    claimStreakMutation.mutate();
  };

  // Badge icon selector
  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints': return <Footprints className="h-5 w-5 text-indigo-500 animate-float" />;
      case 'Plane': return <Plane className="h-5 w-5 text-sky-500 animate-float" />;
      case 'Shield': return <Shield className="h-5 w-5 text-emerald-500 animate-float" />;
      default: return <Award className="h-5 w-5 text-amber-500 animate-float" />;
    }
  };

  const isGlobalLoading = statsLoading || progressLoading || deadlinesLoading || badgesLoading;

  if (isGlobalLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Banner Skeleton */}
          <div className="h-40 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-150 dark:border-gray-800 rounded-3xl animate-pulse" />
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-150 dark:border-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>

          {/* Body Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[400px] bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-150 dark:border-gray-800 rounded-3xl animate-pulse" />
            <div className="h-[400px] bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-150 dark:border-gray-800 rounded-3xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-up">
        
        {/* Welcome Banner Card */}
        <WelcomeBanner
          userName={user ? user.firstName : 'Scholar'}
          streakCount={stats?.streakCount || 0}
          onClaimStreak={handleClaimStreak}
          isPending={claimStreakMutation.isPending}
        />

        {/* Analytics Statistics Panel */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Courses Enrolled"
            value={stats?.enrolledCourses || 0}
            icon={BookOpen}
            gradient="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Completion Rate"
            value={stats?.completionRate || 0}
            suffix="%"
            icon={Award}
            gradient="green"
            trend={{ value: 4.8, isPositive: true }}
          />
          <StatsCard
            title="Attendance Rate"
            value={stats?.attendanceRate || 0}
            suffix="%"
            icon={Clock}
            gradient="teal"
            trend={{ value: 1.5, isPositive: false }}
          />
          <StatsCard
            title="Total XP Points"
            value={stats?.totalXp || 0}
            icon={Trophy}
            gradient="orange"
            trend={{ value: 24, isPositive: true }}
          />
        </section>

        {/* Learning progress visual logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">XP Gain Analytics</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-450">Your total learning XP curve over the last 30 days</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-550 dark:text-gray-400 border border-gray-150 dark:border-gray-700">
                  Last 30 Days
                </span>
              </div>
              <ProgressChart data={progress || []} />
            </Card>

            {/* Quick Actions Shortcuts */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/dashboard/student/courses')}
                className="flex-1 flex justify-between items-center px-6 py-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/5 rounded-2xl transition duration-300 group"
              >
                <div className="text-left">
                  <h4 className="font-extrabold text-sm text-gray-850 dark:text-gray-200">Continue Learning</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-450 mt-1">Resume where you left off</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4.5 w-4.5" />
                </div>
              </button>

              <button 
                onClick={() => router.push('/student/assessments')}
                className="flex-1 flex justify-between items-center px-6 py-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md hover:shadow-teal-500/5 rounded-2xl transition duration-300 group"
              >
                <div className="text-left">
                  <h4 className="font-extrabold text-sm text-gray-855 dark:text-gray-200">Exams & Certs</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-450 mt-1">Check your verified credentials</p>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4.5 w-4.5" />
                </div>
              </button>
            </div>

            {/* Audit log ActivityFeed */}
            <ActivityFeed />
          </div>

          {/* Right sidebar info columns */}
          <div className="space-y-8">
            
            {/* Upcoming Deadlines */}
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight mb-4">Upcoming Deadlines</h3>
              <UpcomingDeadlines deadlines={deadlines || []} />
            </Card>

            {/* Recent Badges / Achievements */}
            <Card className="p-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight mb-4">Recent Achievements</h3>
              <div className="space-y-4.5">
                {badges?.slice(0, 4).map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 relative overflow-hidden transition-transform duration-300 hover:scale-110 ${
                      badge.unlockedAt 
                        ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30' 
                        : 'bg-gray-100 dark:bg-gray-800 opacity-40'
                    }`}>
                      {renderBadgeIcon(badge.icon)}
                      {badge.unlockedAt && (
                        <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold text-gray-800 dark:text-gray-250 truncate ${!badge.unlockedAt && 'opacity-40'}`}>
                        {badge.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-450 truncate mt-0.5 leading-normal">
                        {badge.description}
                      </p>
                    </div>
                    {badge.unlockedAt && (
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-100 dark:border-emerald-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 animate-pulse">
                        Unlocked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
