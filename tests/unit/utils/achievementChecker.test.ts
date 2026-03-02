import { describe, test, expect, vi } from 'vitest';
import { checkAchievements } from '@/gamification/achievementChecker';
import type { UserStats } from '@/types/gamification';

const mockGetLifetimeStats = vi.fn();

vi.mock('@/lib/lifetimeStatsService', () => ({
    getLifetimeStats: (...args: any[]) => mockGetLifetimeStats(...args)
}));

vi.mock('@/gamification/gamificationStore', () => ({
    useGamificationStore: {
        getState: vi.fn().mockReturnValue({
            preferences: { enabled: true },
            currentLevel: 10,
            addAchievement: vi.fn(),
            addXP: vi.fn()
        })
    }
}));

vi.mock('@/gamification/achievementNotifier', () => ({
    queueCelebration: vi.fn()
}));

vi.mock('@/lib/db', () => ({
    db: {
        achievements_unlocked: {
            toArray: vi.fn().mockResolvedValue([]),
            add: vi.fn().mockResolvedValue(1)
        },
        xp_events: {
            where: vi.fn().mockReturnThis(),
            equals: vi.fn().mockReturnThis(),
            count: vi.fn().mockResolvedValue(0),
            toArray: vi.fn().mockResolvedValue([])
        },
        reviews: {
            toArray: vi.fn().mockResolvedValue([])
        }
    }
}));

// Provide the mock ACHIEVEMENTS so we don't need real ones
vi.mock('@/gamification/achievements', () => ({
    ACHIEVEMENTS: [
        { id: 'inbox_zero_hero', xpReward: 50, condition: { type: 'stat_threshold', stat: 'inboxZeroCount', threshold: 10 } },
        { id: 'weekly_warrior', xpReward: 50, condition: { type: 'stat_threshold', stat: 'weeklyReviewStreak', threshold: 4 } },
        { id: 'century_club', xpReward: 50, condition: { type: 'stat_threshold', stat: 'tasksCompleted', threshold: 100 } },
        { id: 'streak_master', xpReward: 50, condition: { type: 'stat_threshold', stat: 'streakDays', threshold: 30 } }
    ]
}));

describe('Achievement Checker', () => {
    describe('Inbox Zero Hero', () => {
        test('unlocks after clearing inbox 10 times', async () => {
            mockGetLifetimeStats.mockResolvedValueOnce({
                inboxZeroCount: 10,
                tasksCompleted: 50,
                weeklyReviewsCompleted: 2,
                streakDays: 5,
            });

            const achievements = await checkAchievements('test-user');
            expect(achievements).toContain('inbox_zero_hero');
        });

        test('does not unlock with only 9 inbox zeros', async () => {
            mockGetLifetimeStats.mockResolvedValueOnce({
                inboxZeroCount: 9,
                tasksCompleted: 50,
                weeklyReviewsCompleted: 2,
                streakDays: 5,
            });

            const achievements = await checkAchievements('test-user');
            expect(achievements).not.toContain('inbox_zero_hero');
        });
    });

    describe('Weekly Warrior', () => {
        test('unlocks after 4 consecutive weekly reviews', async () => {
            mockGetLifetimeStats.mockResolvedValueOnce({
                inboxZeroCount: 5,
                tasksCompleted: 50,
                weeklyReviewsCompleted: 4,
                weeklyReviewStreak: 4,
                streakDays: 28,
            });

            const achievements = await checkAchievements('test-user');
            expect(achievements).toContain('weekly_warrior');
        });

        test('does not unlock if reviews not consecutive', async () => {
            mockGetLifetimeStats.mockResolvedValueOnce({
                inboxZeroCount: 5,
                tasksCompleted: 50,
                weeklyReviewsCompleted: 5,
                weeklyReviewStreak: 2, // Missed one natively resets tracking integer
                streakDays: 14,
            });

            const achievements = await checkAchievements('test-user');
            expect(achievements).not.toContain('weekly_warrior');
        });
    });

    describe('Century Club', () => {
        test('unlocks after completing 100 tasks', async () => {
            mockGetLifetimeStats.mockResolvedValueOnce({
                inboxZeroCount: 10,
                tasksCompleted: 100,
                weeklyReviewsCompleted: 5,
                streakDays: 10,
            });

            const achievements = await checkAchievements('test-user');
            expect(achievements).toContain('century_club');
        });
    });

    describe('Multiple Achievements', () => {
        test('returns all newly unlocked achievements simultaneously', async () => {
            mockGetLifetimeStats.mockResolvedValueOnce({
                inboxZeroCount: 10, // Unlocks Inbox Zero Hero
                tasksCompleted: 100, // Unlocks Century Club
                weeklyReviewsCompleted: 4,
                weeklyReviewStreak: 4, // Unlocks Weekly Warrior
                streakDays: 30, // Unlocks Streak Master
            });

            const achievements = await checkAchievements('test-user');
            expect(achievements).toHaveLength(4);
            expect(achievements).toContain('inbox_zero_hero');
            expect(achievements).toContain('century_club');
            expect(achievements).toContain('weekly_warrior');
            expect(achievements).toContain('streak_master');
        });
    });
});
