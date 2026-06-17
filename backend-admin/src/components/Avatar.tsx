'use client';

import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  tooltipText?: string;
}

export default function Avatar({
  src,
  name,
  size = 'md',
  isOnline = false,
  tooltipText,
}: AvatarProps) {
  // Get initials from name
  const getInitials = (n: string) => {
    const parts = n.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-[10px] font-black',
    md: 'h-11 w-11 text-xs font-black',
    lg: 'h-16 w-16 text-sm font-black',
  };

  const statusIndicatorSizes = {
    sm: 'h-2 w-2 border-1.5',
    md: 'h-3 w-3 border-2',
    lg: 'h-4 w-4 border-2.5',
  };

  // Generate color mapping based on name length so it stays constant per user
  const gradients = [
    'from-blue-500 to-indigo-650 text-white',
    'from-emerald-400 to-teal-600 text-white',
    'from-orange-400 to-amber-500 text-white',
    'from-purple-500 to-fuchsia-600 text-white',
    'from-pink-500 to-rose-600 text-white',
  ];
  const gradientClass = gradients[name.length % gradients.length];

  return (
    <div className="relative group inline-block flex-shrink-0">
      
      {/* Avatar Container */}
      <div className={`rounded-full overflow-hidden flex items-center justify-center border border-white dark:border-gray-900 shadow-md ${sizeClasses[size]} ${gradientClass}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {/* Online Status Dot */}
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-emerald-500 border-white dark:border-gray-950 shadow-sm ${statusIndicatorSizes[size]}`}
          style={{ transform: 'translate(10%, 10%)' }}
        />
      )}

      {/* Hover Tooltip */}
      {tooltipText && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900/90 dark:bg-gray-800/90 text-[9px] font-black text-white uppercase tracking-wider rounded-lg shadow-md backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
          {tooltipText}
        </div>
      )}

    </div>
  );
}
