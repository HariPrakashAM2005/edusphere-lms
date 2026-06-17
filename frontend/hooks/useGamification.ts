import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface XPRecord {
  id: string;
  action: string;
  xpAmount: number;
  multiplier: number;
  createdAt: string;
}

export interface XPStats {
  level: number;
  currentXP: number;
  totalXP: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
  recentGains: XPRecord[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  xpRequired?: number;
  earnedAt?: string;
  countRequired: number;
}

export interface BadgesData {
  allBadges: Badge[];
  earnedBadges: Badge[];
  earnedBadgeIds: string[];
}

export interface StreakStats {
  currentLoginStreak: number;
  longestLoginStreak: number;
  currentAssignmentStreak: number;
  currentAttendanceStreak: number;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  score: number;
  level: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  period: string;
  courseId: string | null;
  topUsers: LeaderboardUser[];
  nearbyRanks: LeaderboardUser[];
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: string;
  xpCost: number;
  icon: string;
  stock: number | null;
}

export interface RedemptionRecord {
  id: string;
  rewardId: string;
  xpSpent: number;
  status: string;
  redeemedAt: string;
  reward: Reward;
}

export interface RewardsData {
  rewards: Reward[];
  history: RedemptionRecord[];
  xpBalance: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  action: string;
  targetCount: number;
  xpReward: number;
  progress: number;
  completed: boolean;
}

export interface AchievementsData {
  dailyQuests: DailyQuest[];
  badgesEarned: number;
  totalBadges: number;
  badgeCompletionPercentage: number;
  streak: {
    login: number;
    longestLogin: number;
    assignment: number;
    attendance: number;
  };
}

// Hooks

export const useXP = () => {
  return useQuery<XPStats>({
    queryKey: ['xpStats'],
    queryFn: async () => {
      const res = await api.get('/gamification/user/xp');
      return res.data;
    }
  });
};

export const useBadges = () => {
  return useQuery<BadgesData>({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await api.get('/gamification/user/badges');
      return res.data;
    }
  });
};

export const useStreak = () => {
  return useQuery<StreakStats>({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await api.get('/gamification/user/streak');
      return res.data;
    }
  });
};

export const useLeaderboard = (period = 'weekly', courseId?: string) => {
  return useQuery<LeaderboardData>({
    queryKey: ['leaderboard', period, courseId || 'all'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', period);
      if (courseId) params.append('courseId', courseId);
      const res = await api.get(`/gamification/leaderboard?${params.toString()}`);
      return res.data;
    }
  });
};

export const useRewards = () => {
  return useQuery<RewardsData>({
    queryKey: ['rewards'],
    queryFn: async () => {
      const res = await api.get('/gamification/rewards');
      return res.data;
    }
  });
};

export const useAchievements = () => {
  return useQuery<AchievementsData>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await api.get('/gamification/achievements');
      return res.data;
    }
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; redemption: RedemptionRecord }, Error, string>({
    mutationFn: async (rewardId) => {
      const res = await api.post(`/gamification/rewards/${rewardId}/redeem`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh XP balance and history
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['xpStats'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    }
  });
};

export const useCheckBadges = () => {
  const queryClient = useQueryClient();
  return useMutation<{ newlyAwarded: Badge[] }, Error, void>({
    mutationFn: async () => {
      const res = await api.post('/gamification/check-badges');
      return res.data;
    },
    onSuccess: (data) => {
      if (data.newlyAwarded && data.newlyAwarded.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['badges'] });
        queryClient.invalidateQueries({ queryKey: ['xpStats'] });
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
      }
    }
  });
};
