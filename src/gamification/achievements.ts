import { AchievementDefinition } from '../types/gamification';

export const ACHIEVEMENTS: AchievementDefinition[] = [
    // --- Capture Achievements ---
    {
        id: 'first_capture',
        name: 'First Thought',
        description: 'Capture your first item to the inbox.',
        icon: '💡',
        category: 'capture',
        tier: 'bronze',
        condition: { type: 'stat_threshold', stat: 'totalItemsCaptured', threshold: 1 },
        xpReward: 10,
        hidden: false
    },
    {
        id: 'voice_natural',
        name: 'Voice of Reason',
        description: 'Capture 25 items using voice capture.',
        icon: '🎙️',
        category: 'capture',
        tier: 'bronze',
        condition: { type: 'event_count', eventName: 'voice_capture', threshold: 25 },
        xpReward: 20,
        hidden: false
    },
    {
        id: 'capture_100',
        name: 'Collection Habit',
        description: 'Capture 100 items total.',
        icon: '📥',
        category: 'capture',
        tier: 'silver',
        condition: { type: 'stat_threshold', stat: 'totalItemsCaptured', threshold: 100 },
        xpReward: 30,
        hidden: false
    },
    {
        id: 'capture_1000',
        name: 'Thought Catcher',
        description: 'Capture 1,000 items total.',
        icon: '🦋',
        category: 'capture',
        tier: 'gold',
        condition: { type: 'stat_threshold', stat: 'totalItemsCaptured', threshold: 1000 },
        xpReward: 75,
        hidden: false
    },
    {
        id: 'capture_streak_7',
        name: 'Daily Collector',
        description: 'Capture at least 1 item every day for 7 days.',
        icon: '📅',
        category: 'capture',
        tier: 'silver',
        condition: { type: 'streak', eventName: 'inbox_item_captured', threshold: 7 }, // Need special streak queries later
        xpReward: 40,
        hidden: false
    },

    // --- Clarify Achievements ---
    {
        id: 'first_clarify',
        name: 'Decision Made',
        description: 'Clarify 1 inbox item.',
        icon: '⚖️',
        category: 'clarify',
        tier: 'bronze',
        condition: { type: 'stat_threshold', stat: 'totalItemsClarified', threshold: 1 },
        xpReward: 10,
        hidden: false
    },
    {
        id: 'inbox_zero_first',
        name: 'Clear Mind',
        description: 'Achieve inbox zero for the first time.',
        icon: '🧹',
        category: 'clarify',
        tier: 'silver',
        condition: { type: 'stat_threshold', stat: 'totalInboxZeroAchievements', threshold: 1 },
        xpReward: 50,
        hidden: false
    },
    {
        id: 'inbox_zero_10',
        name: 'Zero Hero',
        description: 'Achieve inbox zero 10 times.',
        icon: '🦸',
        category: 'clarify',
        tier: 'gold',
        condition: { type: 'stat_threshold', stat: 'totalInboxZeroAchievements', threshold: 10 },
        xpReward: 75,
        hidden: false
    },
    {
        id: 'inbox_zero_100',
        name: 'Inbox Zen Master',
        description: 'Achieve inbox zero 100 times.',
        icon: '✨',
        category: 'clarify',
        tier: 'platinum',
        condition: { type: 'stat_threshold', stat: 'totalInboxZeroAchievements', threshold: 100 },
        xpReward: 150,
        hidden: false
    },
    {
        id: 'two_min_master',
        name: 'Lightning Hands',
        description: 'Complete 50 two-minute actions.',
        icon: '⚡',
        category: 'clarify',
        tier: 'gold',
        condition: { type: 'stat_threshold', stat: 'totalTwoMinuteTasksDone', threshold: 50 },
        xpReward: 60,
        hidden: false
    },

    // --- Organize Achievements ---
    {
        id: 'first_project',
        name: 'Project Thinker',
        description: 'Create your first project.',
        icon: '🏗️',
        category: 'organize',
        tier: 'bronze',
        condition: { type: 'event_count', eventName: 'project_created', threshold: 1 },
        xpReward: 10,
        hidden: false
    },
    {
        id: 'projects_done_10',
        name: 'Closer',
        description: 'Complete 10 projects.',
        icon: '🏁',
        category: 'organize',
        tier: 'gold',
        condition: { type: 'stat_threshold', stat: 'totalProjectsCompleted', threshold: 10 },
        xpReward: 75,
        hidden: false
    },

    // --- Reflect Achievements ---
    {
        id: 'first_review',
        name: 'Mirror Moment',
        description: 'Complete your first weekly review.',
        icon: '🪞',
        category: 'reflect',
        tier: 'silver',
        condition: { type: 'stat_threshold', stat: 'totalWeeklyReviewsCompleted', threshold: 1 },
        xpReward: 50,
        hidden: false
    },
    {
        id: 'review_streak_4',
        name: 'Monthly Reviewer',
        description: 'Maintain a 4-week review streak.',
        icon: '🗓️',
        category: 'reflect',
        tier: 'gold',
        condition: { type: 'stat_threshold', stat: 'longestWeeklyReviewStreak', threshold: 4 },
        xpReward: 100,
        hidden: false
    },
    {
        id: 'review_streak_12',
        name: 'Quarterly Discipline',
        description: 'Maintain a 12-week review streak.',
        icon: '🏅',
        category: 'reflect',
        tier: 'platinum',
        condition: { type: 'stat_threshold', stat: 'longestWeeklyReviewStreak', threshold: 12 },
        xpReward: 200,
        hidden: false
    },

    // --- Engage Achievements ---
    {
        id: 'actions_done_10',
        name: 'Getting Started',
        description: 'Complete 10 next actions.',
        icon: '🚀',
        category: 'engage',
        tier: 'bronze',
        condition: { type: 'stat_threshold', stat: 'totalNextActionsCompleted', threshold: 10 },
        xpReward: 15,
        hidden: false
    },
    {
        id: 'actions_done_100',
        name: 'Momentum',
        description: 'Complete 100 next actions.',
        icon: '🚂',
        category: 'engage',
        tier: 'silver',
        condition: { type: 'stat_threshold', stat: 'totalNextActionsCompleted', threshold: 100 },
        xpReward: 50,
        hidden: false
    },
    {
        id: 'actions_done_1000',
        name: 'Unstoppable',
        description: 'Complete 1,000 next actions.',
        icon: '🔥',
        category: 'engage',
        tier: 'gold',
        condition: { type: 'stat_threshold', stat: 'totalNextActionsCompleted', threshold: 1000 },
        xpReward: 100,
        hidden: false
    },

    // --- Meta / Mastery Achievements ---
    {
        id: 'level_10',
        name: 'GTD Practitioner',
        description: 'Reach gamification level 10.',
        icon: '🌟',
        category: 'meta',
        tier: 'gold',
        condition: { type: 'stat_threshold', stat: undefined, threshold: 10 }, // Handled explicitly as "level" check
        xpReward: 100,
        hidden: false
    },

    // --- Secret / Hidden Achievements ---
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Process an inbox item after midnight.',
        icon: '🦉',
        category: 'clarify',
        tier: 'bronze',
        condition: { type: 'event_count', eventName: 'item_clarified', threshold: 1 },
        // Additional conditional checks will be in achievementChecker
        xpReward: 15,
        hidden: true
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a weekly review before 7 AM.',
        icon: '🌅',
        category: 'reflect',
        tier: 'bronze',
        condition: { type: 'stat_threshold', stat: 'totalWeeklyReviewsCompleted', threshold: 1 }, // And check time
        xpReward: 15,
        hidden: true
    },
    {
        id: 'comeback',
        name: 'Welcome Back',
        description: 'Process your inbox after 14+ days away.',
        icon: '👋',
        category: 'meta',
        tier: 'silver',
        condition: { type: 'event_count', eventName: 'item_clarified', threshold: 1 }, // Need time delta logic
        xpReward: 30,
        hidden: true
    }
];
