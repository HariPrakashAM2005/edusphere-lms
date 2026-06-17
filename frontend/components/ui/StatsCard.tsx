'use client';

import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Card from './Card';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  gradient?: 'blue' | 'green' | 'orange' | 'purple' | 'teal';
}

export default function StatsCard({
  title,
  value,
  suffix = '',
  icon: Icon,
  gradient = 'blue',
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(val) {
        setDisplayValue(Math.round(val));
      },
    });
    return () => controls.stop();
  }, [value]);

  const gradientClasses = {
    blue: 'from-blue-500 to-indigo-600 text-white shadow-blue-500/20',
    green: 'from-emerald-400 to-teal-600 text-white shadow-emerald-500/20',
    orange: 'from-orange-400 to-amber-500 text-white shadow-orange-500/20',
    purple: 'from-violet-500 to-fuchsia-600 text-white shadow-purple-500/20',
    teal: 'from-teal-400 to-cyan-600 text-white shadow-teal-500/20',
  };

  return (
    <Card hoverLift className="p-6 flex items-center relative overflow-hidden border border-gray-150/40 dark:border-gray-800/40">
      {/* Decorative gradient spot */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientClasses[gradient]} opacity-10 rounded-full blur-xl translate-x-8 -translate-y-8 pointer-events-none`} />

      {/* Icon Wrap with Gradient */}
      <div className={`p-3.5 rounded-2xl mr-4 bg-gradient-to-br ${gradientClasses[gradient]} shadow-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>

      <div>
        <p className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white tracking-tight">
          {displayValue}
          {suffix}
        </h3>
      </div>
    </Card>
  );
}
