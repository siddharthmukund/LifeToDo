import { useEffect, useState } from 'react';
import { useGamificationStore } from './gamificationStore';
import { db } from '@/lib/db';
import { UnlockedAchievement } from '../types/gamification';
import { checkAchievements } from './achievementChecker';
import { ACHIEVEMENTS } from './achievements';

export function useAchievements() {
    const achievements = useGamificationStore((state) => state.achievements);
    const addAchievement = useGamificationStore((state) => state.addAchievement);
    const preferences = useGamificationStore((state) => state.preferences);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!preferences.enabled) return;

        // Load initial from Dexie
        const loadAchievements = async () => {
            const unlocked = await db.achievements_unlocked.toArray();
            // Replace store achievements if different (could be handled better with a `setAchievements` store action)
            if (unlocked.length !== achievements.length) {
                useGamificationStore.setState({ achievements: unlocked });
            }
            setLoading(false);

            // Batch check on load (we assume userId is 'singleton' for local app)
            await checkAchievements('singleton');
        };

        loadAchievements();
    }, [preferences.enabled]); // eslint-disable-line react-hooks/exhaustive-deps

    const unlockedIds = new Set(achievements.map((a) => a.achievementId));

    const formattedAchievements = ACHIEVEMENTS.map((def) => {
        const unlockedRecord = achievements.find((a) => a.achievementId === def.id);
        return {
            ...def,
            isUnlocked: !!unlockedRecord,
            unlockedAt: unlockedRecord?.unlockedAt,
        };
    });

    return {
        achievements: formattedAchievements,
        unlockedCount: achievements.length,
        totalCount: ACHIEVEMENTS.filter(a => !a.hidden || unlockedIds.has(a.id)).length,
        loading
    };
}
