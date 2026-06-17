'use client';

import React from 'react';
import Card from '../../../components/ui/Card';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Award, 
  Activity, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function FacultyAnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor grade distributions, weekly classroom attendance patterns, and predictive student risk alerts.
        </p>
      </header>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 bg-white dark:bg-gray-900 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Class GPA Average</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">3.42 / 4.0</h3>
            <p className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" /> +0.12 this month
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500">
            <Award className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 bg-white dark:bg-gray-900 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Attendance Index</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">94.8%</h3>
            <p className="text-[9px] text-gray-450 font-extrabold flex items-center gap-0.5 mt-1">
              <Calendar className="h-3 w-3 text-teal-500" /> Stable rate
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-500">
            <CheckCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 bg-white dark:bg-gray-900 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Predicted Risk Alerts</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">2 Students</h3>
            <p className="text-[9px] text-rose-500 font-extrabold flex items-center gap-0.5 mt-1">
              <AlertTriangle className="h-3 w-3" /> Needs intervention
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </Card>
      </section>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Attendance Trends */}
        <section className="lg:col-span-7 space-y-6">
          <h2 className="text-lg font-black tracking-tight">Weekly Attendance Metrics</h2>
          <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 bg-white dark:bg-gray-900 space-y-6">
            <div className="flex justify-between items-center text-xxs font-extrabold uppercase tracking-widest text-gray-400">
              <span>Weekdays</span>
              <span>Presence Rate</span>
            </div>

            {/* Attendance chart columns */}
            <div className="flex justify-between items-end h-48 pt-4 select-none">
              {[
                { day: 'Mon', rate: 96 },
                { day: 'Tue', rate: 98 },
                { day: 'Wed', rate: 92 },
                { day: 'Thu', rate: 95 },
                { day: 'Fri', rate: 88 },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-8 bg-gray-100 dark:bg-gray-800 rounded-lg h-36 flex flex-col justify-end overflow-hidden">
                    <div 
                      className="bg-gradient-to-t from-teal-500 to-teal-400 rounded-lg transition-all duration-500" 
                      style={{ height: `${item.rate}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-450 uppercase tracking-wider">{item.day}</span>
                  <span className="text-[9px] font-black text-gray-700 dark:text-gray-300">{item.rate}%</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Grade Distribution */}
        <section className="lg:col-span-5 space-y-6">
          <h2 className="text-lg font-black tracking-tight">Grade Distribution Summary</h2>
          <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 bg-white dark:bg-gray-900 space-y-5">
            <div className="space-y-3">
              {[
                { grade: 'A (Excellent)', pct: 35, color: 'bg-blue-500' },
                { grade: 'B (Good)', pct: 40, color: 'bg-teal-500' },
                { grade: 'C (Average)', pct: 15, color: 'bg-amber-500' },
                { grade: 'D/F (Below Average)', pct: 10, color: 'bg-rose-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5 text-[10px] font-bold text-gray-500">
                  <div className="flex justify-between items-center">
                    <span>{item.grade}</span>
                    <span className="text-gray-900 dark:text-white font-black">{item.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
