'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  attemptId: string;
  durationMinutes: number; // in minutes
  onExpire: () => void;
}

export default function Timer({ attemptId, durationMinutes, onExpire }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!attemptId || !durationMinutes) return;

    const storageKey = `exam_end_${attemptId}`;
    const storedEndTime = localStorage.getItem(storageKey);

    let endTime: number;

    if (storedEndTime) {
      endTime = parseInt(storedEndTime, 10);
    } else {
      endTime = Date.now() + durationMinutes * 60 * 1000;
      localStorage.setItem(storageKey, endTime.toString());
    }

    const updateTimer = () => {
      const distance = endTime - Date.now();
      if (distance <= 0) {
        setSecondsLeft(0);
        localStorage.removeItem(storageKey);
        onExpire();
        return false;
      }
      setSecondsLeft(Math.floor(distance / 1000));
      return true;
    };

    // Initialize
    const running = updateTimer();

    let intervalId: any;
    if (running) {
      intervalId = setInterval(updateTimer, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [attemptId, durationMinutes, onExpire]);

  if (secondsLeft === null) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = secondsLeft < 300; // < 5 minutes (300 seconds)

  return (
    <div className={`flex items-center gap-3.5 px-4 py-2 rounded-xl font-bold border transition ${
      isLowTime
        ? 'bg-red-50 dark:bg-red-950/20 border-red-250 dark:border-red-900/40 text-red-600 dark:text-red-400 animate-pulse'
        : 'bg-blue-50/50 dark:bg-blue-950/25 border-blue-250 dark:border-blue-900/30 text-blue-600 dark:text-blue-400'
    }`}>
      {isLowTime ? (
        <AlertTriangle className="h-4.5 w-4.5" />
      ) : (
        <Clock className="h-4.5 w-4.5" />
      )}
      
      <div className="text-xs md:text-sm">
        <span className="text-xxs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-450 mr-1.5">
          Time Remaining:
        </span>
        <span className="font-mono text-base font-extrabold">{formattedTime}</span>
      </div>
    </div>
  );
}
