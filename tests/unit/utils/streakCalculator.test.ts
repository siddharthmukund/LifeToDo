import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { updateStreak } from '@/gamification/streakManager';

describe('Streak Manager - updateStreak', () => {
    beforeEach(() => {
        vi.setSystemTime(new Date('2026-03-02T10:00:00Z')); // Base Current Date: March 2, 2026
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('increments streak if active on the very next day', () => {
        const result = updateStreak(5, '2026-03-01', false, new Date('2026-03-02T10:00:00Z'));

        // Last active was the 1st, Today is the 2nd
        expect(result.newStreakDays).toBe(6);
        expect(result.activeDateStr).toBe('2026-03-02');
        expect(result.reset).toBe(false);
    });

    test('maintains streak if already active today', () => {
        const result = updateStreak(5, '2026-03-02', false, new Date('2026-03-02T10:00:00Z'));

        // Should not double increment if already logged today
        expect(result.newStreakDays).toBe(5);
        expect(result.activeDateStr).toBe('2026-03-02');
        expect(result.reset).toBe(false);
    });

    test('resets streak to 1 if user skips a day and no grace period available', () => {
        // Assume level 5 has 0 grace days. 
        // Wait, getAllowedGraceDays(5) -> what does it return?
        // Let's just test the reset behavior directly
        const result = updateStreak(1, '2026-02-28', false, new Date('2026-03-02T10:00:00Z'));

        // Missed a day (March 1st), streak is reset natively
        expect(result.newStreakDays).toBe(1);
        expect(result.activeDateStr).toBe('2026-03-02');
        expect(result.reset).toBe(true);
    });

    test('handles completely fresh state starting at 1', () => {
        const result = updateStreak(0, null, false, new Date('2026-03-02T10:00:00Z'));

        expect(result.newStreakDays).toBe(1);
        expect(result.activeDateStr).toBe('2026-03-02');
        expect(result.reset).toBe(false);
    });
});
