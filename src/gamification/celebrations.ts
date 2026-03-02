// Defines static mappings and rules for celebrations

export const CELEBRATION_DURATIONS = {
    xp: 1500,               // 1.5s
    achievement: 3000,      // 3s
    streak: 3000,           // 3s
    inbox_zero: 2000,       // 2s
    weekly_review: 2000,    // 2s
    project_completed: 2000,// 2s
    challenge_completed: 3000, // 3s
    level_up: 0 // handled by user click in full mode, or fallback
};

export const ADHD_DURATIONS = {
    xp: 1000,
    achievement: 2000,
    streak: 2000,
    inbox_zero: 1500,
    weekly_review: 1500,
    project_completed: 1500,
    challenge_completed: 2000,
    level_up: 4000
};
