import { XPAction } from '../types/gamification';

export const XP_VALUES: Record<XPAction, number> = {
    'voice_capture': 2,
    'quick_capture': 1,
    'item_clarified': 5,
    'two_minute_completed': 8,
    'inbox_zero_achieved': 25,
    'project_created': 3,
    'context_assigned': 2,
    'delegated_item': 5,
    'weekly_review_completed': 50,
    'daily_reflection': 10,
    'next_action_completed': 3,
    'project_completed': 15,
    'challenge_completed': 15, // Default/base, will be overridden by challenge difficulty
    'streak_maintained': 10
};

export const STREAK_TIERS = [
    { minDays: 1, multiplier: 1.0, graceDays: 0 },
    { minDays: 4, multiplier: 1.25, graceDays: 1 },
    { minDays: 7, multiplier: 1.5, graceDays: 1 },
    { minDays: 14, multiplier: 2.0, graceDays: 1 },
    { minDays: 28, multiplier: 2.5, graceDays: 2 }
];

export const MAX_LEVEL = 30;
