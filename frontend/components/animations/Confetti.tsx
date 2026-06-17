'use client';

import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  active: boolean;
  duration?: number; // duration in ms
  onComplete?: () => void;
}

export default function Confetti({ active, duration = 5000, onComplete }: ConfettiProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (active) {
      setRun(true);
      const timer = setTimeout(() => {
        setRun(false);
        if (onComplete) onComplete();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setRun(false);
    }
  }, [active, duration, onComplete]);

  if (!run) return null;

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={true}
      numberOfPieces={200}
      style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none', top: 0, left: 0 }}
    />
  );
}
