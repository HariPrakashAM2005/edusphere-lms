import React, { useEffect, useState } from 'react';
import { Award, Shield, Sparkles } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  currentXP: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
}

export default function LevelProgress({
  level,
  currentXP,
  xpNeededForNextLevel,
  progressPercentage,
}: LevelProgressProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger progress animation on load
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Determine level tier styling
  const getTierDetails = (lvl: number) => {
    if (lvl < 5) {
      return {
        name: 'Bronze Scholar',
        bgColor: 'from-amber-700 to-amber-900',
        borderColor: 'border-amber-600',
        textColor: 'text-amber-300',
        glowColor: 'shadow-amber-500/10',
      };
    } else if (lvl < 15) {
      return {
        name: 'Silver Explorer',
        bgColor: 'from-slate-400 to-slate-650',
        borderColor: 'border-slate-350',
        textColor: 'text-slate-200',
        glowColor: 'shadow-slate-400/10',
      };
    } else if (lvl < 30) {
      return {
        name: 'Gold Sage',
        bgColor: 'from-yellow-500 to-amber-600',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-250',
        glowColor: 'shadow-yellow-500/20',
      };
    } else if (lvl < 50) {
      return {
        name: 'Platinum Elite',
        bgColor: 'from-teal-400 to-emerald-600',
        borderColor: 'border-teal-350',
        textColor: 'text-teal-200',
        glowColor: 'shadow-teal-400/20',
      };
    } else {
      return {
        name: 'Diamond Champion',
        bgColor: 'from-indigo-500 via-purple-500 to-pink-500',
        borderColor: 'border-purple-300',
        textColor: 'text-indigo-100',
        glowColor: 'shadow-purple-500/35',
      };
    }
  };

  const tier = getTierDetails(level);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md transition duration-300 hover:shadow-lg`}>
      
      {/* Tier background glow */}
      <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${tier.bgColor} opacity-10 blur-3xl`} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6">
        
        {/* Level Emblem Shield */}
        <div className="flex items-center space-x-4">
          <div className={`relative flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tier.bgColor} shadow-lg ${tier.glowColor} border ${tier.borderColor} transition-all duration-500 hover:scale-105`}>
            <Shield className="absolute h-10 w-10 text-white/10" />
            <Award className="h-8 w-8 text-white animate-pulse" />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-white dark:bg-gray-950 text-xs font-black shadow border border-gray-150 dark:border-gray-800">
              {level}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Level {level}
              </span>
              <Sparkles className="h-3 w-3 text-yellow-500" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              {tier.name}
            </h3>
            <p className="text-xs text-gray-505 dark:text-gray-400">
              {currentXP} / {xpNeededForNextLevel} XP ({progressPercentage}% Complete)
            </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="flex-1 w-full">
          <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            <span>Next Level</span>
            <span>{xpNeededForNextLevel - currentXP} XP Remaining</span>
          </div>
          <div className="relative h-4 w-full rounded-full bg-gray-105 dark:bg-gray-850 overflow-hidden border border-gray-100 dark:border-gray-800">
            <div
              className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${tier.bgColor} transition-all duration-1000 ease-out`}
              style={{ width: `${animate ? progressPercentage : 0}%` }}
            />
            {/* Shimmer effect */}
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
