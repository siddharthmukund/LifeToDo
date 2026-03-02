import { describe, test, expect } from 'vitest';
import { calculateXP, applyDiminishingReturns } from '@/gamification/xpEngine';
import type { XPAction } from '@/types/gamification';

describe('XP Engine', () => {
    describe('calculateXP', () => {
        test('returns base XP unmodified if no overrides or diminishment applies', () => {
            const result = calculateXP('next_action_completed', 1.0, 1);
            expect(result.baseXP).toBe(3); // Check constants.ts for baseline matching
            expect(result.finalXP).toBe(3);
        });

        test('applies streak multipliers correctly', () => {
            const result = calculateXP('next_action_completed', 1.5, 5);
            expect(result.finalXP).toBe(4); // floor(3 * 1.5)
        });

        test('respects baseXP override if provided', () => {
            const result = calculateXP('next_action_completed', 1.0, 1, 50);
            expect(result.baseXP).toBe(50);
            expect(result.finalXP).toBe(50);
        });

        test('ignores multiplier for exempt core habits (e.g. daily_reflection exception)', () => {
            const result = calculateXP('weekly_review_completed', 1.5, 1);
            // Multiplier forced to 1.0
            expect(result.finalXP).toBe(result.baseXP);
        });
    });

    describe('Diminishing Returns Tracker', () => {
        test('returns full base XP if under threshold', () => {
            expect(applyDiminishingReturns('next_action_completed', 10, 5)).toBe(10);
        });

        test('halves XP if between 11 and 20 tasks', () => {
            expect(applyDiminishingReturns('next_action_completed', 10, 15)).toBe(5);
        });

        test('reduces to 10% base XP if over 20 tasks to prevent grinding', () => {
            expect(applyDiminishingReturns('next_action_completed', 10, 25)).toBe(1);
        });

        test('does not diminish exempt actions regardless of frequency', () => {
            expect(applyDiminishingReturns('weekly_review_completed', 50, 50)).toBe(50);
        });
    });
});
