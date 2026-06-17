'use client';

import React, { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  gradient?: 'blue' | 'green' | 'orange' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  suffix = '',
  icon: Icon,
  gradient = 'blue',
  trend,
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

  const gradients = {
    blue: 'from-blue-500 to-indigo-650 text-white shadow-blue-500/15',
    green: 'from-emerald-400 to-teal-500 text-white shadow-emerald-500/15',
    orange: 'from-orange-400 to-amber-500 text-white shadow-orange-500/15',
    purple: 'from-purple-500 to-fuchsia-600 text-white shadow-purple-500/15',
  };

  const borders = {
    blue: 'group-hover:border-blue-500/30',
    green: 'group-hover:border-emerald-500/30',
    orange: 'group-hover:border-orange-500/30',
    purple: 'group-hover:border-purple-500/30',
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 ${borders[gradient]}`}
    >
      {/* Glow highlight */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradients[gradient]} opacity-[0.04] rounded-full blur-xl translate-x-8 -translate-y-8 pointer-events-none`} />

      <div className="flex items-center">
        {/* Icon Frame */}
        <div className={`p-3.5 rounded-2xl mr-4 bg-gradient-to-br ${gradients[gradient]} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
            {title}
          </p>
          
          <div className="flex items-baseline space-x-2 mt-1">
            <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
              {displayValue}
              {suffix}
            </h3>
            
            {trend && (
              <span
                className={`inline-flex items-center text-[10px] font-black leading-none px-1.5 py-0.5 rounded ${
                  trend.isPositive
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>

    </motion.div>
  );
}
