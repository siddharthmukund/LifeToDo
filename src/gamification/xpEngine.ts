import { XPAction } from '../types/gamification';
import { XP_VALUES } from './constants';

const EXEMPT_ACTIONS: XPAction[] = [
    'weekly_review_completed',
    'inbox_zero_achieved',
    'daily_reflection',
    'challenge_completed',
    'streak_maintained',
    'project_completed'
];

export function applyDiminishingReturns(
    action: XPAction,
    baseXP: number,
    dailyActionCount: number
): number {
    if (EXEMPT_ACTIONS.includes(action)) return baseXP;

    if (dailyActionCount <= 10) return baseXP;
    if (dailyActionCount <= 20) return Math.floor(baseXP * 0.5);
    return Math.floor(baseXP * 0.1);
}

export function calculateXP(
    action: XPAction,
    streakMultiplier: number,
    dailyActionCount: number,
    overrideBaseXP?: number
): { baseXP: number; finalXP: number } {
    const base = overrideBaseXP ?? XP_VALUES[action] ?? 0;
    const diminishedBase = applyDiminishingReturns(action, base, dailyActionCount);

    const mult = EXEMPT_ACTIONS.includes(action) && action !== 'daily_reflection' ? 1.0 : streakMultiplier;

    return {
        baseXP: diminishedBase,
        finalXP: Math.floor(diminishedBase * mult)
    };
}
