"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimStreak = exports.getBadges = exports.getLeaderboard = void 0;
const mockLeaderboard = [
    { rank: 1, name: 'Aravind Swamy', xp: 2450 },
    { rank: 2, name: 'Sanjana Roy', xp: 2100 },
    { rank: 3, name: 'Meera Patel', xp: 1850 },
    { rank: 4, name: 'Rohit Sharma', xp: 1550 },
    { rank: 5, name: 'Test Student', xp: 1250, isCurrentUser: true }, // Current student seed name
    { rank: 6, name: 'Vikas Gupta', xp: 1100 },
    { rank: 7, name: 'Divya Nair', xp: 950 },
];
const mockBadges = [
    { id: 'badge-1', title: 'First Steps', description: 'Complete your first lesson', icon: 'Footprints', unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'badge-2', title: 'Python Pilot', description: 'Complete python programming basics module', icon: 'Plane', unlockedAt: null },
    { id: 'badge-3', title: 'HTML Hero', description: 'Unlock module 1 in Responsive Web Design', icon: 'Shield', unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'badge-4', title: 'Habitual Learner', description: 'Maintain a 5-day study streak', icon: 'Flame', unlockedAt: new Date().toISOString() },
    { id: 'badge-5', title: 'Certifiable', description: 'Earn your first course certificate', icon: 'Award', unlockedAt: null },
];
const getLeaderboard = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    // Set the current user's actual name in leaderboard if we know it
    const userRankings = mockLeaderboard.map((entry) => {
        if (entry.isCurrentUser && req.user) {
            return {
                ...entry,
                name: `${req.user.role === 'STUDENT' ? 'Test Student' : 'Admin User'}`
            };
        }
        return entry;
    });
    res.status(200).json(userRankings);
};
exports.getLeaderboard = getLeaderboard;
const getBadges = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    res.status(200).json(mockBadges);
};
exports.getBadges = getBadges;
const claimStreak = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    res.status(200).json({
        message: 'Streak claimed successfully!',
        streakCount: 6,
        xpAwarded: 50,
    });
};
exports.claimStreak = claimStreak;
