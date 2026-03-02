import { CHALLENGES } from './challenges';
import { db } from '@/lib/db';
import { ActiveChallenge, XPAction } from '../types/gamification';
import { useGamificationStore } from './gamificationStore';
import { queueCelebration } from './achievementNotifier';

export async function processChallengeEvent(action: XPAction) {
    const state = useGamificationStore.getState();
    if (!state.preferences.enabled || !state.preferences.showChallenges) return;

    const now = new Date();
    const activeChallenges = await db.active_challenges
        .where('status').equals('active')
        .toArray();

    let updatedSomething = false;

    for (const active of activeChallenges) {
        // Check expiry
        if (new Date(active.expiresAt) < now) {
            await db.active_challenges.update(active.challengeId, { status: 'expired' });
            updatedSomething = true;
            continue;
        }

        const def = CHALLENGES.find(c => c.id === active.challengeId);
        if (!def) continue;

        if (def.condition.type === 'action_count' && def.condition.action === action) {
            const newCurrent = active.current + 1;
            const newProgress = Math.min(1.0, newCurrent / active.target);
            const isComplete = newProgress >= 1.0;

            const updateData: Partial<ActiveChallenge> = {
                current: newCurrent,
                progress: newProgress,
                status: isComplete ? 'completed' : 'active'
            };

            await db.active_challenges.update(active.challengeId, updateData);
            updatedSomething = true;

            if (isComplete) {
                state.addXP(def.xpReward);
                queueCelebration({
                    type: 'challenge_completed',
                    xpReward: def.xpReward
                });
            }
        }
    }

    if (updatedSomething) {
        // Refresh store cache
        const newActive = await db.active_challenges.where('status').equals('active').toArray();
        state.updateChallenges(newActive);
    }
}

export async function rotateDailyChallenges(isPro: boolean = false) {
    const now = new Date();

    // Expire old ones
    const active = await db.active_challenges.where('status').equals('active').toArray();
    for (const c of active) {
        if (new Date(c.expiresAt) < now) {
            await db.active_challenges.update(c.challengeId, { status: 'expired' });
        }
    }

    // Get active challenges for the new day
    const currentActive = await db.active_challenges.where('status').equals('active').toArray();
    const activeCount = currentActive.length;
    const targetCount = isPro ? 3 : 1;
    const needed = targetCount - activeCount;

    if (needed > 0) {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Simple random selection. For prod we'd filter recent or weight based on weak areas
        const available = CHALLENGES.filter(c =>
            !c.proOnly || isPro
        ).sort(() => Math.random() - 0.5);

        const selected = available.slice(0, needed);

        for (const def of selected) {
            const newChallenge: ActiveChallenge = {
                challengeId: def.id,
                startedAt: now.toISOString(),
                expiresAt: endOfDay.toISOString(),
                progress: 0,
                current: 0,
                target: def.condition.type === 'action_count' ? def.condition.count || 1 : 1, // simplified target extraction
                status: 'active'
            };

            await db.active_challenges.add(newChallenge);
        }
    }

    // Return synced cache
    const finalActive = await db.active_challenges.where('status').equals('active').toArray();
    useGamificationStore.getState().updateChallenges(finalActive);
    return finalActive;
}
