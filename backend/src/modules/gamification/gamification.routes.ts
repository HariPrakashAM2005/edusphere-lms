import { Router } from 'express';
import { authenticateJWT } from '../../middleware/auth.middleware';
import {
  getUserXP,
  getBadges,
  getStreak,
  updateStreak,
  getLeaderboard,
  getRewards,
  redeemReward,
  getAchievements,
  awardBadge,
  awardXP
} from './gamification.controller';

const router = Router();

// Retrieve XP and progression stats
router.get('/user/xp', authenticateJWT, getUserXP);

// Add XP (progression action)
router.post('/user/xp', authenticateJWT, awardXP);

// Retrieve all badges + earned badges
router.get('/user/badges', authenticateJWT, getBadges);

// Retrieve streak statistics
router.get('/user/streak', authenticateJWT, getStreak);

// Trigger a manual or background streak update
router.post('/user/streak', authenticateJWT, updateStreak);

// Get global and period leaderboards
router.get('/leaderboard', authenticateJWT, getLeaderboard);

// Get course-specific leaderboard rankings
router.get('/leaderboard/course/:courseId', authenticateJWT, getLeaderboard);

// Retrieve store items + purchase history
router.get('/rewards', authenticateJWT, getRewards);

// Purchase reward item from store
router.post('/rewards/:id/redeem', authenticateJWT, redeemReward);

// Retrieve overall achievements (daily quests + login streaks)
router.get('/achievements', authenticateJWT, getAchievements);

// Check webhook for badges
router.post('/check-badges', authenticateJWT, awardBadge);

export default router;
