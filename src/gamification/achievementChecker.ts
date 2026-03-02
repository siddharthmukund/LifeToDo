import { db } from '@/lib/db';
import { ACHIEVEMENTS } from './achievements';
import { getLifetimeStats } from '@/lib/lifetimeStatsService';
import { useGamificationStore } from './gamificationStore';
import { XPAction } from '../types/gamification';
import { queueCelebration } from './achievementNotifier';

export async function checkAchievements(userId: string) {
    const state = useGamificationStore.getState();
    if (!state.preferences.enabled) return;

    const stats = await getLifetimeStats(userId);
    const newlyUnlocked: string[] = [];

    const existingUnlocked = await db.achievements_unlocked.toArray();
    const unlockedIds = new Set(existingUnlocked.map(a => a.achievementId));

    for (const achievement of ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue;

        let isUnlocked = false;

        // Fast path: stat thresholds
        if (achievement.condition.type === 'stat_threshold') {
            if (achievement.id.startsWith('level_')) {
                isUnlocked = state.currentLevel >= (achievement.condition.threshold || 0);
            } else if (achievement.condition.stat) {
                const val = stats[achievement.condition.stat as keyof typeof stats] as number | undefined;
                isUnlocked = (val !== undefined && val >= (achievement.condition.threshold || 0));
            }
        }
        // Medium path: Event counts query from Dexie xp_events
        else if (achievement.condition.type === 'event_count' && achievement.condition.eventName) {
            const count = await db.xp_events
                .where('action').equals(achievement.condition.eventName)
                .count();
            isUnlocked = count >= (achievement.condition.threshold || 0);
        }

        // Explicit custom logic for secrets
        if (achievement.id === 'night_owl') {
            // Find one event that occurred between 00:00 and 04:00
            const events = await db.xp_events.where('action').equals('item_clarified').toArray();
            isUnlocked = events.some(e => {
                const h = new Date(e.timestamp).getHours();
                return h >= 0 && h < 4;
            });
        } else if (achievement.id === 'early_bird') {
            // Find a review completed before 7 AM
            const reviews = await db.reviews.toArray();
            isUnlocked = reviews.some(r => {
                const h = new Date(r.completedAt).getHours();
                return h < 7;
            });
        }

        if (isUnlocked) {
            const unlockRecord = {
                achievementId: achievement.id,
                unlockedAt: new Date().toISOString(),
                xpAwarded: achievement.xpReward
            };

            await db.achievements_unlocked.add(unlockRecord);
            newlyUnlocked.push(achievement.id);

            // Update UI Store
            state.addAchievement(unlockRecord);
            state.addXP(achievement.xpReward);

            // Queue Notification Celebration
            queueCelebration({
                type: 'achievement',
                achievementId: achievement.id,
                xpReward: achievement.xpReward
            });
        }
    }

    return newlyUnlocked;
}
