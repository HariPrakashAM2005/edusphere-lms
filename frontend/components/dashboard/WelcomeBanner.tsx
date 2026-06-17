'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface WelcomeBannerProps {
  userName: string;
  streakCount: number;
  onClaimStreak: () => void;
  isPending: boolean;
}

export default function WelcomeBanner({
  userName,
  streakCount,
  onClaimStreak,
  isPending,
}: WelcomeBannerProps) {
  const [typedText, setTypedText] = useState('');
  const fullGreeting = `Welcome back, ${userName}! Keep up the awesome momentum! 🚀`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullGreeting.slice(0, index + 1));
      index++;
      if (index >= fullGreeting.length) {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [userName]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 p-8 text-white shadow-xl shadow-blue-500/10 dark:shadow-none">
      
      {/* Decorative light bubbles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-12 -translate-y-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-12 translate-y-12 blur-3xl pointer-events-none" />

      {/* Floating particles inside banner */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, Math.random() * -30 - 10, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute h-1.5 w-1.5 bg-white rounded-full"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xxs font-extrabold uppercase tracking-wider w-max">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
            <span>EduSphere Scholar</span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug min-h-[36px]">
            {typedText}
          </h2>
          
          <p className="text-xs text-indigo-150 max-w-xl leading-relaxed">
            You are currently holding a <span className="font-extrabold text-white text-base bg-white/10 px-2 py-0.5 rounded-lg ml-1 mr-1">{streakCount || 1} day study streak</span>. Claim your daily rewards now!
          </p>
        </div>

        <Button
          onClick={onClaimStreak}
          disabled={isPending}
          variant="glow"
          colorScheme="orange"
          className="flex-shrink-0 !py-3.5 !px-6 bg-white !text-indigo-600 hover:!bg-indigo-50 font-black rounded-2xl shadow-lg transition duration-300"
        >
          <Flame className="h-5 w-5 mr-2 text-orange-500 fill-orange-500 animate-bounce" />
          {isPending ? 'Claiming...' : 'Claim Streak XP'}
        </Button>
      </div>

    </section>
  );
}
