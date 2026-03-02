import { GTDEventName, EventProps } from '../analytics/events';
import { XPAction } from '../types/gamification';
import { calculateXP } from './xpEngine';
import { useGamificationStore } from './gamificationStore';
import { xpToLevel, xpForNextLevel } from './levelCalculator';
import { db } from '@/lib/db';
import { processChallengeEvent } from './challengeEngine';
import { queueCelebration } from './achievementNotifier';
import { checkAchievements } from './achievementChecker';

export async function processXPEvent(eventName: GTDEventName, props?: EventProps) {
    // Map analytics events to XP actions
    let action: XPAction | null = null;

    if (eventName === 'voice_capture_used') {
        action = 'voice_capture';
    } else if (eventName === 'inbox_item_captured') {
        action = props?.source === 'voice' ? 'voice_capture' : 'quick_capture';
    } else if (eventName === 'inbox_item_clarified') {
        action = 'item_clarified';
    } else if (eventName === 'inbox_zero_achieved') {
        action = 'inbox_zero_achieved';
    } else if (eventName === 'two_minute_completed') {
        action = 'two_minute_completed';
    } else if (eventName === 'next_action_completed') {
        action = 'next_action_completed';
    } else if (eventName === 'weekly_review_completed') {
        action = 'weekly_review_completed';
    }

    // Custom events that may be triggered directly for missing items (e.g. project_created)
    if (!action && isValidXPAction(eventName as string)) {
        action = eventName as XPAction;
    }

    if (!action) return;

    const state = useGamificationStore.getState();
    if (!state.preferences.enabled) return;

    // Calculate diminishing returns (daily count via dexie query on xp_events)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const dailyCount = await db.xp_events
        .where('timestamp')
        .aboveOrEqual(todayStart.toISOString())
        .filter(e => e.action === action)
        .count();

    // We use current streak multiplier
    const multiplier = state.currentStreak.multiplier;

    const { baseXP, finalXP } = calculateXP(action, multiplier, dailyCount + 1);

    if (finalXP > 0) {
        const xpEvent = {
            id: crypto.randomUUID(),
            userId: 'singleton',
            action,
            baseXP,
            multiplier,
            finalXP,
            timestamp: new Date().toISOString(),
            metadata: props as Record<string, unknown>
        };

        // Store in Dexie
        await db.xp_events.add(xpEvent);

        // Snapshot old level before update
        const oldLevel = state.currentLevel;

        // Update store state
        const newTotalXP = state.totalXP + finalXP;
        const newLevel = xpToLevel(newTotalXP);
        const newReq = xpForNextLevel(newTotalXP);

        useGamificationStore.setState({
            totalXP: newTotalXP,
            currentLevel: newLevel,
            xpToNextLevel: newReq
        });

        // ── Celebration queue ──────────────────────────────────────────────

        // 1. XP toast (always — brief +XP notification)
        if (state.preferences.showCelebrations) {
            queueCelebration({ type: 'xp', amount: finalXP });
        }

        // 2. Level-up modal (highest priority — check after XP update)
        if (newLevel > oldLevel && state.preferences.showCelebrations) {
            queueCelebration({ type: 'level_up', oldLevel, newLevel });
        }

        // 3. Event-specific celebrations
        if (state.preferences.showCelebrations) {
            if (action === 'inbox_zero_achieved') {
                queueCelebration({ type: 'inbox_zero' });
            } else if (action === 'weekly_review_completed') {
                queueCelebration({ type: 'weekly_review' });
            } else if (action === 'project_completed') {
                queueCelebration({ type: 'project_completed', projectName: String(props?.projectName ?? 'Project') });
            }
        }

        // ── Challenge tracking ────────────────────────────────────────────
        await processChallengeEvent(action);

        // ── Achievement check (fire-and-forget, non-blocking) ─────────────
        // Run on events that commonly unlock achievements to avoid excess Dexie queries
        const achievementTriggers: XPAction[] = [
            'inbox_zero_achieved', 'weekly_review_completed', 'item_clarified',
            'next_action_completed', 'project_completed', 'two_minute_completed'
        ];
        if (achievementTriggers.includes(action)) {
            checkAchievements('singleton').catch(() => { /* non-critical */ });
        }
    }
}

function isValidXPAction(str: string): str is XPAction {
    const validActions = [
        'voice_capture', 'quick_capture', 'item_clarified', 'two_minute_completed',
        'inbox_zero_achieved', 'project_created', 'context_assigned', 'delegated_item',
        'weekly_review_completed', 'daily_reflection', 'next_action_completed',
        'project_completed', 'challenge_completed', 'streak_maintained'
    ];
    return validActions.includes(str);
}
