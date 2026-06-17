'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  Plus, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const stats = [
    { name: 'My Courses', value: '7', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Active Students', value: '142', icon: Users, color: 'text-teal-500 bg-teal-500/10' },
    { name: 'Today\'s Attendance', value: '92%', icon: Calendar, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Assessments Pending', value: '3', icon: Award, color: 'text-purple-500 bg-purple-500/10' },
  ];

  const quickActions = [
    { name: 'Create Course', desc: 'Design new modules and lessons', icon: BookOpen, href: '/faculty/courses/create', btnText: 'Create', color: 'blue' },
    { name: 'Project QR', desc: 'Launch attendance QR code scanner', icon: Calendar, href: '/faculty/attendance/qr', btnText: 'Launch', color: 'teal' },
    { name: 'Create Assessment', desc: 'Author quizzes and exam papers', icon: Award, href: '/faculty/assessments', btnText: 'Design', color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white p-8 sm:p-10 shadow-xl border border-indigo-950">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-blue-200">
            <Sparkles className="h-3 w-3 text-amber-400" /> Faculty Workspace Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Welcome Back, Dr. {user?.firstName || 'Faculty'}!
          </h1>
          <p className="text-sm text-indigo-200 leading-relaxed max-w-lg">
            Manage your courses, track student attendance, and generate secure academic records through the EduSphere academic portal.
          </p>
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6 border border-gray-200/50 dark:border-gray-850/60 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{stat.name}</span>
                  <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{stat.value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.color} transition duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Quick Actions & Recent Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black tracking-tight">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.name} className="p-5 border border-gray-200/50 dark:border-gray-850/60 flex flex-col justify-between h-48 hover:shadow-md transition">
                  <div className="space-y-3">
                    <div className="p-2.5 w-max rounded-xl bg-gray-50 dark:bg-gray-850 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight">{action.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{action.desc}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-3 text-[10px] font-extrabold uppercase tracking-wider"
                    onClick={() => router.push(action.href)}
                  >
                    {action.btnText} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Analytics Summary */}
        <section className="lg:col-span-5 space-y-6">
          <h2 className="text-lg font-black tracking-tight">System Logs</h2>
          <Card className="p-6 border border-gray-200/50 dark:border-gray-850/60 space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="font-extrabold text-gray-400 uppercase tracking-wider">Activity</span>
              <span className="font-extrabold text-gray-400 uppercase tracking-wider">Status</span>
            </div>
            
            <div className="space-y-3.5">
              {[
                { label: 'Weekly attendance report synced', time: '10 mins ago', type: 'system' },
                { label: 'Cryptanalysis assessment generated', time: '1 hour ago', type: 'exam' },
                { label: 'Course "Quantum Mechanics II" updated', time: '4 hours ago', type: 'course' },
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{log.label}</p>
                    <span className="text-[9px] text-gray-400">{log.time}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    {log.type}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
