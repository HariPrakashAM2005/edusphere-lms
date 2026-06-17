'use client';

import React, { useState } from 'react';
import { useRewards, useRedeemReward } from '../../../../hooks/useGamification';
import { ShoppingBag, Award, Tag, Sparkles, CheckCircle2, AlertCircle, History, Landmark } from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';

export default function RewardStorePage() {
  const { data, isLoading, refetch } = useRewards();
  const redeemRewardMutation = useRedeemReward();

  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');
  const [selectedReward, setSelectedReward] = useState<any | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rewards = data?.rewards || [];
  const redemptionHistory = data?.history || [];
  const xpBalance = data?.xpBalance || 0;

  const handleOpenRedeemModal = (reward: any) => {
    if (xpBalance < reward.xpCost) {
      setErrorMessage(`Insufficient XP! You need ${reward.xpCost - xpBalance} more XP to redeem this reward.`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    setSelectedReward(reward);
    setConfirmModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;

    try {
      const result = await redeemRewardMutation.mutateAsync(selectedReward.id);
      setSuccessMessage(`Successfully redeemed ${selectedReward.name}!`);
      setConfirmModal(false);
      setSelectedReward(null);
      refetch();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Redemption failed');
      setConfirmModal(false);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Helper to filter/color category tags
  const getCategoryTag = (cat: string) => {
    switch (cat) {
      case 'merchandise':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-405';
      case 'discount':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400';
      case 'certificate':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455';
      default:
        return 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-indigo-500" />
              <span>Reward Store</span>
            </h1>
            <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
              Redeem your accumulated XP points for exclusive perks and merchandise.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="bg-gray-100 dark:bg-gray-805 p-1 rounded-xl flex space-x-1 border border-gray-200/50 dark:border-gray-800 self-start">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-4 py-2 text-xxs font-black uppercase rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'store'
                  ? 'bg-white dark:bg-gray-900 text-blue-650 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Available Rewards</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xxs font-black uppercase rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-gray-900 text-blue-650 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>My Redemptions</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="flex items-center space-x-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center space-x-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 rounded-xl text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* XP Balance Credit Card */}
        <div className="bg-gradient-to-r from-blue-650 to-indigo-650 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
              💰
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-white/70">
                Spendable Balance
              </div>
              <h2 className="text-3xl font-black mt-1">
                {xpBalance.toLocaleString()} XP
              </h2>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold border border-white/10">
              <Landmark className="h-4 w-4" />
              <span>Earned through learning activities</span>
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : activeTab === 'store' ? (
          /* Available Rewards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">{reward.icon}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${getCategoryTag(reward.category)}`}>
                      {reward.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mt-4">
                    {reward.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {reward.description}
                  </p>
                  
                  {reward.stock !== null && (
                    <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-3 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Only {reward.stock} items remaining!</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between">
                  <div className="text-xs font-black text-indigo-650 dark:text-indigo-400">
                    {reward.xpCost.toLocaleString()} XP
                  </div>
                  <button
                    onClick={() => handleOpenRedeemModal(reward)}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold rounded-xl transition"
                  >
                    Redeem Reward
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Redemption History Table */
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <History className="h-5 w-5 text-gray-500" />
              <span>Purchase History</span>
            </h3>

            {redemptionHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-850 text-xxs font-bold uppercase tracking-wider text-gray-450 dark:text-gray-500">
                      <th className="py-3 px-4">Reward</th>
                      <th className="py-3 px-4 text-center">XP Spent</th>
                      <th className="py-3 px-4 text-center">Date</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs text-gray-700 dark:text-gray-300">
                    {redemptionHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/30">
                        <td className="py-4 px-4 font-bold flex items-center space-x-2.5">
                          <span>{h.reward.icon}</span>
                          <span className="text-gray-900 dark:text-white">{h.reward.name}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-indigo-650 dark:text-indigo-400">
                          {h.xpSpent.toLocaleString()} XP
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-gray-500">
                          {new Date(h.redeemedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 text-right align-middle">
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 py-12">
                You have not redeemed any rewards yet.
              </div>
            )}
          </div>
        )}

        {/* 3. Confirm Purchase Modal dialog */}
        {confirmModal && selectedReward && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl transform scale-95 animate-scale-up">
              <h3 className="text-lg font-black text-gray-900 dark:text-white text-center">
                Confirm Purchase
              </h3>
              <p className="text-xs text-gray-550 dark:text-gray-400 mt-2 text-center leading-relaxed">
                Are you sure you want to redeem <span className="font-extrabold text-indigo-600">{selectedReward.name}</span> for <span className="font-black text-indigo-600">{selectedReward.xpCost.toLocaleString()} XP</span>?
              </p>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => setConfirmModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-extrabold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRedeem}
                  disabled={redeemRewardMutation.isPending}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-extrabold rounded-xl shadow shadow-indigo-500/10 transition disabled:opacity-40"
                >
                  {redeemRewardMutation.isPending ? 'Redeeming...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
