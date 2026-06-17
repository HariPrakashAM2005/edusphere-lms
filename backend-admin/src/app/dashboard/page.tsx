'use client';

import React from 'react';
import { Users, Calendar, Award, BookOpen, Clock, Activity } from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import ChartCard from '../../components/ChartCard';

const MOCK_ANALYTICS_DATA = [
  { day: 'Mon', logins: 420, attendance: 92 },
  { day: 'Tue', logins: 510, attendance: 94 },
  { day: 'Wed', logins: 480, attendance: 89 },
  { day: 'Thu', logins: 610, attendance: 91 },
  { day: 'Fri', logins: 590, attendance: 93 },
  { day: 'Sat', logins: 220, attendance: 82 },
  { day: 'Sun', logins: 180, attendance: 85 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
          System Overview
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time aggregates of institution actions and analytics
        </p>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={1480}
          icon={Users}
          gradient="blue"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Active Classes"
          value={36}
          icon={BookOpen}
          gradient="green"
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Avg. Attendance"
          value={84}
          suffix="%"
          icon={Clock}
          gradient="green"
          trend={{ value: 0.8, isPositive: true }}
        />
        <StatsCard
          title="Assessments Graded"
          value={92}
          icon={Award}
          gradient="orange"
          trend={{ value: 14, isPositive: true }}
        />
      </section>

      {/* Analytics Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="System Access Activity"
          subtitle="Daily user logins captured across the network"
          data={MOCK_ANALYTICS_DATA}
          dataKey="logins"
          xAxisKey="day"
          color="#3b82f6"
        />

        <ChartCard
          title="Attendance Stability"
          subtitle="Average check-in statistics logged by QR sessions"
          data={MOCK_ANALYTICS_DATA}
          dataKey="attendance"
          xAxisKey="day"
          color="#14b8a6"
        />
      </section>

      {/* System Status logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-5 text-slate-800 dark:text-white">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-black tracking-tight">System Status Feed</h3>
        </div>
        
        <div className="space-y-4">
          {[
            { log: 'Database check completed: 0 replication lag, healthy query latency.', time: '10m ago', status: 'normal' },
            { log: 'WebSocket service connected: 182 active client channels listening.', time: '18m ago', status: 'normal' },
            { log: 'Backup dispatch: certificate PDF hashes mirrored on the blockchain.', time: '42m ago', status: 'success' },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs font-semibold py-2.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-350">{item.log}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
