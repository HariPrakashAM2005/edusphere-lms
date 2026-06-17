'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, suffix, className = '', id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const isFilled = props.value !== undefined && props.value !== '';

    return (
      <div className="relative w-full">
        <div
          className={`relative flex items-center bg-gray-50/50 dark:bg-gray-900/40 border rounded-2xl transition-all duration-300 ${
            error
              ? 'border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/25'
              : focused
              ? 'border-blue-500 shadow-md shadow-blue-500/10 focus-within:ring-2 focus-within:ring-blue-500/20'
              : 'border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          {/* Prefix Icon */}
          {Icon && (
            <div className="pl-4 text-gray-400 dark:text-gray-500 flex-shrink-0">
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}

          {/* Input Area */}
          <div className="relative flex-1">
            <input
              id={inputId}
              ref={ref}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`w-full px-4 pt-5.5 pb-2 text-xs font-semibold bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-transparent transition-all ${
                Icon ? 'pl-2' : ''
              } ${className}`}
              placeholder={label}
              {...props}
            />

            {/* Floating Label */}
            <label
              htmlFor={inputId}
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold transition-all duration-200 pointer-events-none select-none text-[11px] uppercase tracking-wider ${
                focused || isFilled
                  ? 'top-2.5 text-[9px] -translate-y-0 text-blue-500 dark:text-blue-400'
                  : Icon
                  ? 'left-10'
                  : 'left-4'
              }`}
            >
              {label}
            </label>
          </div>

          {/* Suffix Component */}
          {suffix && <div className="pr-4 flex-shrink-0 flex items-center justify-center">{suffix}</div>}
        </div>

        {/* Error Message with Animation */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-1 mt-1 text-[10px] font-bold text-rose-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
