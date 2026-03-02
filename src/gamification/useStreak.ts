import { useGamificationStore } from './gamificationStore';
import { calculateMultiplier, updateStreak as updateStreakLogic } from './streakManager';
import { db } from '@/lib/db';

export function useStreak() {
    const currentStreak = useGamificationStore((state) => state.currentStreak);
    const preferences = useGamificationStore((state) => state.preferences);

    const recordActivity = async () => {
        if (!preferences.enabled) return;

        const { newStreakDays, graceUsed, reset, activeDateStr } = updateStreakLogic(
            currentStreak.days,
            currentStreak.lastActiveDate,
            currentStreak.graceUsedToday
        );

        // Only update if something changed
        if (
            newStreakDays !== currentStreak.days ||
            graceUsed !== currentStreak.graceUsedToday ||
            reset ||
            activeDateStr !== currentStreak.lastActiveDate
        ) {
            const multiplier = calculateMultiplier(newStreakDays);
            useGamificationStore.getState().updateStreak({
                type: 'daily_practice',
                days: newStreakDays,
                multiplier,
                lastActiveDate: activeDateStr,
                graceUsedToday: graceUsed
            });
        }
    };

    return {
        currentStreak,
        recordActivity,
        multiplier: currentStreak.multiplier
    };
}
