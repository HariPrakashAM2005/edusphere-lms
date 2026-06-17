import React, { useState, useEffect } from 'react';
import { Award, Sparkles, X, ShieldAlert } from 'lucide-react';

export interface XPEarnedEventDetail {
  amount: number;
  action: string;
  levelUp?: boolean;
  newLevel?: number;
}

export default function XPNotification() {
  const [toast, setToast] = useState<{ amount: number; action: string } | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);

  useEffect(() => {
    const handleXPEarned = (event: Event) => {
      const customEvent = event as CustomEvent<XPEarnedEventDetail>;
      const { amount, action, levelUp, newLevel } = customEvent.detail;

      // Show toast if positive XP awarded
      if (amount > 0) {
        setToast({ amount, action });
      }

      // Show level up screen if level increased
      if (levelUp && newLevel) {
        setLevelUpModal(newLevel);
      }
    };

    window.addEventListener('xp-earned', handleXPEarned);
    return () => {
      window.removeEventListener('xp-earned', handleXPEarned);
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const formatActionName = (act: string) => {
    return act
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <>
      {/* 1. XP Toast Popup */}
      {toast && (
        <div className="fixed top-20 right-6 z-55 animate-slide-in pointer-events-auto">
          <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-emerald-250 dark:border-emerald-900/40 p-4 rounded-xl shadow-lg max-w-sm">
            <div className="h-10 w-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/10 shrink-0">
              +{toast.amount}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                XP Points Earned!
              </div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate mt-0.5">
                {formatActionName(toast.action)}
              </div>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Level Up Modal Celebration overlay */}
      {levelUpModal !== null && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
          
          {/* Confetti particles (Vanilla CSS implementation) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][
                    Math.floor(Math.random() * 6)
                  ],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Modal Box */}
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center transform scale-95 animate-scale-up">
            
            {/* Celebration Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-550 text-white shadow-xl animate-pulse">
              <Sparkles className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-6">
              Level Up! 🎉
            </h2>
            <p className="text-sm text-gray-550 dark:text-gray-405 mt-2">
              Outstanding work! You have progressed to a new rank.
            </p>

            {/* Level badge */}
            <div className="my-6 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-650 text-white font-extrabold text-2xl border border-blue-400 shadow-md">
              {levelUpModal}
            </div>

            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 rounded-full w-max mx-auto">
              Unlocked Level {levelUpModal} Rewards
            </p>

            <button
              onClick={() => setLevelUpModal(null)}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/15 transition"
            >
              Continue Journey
            </button>
          </div>
        </div>
      )}
    </>
  );
}
