'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'solid' | 'outline' | 'glass' | 'gradient' | 'glow';
  colorScheme?: 'blue' | 'green' | 'orange' | 'purple' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'solid',
  colorScheme = 'blue',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3.5 py-2 text-xs font-bold rounded-lg',
    md: 'px-5 py-3 text-sm font-bold rounded-xl',
    lg: 'px-7 py-4 text-base font-extrabold rounded-2xl',
  };

  const colors = {
    blue: {
      primary: '#3b82f6',
      solid: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-blue-500 shadow-blue-500/10 text-white',
      outline: 'border-blue-200 dark:border-blue-900 text-blue-650 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 focus:ring-blue-500',
      glass: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600 hover:shadow-blue-500/20 text-white',
      glow: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50',
    },
    green: {
      primary: '#22c55e',
      solid: 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 focus:ring-emerald-500 shadow-emerald-500/10 text-white',
      outline: 'border-emerald-200 dark:border-emerald-900 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 focus:ring-emerald-500',
      glass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-emerald-500/20 text-white',
      glow: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50',
    },
    orange: {
      primary: '#f59e0b',
      solid: 'from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 focus:ring-orange-500 shadow-orange-500/10 text-white',
      outline: 'border-orange-200 dark:border-orange-900 text-orange-655 dark:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 focus:ring-orange-500',
      glass: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-450 hover:bg-orange-500/20',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500 hover:shadow-orange-500/20 text-white',
      glow: 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50',
    },
    purple: {
      primary: '#8b5cf6',
      solid: 'from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 focus:ring-purple-500 shadow-purple-500/10 text-white',
      outline: 'border-purple-200 dark:border-purple-900 text-purple-650 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 focus:ring-purple-500',
      glass: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20',
      gradient: 'from-purple-600 via-fuchsia-600 to-pink-600 hover:shadow-purple-500/20 text-white',
      glow: 'bg-purple-650 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50',
    },
    teal: {
      primary: '#14b8a6',
      solid: 'from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 focus:ring-teal-500 shadow-teal-500/10 text-white',
      outline: 'border-teal-200 dark:border-teal-900 text-teal-650 dark:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 focus:ring-teal-500',
      glass: 'bg-teal-500/10 border-teal-500/20 text-teal-650 dark:text-teal-400 hover:bg-teal-500/20',
      gradient: 'from-teal-500 via-cyan-500 to-blue-500 hover:shadow-teal-500/20 text-white',
      glow: 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50',
    },
  };

  let baseClass = 'inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 disabled:opacity-50 disabled:pointer-events-none ';

  if (variant === 'solid') {
    baseClass += `bg-gradient-to-r ${colors[colorScheme].solid} shadow-md hover:shadow-lg`;
  } else if (variant === 'outline') {
    baseClass += `border ${colors[colorScheme].outline}`;
  } else if (variant === 'glass') {
    baseClass += `border backdrop-blur-sm ${colors[colorScheme].glass}`;
  } else if (variant === 'gradient') {
    baseClass += `bg-gradient-to-r bg-size-200 animate-gradient-move ${colors[colorScheme].gradient} shadow-md`;
  } else if (variant === 'glow') {
    baseClass += `${colors[colorScheme].glow}`;
  }

  // Animation variants
  const buttonAnimations = {
    hover: {
      scale: 1.015,
      y: -1,
      transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
    },
    tap: { scale: 0.985 },
  };

  return (
    <motion.button
      whileHover={buttonAnimations.hover}
      whileTap={buttonAnimations.tap}
      className={`${baseClass} ${sizeClasses[size]} ${className} group`}
      {...props}
    >
      {/* Target children icons and apply rotation on group hover */}
      <span className="flex items-center justify-center">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && typeof child.type === 'function' && (child.type as any).name === 'Icon') {
            return (
              <span className="inline-block transition-transform duration-300 group-hover:rotate-12">
                {child}
              </span>
            );
          }
          return child;
        })}
      </span>
    </motion.button>
  );
}
