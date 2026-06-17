'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  hoverLift?: boolean;
  glass?: boolean;
  children: React.ReactNode;
}

export default function Card({
  hoverLift = true,
  glass = true,
  className = '',
  children,
  ...props
}: CardProps) {
  const cardClasses = glass 
    ? 'glass-card rounded-2xl relative overflow-hidden group' 
    : 'bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 rounded-2xl shadow-sm relative overflow-hidden group';

  const hoverAnimation = hoverLift 
    ? { y: -4, boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.08)' } 
    : undefined;

  const transitionSettings = hoverLift 
    ? ({ type: 'spring', stiffness: 300, damping: 22 } as const)
    : undefined;

  return (
    <motion.div
      whileHover={hoverAnimation}
      transition={transitionSettings}
      className={`${cardClasses} ${className}`}
      {...props}
    >
      {/* Dynamic Shine Effect on Load */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10"
      />

      {/* Hover Gradient Border Glow */}
      <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/20 rounded-2xl pointer-events-none transition-colors duration-300 z-20" />

      <div className="relative z-0 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
