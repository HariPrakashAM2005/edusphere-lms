'use client';

import React, { useState } from 'react';
import { useLeaderboard } from '../../../../hooks/useGamification';
import LeaderboardTable from '../../../../components/gamification/LeaderboardTable';
import { Trophy, RefreshCw, Sparkles, User, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'all_time'>('weekly');
  const { data, isLoading, refetch, isRefetching } = useLeaderboard(period);

  const topUsers = data?.topUsers || [];
  const podiumUsers = topUsers.slice(0, 3);
  const tableUsers = topUsers; // Table displays everyone including the top 3

  // Extract podium placements safely
  const gold = podiumUsers.find(u => u.rank === 1);
  const silver = podiumUsers.find(u => u.rank === 2);
  const bronze = podiumUsers.find(u => u.rank === 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Title / Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500/10" />
              <span>Peer Leaderboard</span>
            </h1>
            <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
              Compete with classmates, rank up, and establish your legacy.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Period selector */}
            <div className="bg-gray-100 dark:bg-gray-805 p-1 rounded-xl flex space-x-1 border border-gray-200/50 dark:border-gray-800">
              {(['daily', 'weekly', 'all_time'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3.5 py-1.5 text-xxs font-black uppercase rounded-lg transition ${
                    period === p
                      ? 'bg-white dark:bg-gray-900 text-blue-650 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-800 dark:text-gray-405 transition hover:shadow-xs disabled:opacity-40"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* 3D Podium Graphic for Top 3 */}
            {podiumUsers.length > 0 && (
              <div className="bg-gradient-to-b from-blue-50/30 via-white to-white dark:from-blue-950/5 dark:via-gray-900 dark:to-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center">
                
                <div className="flex items-end justify-center space-x-4 md:space-x-8 w-full max-w-xl h-60 mt-4">
                  
                  {/* 2nd Place (Silver) */}
                  {silver && (
                    <div className="flex flex-col items-center flex-1 max-w-[140px] animate-scale-up" style={{ animationDelay: '0.1s' }}>
                      <div className="relative mb-3 text-center">
                        <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 flex items-center justify-center shadow">
                          <User className="h-6 w-6 text-slate-500" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-350 text-white font-extrabold text-xs shadow border-2 border-white dark:border-gray-900">
                          2
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white text-center truncate w-full">
                        {silver.firstName}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-450 text-center font-bold">
                        {silver.score.toLocaleString()} XP
                      </div>
                      {/* Pedestal */}
                      <div className="w-full h-24 mt-3 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 rounded-t-xl flex items-center justify-center shadow-inner border-t border-slate-100 dark:border-slate-700">
                        <span className="text-4xl font-black text-slate-400/30">🥈</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place (Gold) */}
                  {gold && (
                    <div className="flex flex-col items-center flex-1 max-w-[160px] animate-scale-up z-10">
                      <div className="relative mb-3 text-center">
                        <Sparkles className="absolute -top-6 left-1/2 -translate-x-1/2 h-5 w-5 text-yellow-500 animate-bounce" />
                        <div className="h-18 w-18 rounded-full bg-yellow-50 dark:bg-yellow-950/20 border-4 border-yellow-400 flex items-center justify-center shadow-lg transform scale-110">
                          <User className="h-8 w-8 text-yellow-650" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white font-extrabold text-xs shadow border-2 border-white dark:border-gray-900">
                          1
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-gray-900 dark:text-white text-center truncate w-full">
                        {gold.firstName} {gold.lastName}
                      </div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-450 text-center font-black">
                        {gold.score.toLocaleString()} XP
                      </div>
                      {/* Pedestal */}
                      <div className="w-full h-32 mt-3 bg-gradient-to-b from-yellow-300 to-yellow-500 dark:from-yellow-605/50 dark:to-yellow-805/40 rounded-t-2xl flex items-center justify-center shadow-lg border-t border-yellow-200 dark:border-yellow-500/20">
                        <span className="text-5xl font-black text-yellow-500/30">🥇</span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place (Bronze) */}
                  {bronze && (
                    <div className="flex flex-col items-center flex-1 max-w-[140px] animate-scale-up" style={{ animationDelay: '0.2s' }}>
                      <div className="relative mb-3 text-center">
                        <div className="h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-950/10 border-2 border-amber-500/60 flex items-center justify-center shadow">
                          <User className="h-6 w-6 text-amber-700 dark:text-amber-500" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white font-extrabold text-xs shadow border-2 border-white dark:border-gray-900">
                          3
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white text-center truncate w-full">
                        {bronze.firstName}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-450 text-center font-bold">
                        {bronze.score.toLocaleString()} XP
                      </div>
                      {/* Pedestal */}
                      <div className="w-full h-18 mt-3 bg-gradient-to-b from-amber-200/80 to-amber-300 dark:from-amber-850 dark:to-amber-950 rounded-t-xl flex items-center justify-center shadow-inner border-t border-amber-100 dark:border-amber-900/10">
                        <span className="text-3xl font-black text-amber-600/30">🥉</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Leaderboard Table Component */}
            <LeaderboardTable users={tableUsers} />
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
