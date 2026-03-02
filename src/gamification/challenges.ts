import { ChallengeDefinition } from '../types/gamification';

export const CHALLENGES: ChallengeDefinition[] = [
    // --- Easy Challenges (15 XP) ---
    {
        id: 'quick_capture_3',
        name: 'Quick Draw',
        description: 'Capture 3 items using voice capture.',
        icon: '🎙️',
        difficulty: 'easy',
        xpReward: 15,
        duration: 'daily',
        condition: { type: 'action_count', action: 'voice_capture', count: 3 },
        category: 'capture',
        proOnly: false
    },
    {
        id: 'clarify_5',
        name: 'Inbox Sweep',
        description: 'Clarify 5 inbox items.',
        icon: '🧹',
        difficulty: 'easy',
        xpReward: 15,
        duration: 'daily',
        condition: { type: 'action_count', action: 'item_clarified', count: 5 },
        category: 'clarify',
        proOnly: false
    },
    {
        id: 'complete_3',
        name: 'Momentum Starter',
        description: 'Complete 3 next actions.',
        icon: '🔥',
        difficulty: 'easy',
        xpReward: 15,
        duration: 'daily',
        condition: { type: 'action_count', action: 'next_action_completed', count: 3 },
        category: 'engage',
        proOnly: false
    },

    // --- Medium Challenges (30 XP) ---
    {
        id: 'inbox_zero_today',
        name: 'Zero Inbox Day',
        description: 'Achieve inbox zero today.',
        icon: '✨',
        difficulty: 'medium',
        xpReward: 30,
        duration: 'daily',
        condition: { type: 'action_count', action: 'inbox_zero_achieved', count: 1 },
        category: 'clarify',
        proOnly: false
    },
    {
        id: 'two_min_blitz',
        name: 'Two-Minute Blitz',
        description: 'Complete 3 two-minute actions.',
        icon: '⚡',
        difficulty: 'medium',
        xpReward: 30,
        duration: 'daily',
        condition: { type: 'action_count', action: 'two_minute_completed', count: 3 },
        category: 'clarify',
        proOnly: false
    },

    // --- Hard Challenges (60 XP) ---
    {
        id: 'speed_clarify',
        name: 'Speed Clarifier',
        description: 'Clarify 10 items today.',
        icon: '🏎️',
        difficulty: 'hard',
        xpReward: 60,
        duration: 'daily',
        condition: { type: 'action_count', action: 'item_clarified', count: 10 },
        category: 'clarify',
        proOnly: false
    },
    {
        id: 'delegate_3',
        name: 'Delegation Day',
        description: 'Delegate 3 items to others.',
        icon: '🤝',
        difficulty: 'hard',
        xpReward: 60,
        duration: 'daily',
        condition: { type: 'action_count', action: 'delegated_item', count: 3 },
        category: 'organize',
        proOnly: false
    }
];
