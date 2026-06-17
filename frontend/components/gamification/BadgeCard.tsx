import React from 'react';
import { Lock, CheckCircle, Calendar } from 'lucide-react';

interface BadgeCardProps {
  name: string;
  description: string;
  category: string;
  icon: string;
  earnedAt?: string;
  countRequired: number;
}

export default function BadgeCard({
  name,
  description,
  category,
  icon,
  earnedAt,
  countRequired,
}: BadgeCardProps) {
  const isEarned = !!earnedAt;

  // Select category colors
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'learning':
        return 'from-blue-500 to-indigo-600 border-blue-200 text-blue-600 bg-blue-50';
      case 'quiz':
        return 'from-red-500 to-rose-600 border-rose-200 text-rose-600 bg-rose-50';
      case 'attendance':
        return 'from-teal-400 to-emerald-600 border-teal-200 text-teal-650 bg-teal-50';
      case 'streak':
        return 'from-amber-450 to-orange-600 border-amber-200 text-orange-600 bg-orange-50';
      case 'social':
        return 'from-purple-500 to-fuchsia-600 border-purple-200 text-purple-650 bg-purple-50';
      default:
        return 'from-slate-500 to-slate-700 border-slate-200 text-slate-600 bg-slate-50';
    }
  };

  const catColors = getCategoryColor(category);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-350 ${
        isEarned
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1'
          : 'bg-gray-50/50 dark:bg-gray-950/20 border-dashed border-gray-200 dark:border-gray-800 opacity-60'
      }`}
    >
      {/* Background radial accent glow on hover */}
      {isEarned && (
        <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
      )}

      <div className="p-5 flex items-start space-x-4">
        {/* Badge Icon Slot */}
        <div
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm text-2xl transition duration-500 ${
            isEarned
              ? `bg-gradient-to-br ${catColors.split(' ')[0]} ${catColors.split(' ')[1]} text-white transform group-hover:rotate-12`
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
          }`}
        >
          {isEarned ? (
            <span>{icon}</span>
          ) : (
            <Lock className="h-6 w-6 text-gray-400 dark:text-gray-600" />
          )}

          {isEarned && (
            <div className="absolute -right-1.5 -top-1.5 bg-white dark:bg-gray-900 text-emerald-500 rounded-full p-0.5 border border-emerald-100 dark:border-emerald-950">
              <CheckCircle className="h-4.5 w-4.5 fill-current text-white dark:text-gray-900 stroke-emerald-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4
              className={`text-sm font-extrabold truncate ${
                isEarned ? 'text-gray-900 dark:text-white' : 'text-gray-505 dark:text-gray-400'
              }`}
            >
              {name}
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {category}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Footer Metadata */}
          {isEarned ? (
            <div className="flex items-center space-x-1 mt-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg w-max">
              <Calendar className="h-3 w-3" />
              <span>
                Earned {new Date(earnedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          ) : (
            <div className="text-[10px] font-bold text-gray-450 dark:text-gray-500 mt-3">
              Requires: Complete {countRequired} {category === 'learning' ? 'lessons' : category === 'quiz' ? 'quizzes' : 'records'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
