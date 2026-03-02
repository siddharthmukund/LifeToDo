import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseRelativeDate } from '@/utils/dateParser';
import { addDays, addWeeks, addMonths, startOfWeek, endOfWeek, endOfMonth } from 'date-fns';

describe('Date Parser Logic', () => {
    beforeEach(() => {
        // Set fixed localized date for consistent V8 baseline
        vi.setSystemTime(new Date('2026-03-02T10:00:00Z')); // Monday, March 2, 2026
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Relative Days', () => {
        test('parses "today" identifier', () => {
            const result = parseRelativeDate('today');
            expect(result?.toISOString().split('T')[0]).toBe('2026-03-02');
        });

        test('parses "tomorrow" identifier', () => {
            const result = parseRelativeDate('tomorrow');
            expect(result?.toISOString().split('T')[0]).toBe('2026-03-03');
        });

        test('parses "yesterday" identifier', () => {
            const result = parseRelativeDate('yesterday');
            expect(result?.toISOString().split('T')[0]).toBe('2026-03-01');
        });
    });

    describe('Relative Weeks', () => {
        test('parses "next Monday"', () => {
            const result = parseRelativeDate('next Monday');
            expect(result?.toISOString().split('T')[0]).toBe('2026-03-09'); // Next Monday
        });

        test('parses "next week"', () => {
            const result = parseRelativeDate('next week');
            const expected = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });
            expect(result?.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0]);
        });
    });

    describe('Relative Time Periods', () => {
        test('parses "in 3 days" sliding window length', () => {
            const result = parseRelativeDate('in 3 days');
            expect(result?.toISOString().split('T')[0]).toBe('2026-03-05');
        });

        test('parses "in 1 month"', () => {
            const result = parseRelativeDate('in 1 month');
            expect(result?.toISOString().split('T')[0]).toBe('2026-04-02');
        });
    });

    describe('End of Periods', () => {
        test('parses "end of week" safely', () => {
            const result = parseRelativeDate('end of week');
            const expected = endOfWeek(new Date(), { weekStartsOn: 1 });
            expect(result?.toISOString().split('T')[0]).toBe(expected.toISOString().split('T')[0]);
        });

        test('parses "end of month" safely', () => {
            const result = parseRelativeDate('end of month');
            const expected = endOfMonth(new Date());
            expect(result?.toISOString().split('T')[0]).toBe('2026-03-31');
        });
    });

    describe('Specific Dates Override', () => {
        test('parses "March 15"', () => {
            const result = parseRelativeDate('March 15');
            expect(result?.toISOString().split('T')[0]).toBe('2026-03-15');
        });

        test('parses "2026-03-15" (ISO strict format)', () => {
            const result = parseRelativeDate('2026-03-15');
            expect(result?.toISOString().split('T')[0]).toBe('2026-03-15');
        });
    });

    describe('Edge Cases', () => {
        test('returns null gracefully for invalid date string without throwing', () => {
            expect(parseRelativeDate('invalid')).toBeNull();
            expect(parseRelativeDate('foo bar')).toBeNull();
        });

        test('handles case-insensitive and whitespaced input robustly', () => {
            expect(parseRelativeDate('TOMORROW')?.toISOString().split('T')[0]).toBe('2026-03-03');
            expect(parseRelativeDate('  tomorrow  ')?.toISOString().split('T')[0]).toBe('2026-03-03');
        });
    });
});
