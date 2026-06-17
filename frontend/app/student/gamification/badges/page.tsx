'use client';

import React, { useState } from 'react';
import { useBadges } from '../../../../hooks/useGamification';
import BadgeCard from '../../../../components/gamification/BadgeCard';
import { Award, Share2, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';

export default function BadgesCollectionPage() {
  const { data, isLoading } = useBadges();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const allBadges = data?.allBadges || [];
  const earnedBadges = data?.earnedBadges || [];
  const earnedBadgeIds = new Set(data?.earnedBadgeIds || []);

  const totalBadges = allBadges.length;
  const earnedCount = earnedBadgeIds.size;
  const percentComplete = totalBadges > 0 ? Math.floor((earnedCount / totalBadges) * 100) : 0;

  // Filter categories
  const categories = ['all', 'learning', 'attendance', 'quiz', 'streak', 'social', 'special'];

  const filteredBadges = allBadges.filter((b) => {
    if (filterCategory === 'all') return true;
    return b.category === filterCategory;
  });

  const handleShare = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/student/badges/share` : '';
    navigator.clipboard.writeText(`Check out my EduSphere achievements! I've unlocked ${earnedCount}/${totalBadges} badges! ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Title & Share */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
              <Award className="h-6 w-6 text-blue-500" />
              <span>Badges Collection</span>
            </h1>
            <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
              Unlock milestone achievements and build your academic profile.
            </p>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-500/10 transition"
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? 'Copied Link!' : 'Share Collection'}</span>
          </button>
        </div>

        {/* Progress Card Summary */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-3xl">
              🎖️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Unlocked {earnedCount} of {totalBadges} Badges
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Complete modules, maintain attendance, and perform well on exams to collect more!
              </p>
            </div>
          </div>
          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
              <span>Collection Progress</span>
              <span>{percentComplete}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-550 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {/* Categories / Filter Controls */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="h-4.5 w-4.5 text-gray-450 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.8 text-xxs font-black uppercase rounded-lg transition shrink-0 ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                  : 'bg-white dark:bg-gray-900 text-gray-650 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-850 border border-gray-200 dark:border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => {
              const userBadge = earnedBadges.find((eb) => eb.id === badge.id);
              return (
                <BadgeCard
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  category={badge.category}
                  icon={badge.icon}
                  earnedAt={userBadge?.earnedAt}
                  countRequired={badge.countRequired}
                />
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
