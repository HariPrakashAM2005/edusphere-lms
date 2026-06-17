"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const gamification_controller_1 = require("./gamification.controller");
const router = (0, express_1.Router)();
// Retrieve XP and progression stats
router.get('/user/xp', auth_middleware_1.authenticateJWT, gamification_controller_1.getUserXP);
// Add XP (progression action)
router.post('/user/xp', auth_middleware_1.authenticateJWT, gamification_controller_1.awardXP);
// Retrieve all badges + earned badges
router.get('/user/badges', auth_middleware_1.authenticateJWT, gamification_controller_1.getBadges);
// Retrieve streak statistics
router.get('/user/streak', auth_middleware_1.authenticateJWT, gamification_controller_1.getStreak);
// Trigger a manual or background streak update
router.post('/user/streak', auth_middleware_1.authenticateJWT, gamification_controller_1.updateStreak);
// Get global and period leaderboards
router.get('/leaderboard', auth_middleware_1.authenticateJWT, gamification_controller_1.getLeaderboard);
// Get course-specific leaderboard rankings
router.get('/leaderboard/course/:courseId', auth_middleware_1.authenticateJWT, gamification_controller_1.getLeaderboard);
// Retrieve store items + purchase history
router.get('/rewards', auth_middleware_1.authenticateJWT, gamification_controller_1.getRewards);
// Purchase reward item from store
router.post('/rewards/:id/redeem', auth_middleware_1.authenticateJWT, gamification_controller_1.redeemReward);
// Retrieve overall achievements (daily quests + login streaks)
router.get('/achievements', auth_middleware_1.authenticateJWT, gamification_controller_1.getAchievements);
// Check webhook for badges
router.post('/check-badges', auth_middleware_1.authenticateJWT, gamification_controller_1.awardBadge);
exports.default = router;
