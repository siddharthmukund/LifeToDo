import { STREAK_TIERS } from './constants';

export function calculateMultiplier(streakDays: number): number {
    for (const tier of [...STREAK_TIERS].reverse()) {
        if (streakDays >= tier.minDays) {
            return tier.multiplier;
        }
    }
    return 1.0;
}

export function getAllowedGraceDays(streakDays: number): number {
    for (const tier of [...STREAK_TIERS].reverse()) {
        if (streakDays >= tier.minDays) {
            return tier.graceDays;
        }
    }
    return 0;
}

export function updateStreak(
    currentStreakDays: number,
    lastActiveDateStr: string | null,
    graceUsedToday: boolean,
    currentDate: Date = new Date()
): { newStreakDays: number; graceUsed: boolean; reset: boolean; activeDateStr: string } {
    const todayStr = currentDate.toISOString().split('T')[0];

    if (!lastActiveDateStr) {
        return { newStreakDays: 1, graceUsed: false, reset: false, activeDateStr: todayStr };
    }

    if (lastActiveDateStr === todayStr) {
        return { newStreakDays: currentStreakDays, graceUsed: graceUsedToday, reset: false, activeDateStr: todayStr };
    }

    const lastActive = new Date(lastActiveDateStr);
    const diffTime = Math.abs(currentDate.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const allowedGrace = getAllowedGraceDays(currentStreakDays);

    if (diffDays === 1) {
        // Consecutive day
        return { newStreakDays: currentStreakDays + 1, graceUsed: false, reset: false, activeDateStr: todayStr };
    } else if (diffDays === 2) {
        // Missed one day
        if (!graceUsedToday && allowedGrace >= 1) {
            return { newStreakDays: currentStreakDays + 1, graceUsed: true, reset: false, activeDateStr: todayStr };
        } else {
            // Reset
            return { newStreakDays: 1, graceUsed: false, reset: true, activeDateStr: todayStr };
        }
    } else {
        // Missed multiple days, reset
        return { newStreakDays: 1, graceUsed: false, reset: true, activeDateStr: todayStr };
    }
}
