'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, Shield, Award, ArrowRight, Zap, GraduationCap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to appropriate dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'STUDENT') {
        router.push('/dashboard/student');
      } else {
        router.push('/faculty/attendance/reports');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Dynamic light sources */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Floating abstract bubbles */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-20 left-[10%] w-24 h-24 bg-gradient-to-tr from-blue-400 to-indigo-500 opacity-20 rounded-full blur-lg pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="absolute bottom-20 right-[15%] w-32 h-32 bg-gradient-to-tr from-purple-400 to-pink-500 opacity-20 rounded-full blur-lg pointer-events-none"
      />

      {/* Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">E</span>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-400">
            EduSphere
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <span className="text-sm font-bold text-gray-650 dark:text-gray-400 hover:text-blue-650 transition cursor-pointer">
              Sign In
            </span>
          </Link>
          <Link href="/register">
            <span className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 text-white text-xs font-black shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
              Get Started
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center justify-center text-center">
        
        {/* Banner Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xxs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400"
        >
          <Zap className="h-3.5 w-3.5 fill-blue-500/20" />
          <span>National Academic LMS platform</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-4xl leading-tight"
        >
          Learn Without Boundaries on{' '}
          <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-move">
            EduSphere
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed font-medium"
        >
          A next-generation, secure, and interactive Learning Management System. Streamline lectures, verify credentials on the blockchain, and complete daily quests for XP rewards.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/register">
            <span className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer">
              Register Free Account <ArrowRight className="h-4 w-4 ml-2" />
            </span>
          </Link>
          <Link href="/login">
            <span className="px-8 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-850 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-850 text-sm font-black rounded-2xl shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer">
              Student Login <ChevronRight className="h-4 w-4 ml-1" />
            </span>
          </Link>
        </motion.div>

        {/* Features Preview Grids */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl"
        >
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black">AI Proctoring</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Webcam snapshot monitoring and fullscreen escape logging ensures complete exam integrity.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black">Gamified XP Loops</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Earn XP bonuses for login streaks, lock badges, and trade points for actual vouchers.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black">Blockchain Verification</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Earn tamper-proof credentials directly synced and queryable on public blockchain ledger hashes.
            </p>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
