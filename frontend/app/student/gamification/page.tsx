'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useXP, useAchievements, useCheckBadges } from '../../../hooks/useGamification';
import LevelProgress from '../../../components/gamification/LevelProgress';
import StreakCounter from '../../../components/gamification/StreakCounter';
import XPNotification from '../../../components/gamification/XPNotification';
import { Trophy, Award, ShoppingBag, ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';

export default function GamificationDashboard() {
  const router = useRouter();
  const { data: xpStats, isLoading: xpLoading } = useXP();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const checkBadges = useCheckBadges();

  useEffect(() => {
    // Run badge check in background on dashboard load
    checkBadges.mutate();
  }, []);

  if (xpLoading || achievementsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  const dailyQuests = achievements?.dailyQuests || [];
  const streak = achievements?.streak || { login: 0, longestLogin: 0, assignment: 0, attendance: 0 };
  const badgesEarned = achievements?.badgesEarned || 0;
  const totalBadges = achievements?.totalBadges || 0;
  const badgeCompletionPercentage = achievements?.badgeCompletionPercentage || 0;

  return (
    <DashboardLayout>
      <XPNotification />

      <div className="space-y-6">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Gamification Hub
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400 mt-1">
              Earn XP, complete quests, unlock badges, and redeem rewards.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/student/gamification/leaderboard')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-extrabold rounded-xl transition"
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => router.push('/student/gamification/rewards')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-500/10 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Reward Store</span>
            </button>
          </div>
        </div>

        {/* Level & Streaks */}
        {xpStats && (
          <LevelProgress
            level={xpStats.level}
            currentXP={xpStats.currentXP}
            xpNeededForNextLevel={xpStats.xpNeededForNextLevel}
            progressPercentage={xpStats.progressPercentage}
          />
        )}

        <StreakCounter
          loginStreak={streak.login}
          longestLoginStreak={streak.longestLogin}
          assignmentStreak={streak.assignment}
          attendanceStreak={streak.attendance}
        />

        {/* Content Split: Quests & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Quests List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Daily Quests</span>
            </h3>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-850">
              {dailyQuests.length > 0 ? (
                dailyQuests.map((quest) => (
                  <div key={quest.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-start space-x-3.5 pr-4">
                      {quest.completed ? (
                        <CheckCircle2 className="h-5.5 w-5.5 text-emerald-500 fill-emerald-500/10 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5.5 w-5.5 text-gray-300 dark:text-gray-700 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className={`text-sm font-bold ${quest.completed ? 'text-gray-450 line-through dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {quest.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {quest.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-lg ${
                        quest.completed 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' 
                          : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        +{quest.xpReward} XP
                      </span>
                      <div className="text-[10px] font-bold text-gray-450 mt-1">
                        Progress: {quest.progress}/{quest.targetCount}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">
                  No quests loaded. Check back tomorrow!
                </div>
              )}
            </div>
          </div>

          {/* Side: Badges Progress & Recent Gains */}
          <div className="space-y-6">
            
            {/* Badges Progress Summary */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Award className="h-4.5 w-4.5 text-blue-500" />
                  <span>Badges Earned</span>
                </h3>
                <button
                  onClick={() => router.push('/student/gamification/badges')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-0.5"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-extrabold text-lg border border-blue-100 dark:border-blue-900/30">
                  {badgesEarned}
                  <span className="text-[9px] font-medium absolute -bottom-1 bg-blue-600 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {badgeCompletionPercentage}%
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Unlocked {badgesEarned} of {totalBadges} Badges
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Complete learning actions to unlock rare badges and special rewards.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent XP History */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Clock className="h-4.5 w-4.5 text-gray-500" />
                <span>Recent XP History</span>
              </h3>

              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {xpStats?.recentGains && xpStats.recentGains.length > 0 ? (
                  xpStats.recentGains.map((gain) => (
                    <div key={gain.id} className="flex justify-between items-center text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-gray-850 dark:text-gray-300 truncate">
                          {gain.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(gain.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span className={`font-black shrink-0 ${gain.xpAmount >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-red-500'}`}>
                        {gain.xpAmount >= 0 ? `+${gain.xpAmount}` : gain.xpAmount} XP
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-gray-500 py-4">
                    No XP history logged.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
