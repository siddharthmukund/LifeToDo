// ─── XP System ───

export interface XPEvent {
    id: string;                          // UUID
    userId: string;
    action: XPAction;                    // What the user did
    baseXP: number;                      // XP before multipliers
    multiplier: number;                  // Streak multiplier at time of earn
    finalXP: number;                     // baseXP × multiplier
    timestamp: string;                   // ISO-8601
    metadata?: Record<string, unknown>;  // Action-specific context
}

export type XPAction =
    // Capture phase (low XP — capturing is easy, processing is the skill)
    | 'voice_capture'                    // 2 XP — used voice to capture
    | 'quick_capture'                    // 1 XP — typed capture

    // Clarify phase (high XP — this is where GTD discipline lives)
    | 'item_clarified'                   // 5 XP — processed an inbox item through clarify
    | 'two_minute_completed'             // 8 XP — identified and completed a <2min action
    | 'inbox_zero_achieved'              // 25 XP — bonus for clearing entire inbox

    // Organize phase (medium XP)
    | 'project_created'                  // 3 XP — organized work into a project
    | 'context_assigned'                 // 2 XP — assigned context to an action
    | 'delegated_item'                   // 5 XP — delegated (waiting-for created)

    // Reflect phase (highest XP — weekly review is the keystone habit)
    | 'weekly_review_completed'          // 50 XP — completed full weekly review
    | 'daily_reflection'                 // 10 XP — reviewed today's actions (morning or evening)

    // Engage phase (medium XP)
    | 'next_action_completed'            // 3 XP — completed a next action
    | 'project_completed'                // 15 XP — all actions in a project done

    // Meta / Discipline
    | 'challenge_completed'              // Variable — depends on challenge difficulty
    | 'streak_maintained'                // 10 XP — daily practice streak continued

// ─── Levels ───

export interface LevelDefinition {
    level: number;
    title: string;                       // Thematic GTD title
    xpRequired: number;                  // Cumulative XP to reach this level
    icon: string;                        // Lucide icon name or emoji
}

export interface UserGamificationState {
    totalXP: number;
    currentLevel: number;
    xpToNextLevel: number;               // Remaining XP needed
    currentStreak: {
        type: 'daily_practice';
        days: number;
        multiplier: number;                // 1.0 → 2.5 based on streak length
        lastActiveDate: string;            // ISO date (YYYY-MM-DD)
        graceUsedToday: boolean;           // One grace day per streak allowed
    };
    achievements: UnlockedAchievement[];
    activeChallenges: ActiveChallenge[];
    preferences: GamificationPreferences;
}

export interface GamificationPreferences {
    enabled: boolean;                    // Master toggle
    showXPBar: boolean;                  // XP progress in header/nav
    showCelebrations: boolean;           // Animations on milestones
    showChallenges: boolean;             // Daily challenge cards
    leaderboardOptIn: boolean;           // Share score publicly (Pro)
    celebrationIntensity: 'full' | 'subtle' | 'none';  // ADHD Mode defaults to 'subtle'
}

// ─── Achievements ───

export interface AchievementDefinition {
    id: string;                          // e.g., 'first_capture', 'review_streak_10'
    name: string;                        // Display name
    description: string;                 // How to earn it
    icon: string;                        // Emoji or Lucide icon
    category: AchievementCategory;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    condition: AchievementCondition;     // Programmatic unlock condition
    xpReward: number;                    // Bonus XP on unlock
    hidden: boolean;                     // Secret achievements — description hidden until unlocked
}

export type AchievementCategory =
    | 'capture'                          // Capturing habits
    | 'clarify'                          // Processing discipline
    | 'organize'                         // System structure
    | 'reflect'                          // Review consistency
    | 'engage'                           // Action completion
    | 'meta'                             // Overall GTD mastery
    | 'social';                          // Leaderboard / sharing (Pro)

import { LifetimeGTDStats } from './index'

export interface AchievementCondition {
    type: 'stat_threshold' | 'streak' | 'event_count' | 'compound';
    // Evaluated against GTDLifetimeStats + analytics events
    stat?: keyof LifetimeGTDStats;
    threshold?: number;
    eventName?: string;
    period?: 'day' | 'week' | 'month' | 'all_time';
    children?: AchievementCondition[];   // For compound conditions (AND/OR)
    operator?: 'AND' | 'OR';
}

export interface UnlockedAchievement {
    achievementId: string;
    unlockedAt: string;                  // ISO-8601
    xpAwarded: number;
}

// ─── Challenges ───

export interface ChallengeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: 'easy' | 'medium' | 'hard';
    xpReward: number;                    // 15 / 30 / 60 based on difficulty
    duration: 'daily' | 'weekly';
    condition: ChallengeCondition;
    category: AchievementCategory;
    proOnly: boolean;                    // Weekly challenges are Pro-only
}

export interface ChallengeCondition {
    type: 'action_count' | 'time_based' | 'specific_action' | 'compound';
    action?: XPAction;
    count?: number;
    timeWindowMinutes?: number;          // e.g., "clarify 5 items in 30 minutes"
    children?: ChallengeCondition[];
    operator?: 'AND' | 'OR';
}

export interface ActiveChallenge {
    challengeId: string;
    startedAt: string;
    expiresAt: string;
    progress: number;                    // 0.0 → 1.0
    target: number;                      // Absolute target count
    current: number;                     // Current count
    status: 'active' | 'completed' | 'expired';
}

// ─── Leaderboard ───

export interface LeaderboardEntry {
    uid: string;
    displayName: string;
    avatarUrl: string | null;
    level: number;
    gtdHealthScore: number;              // Primary ranking metric — NOT task count
    weeklyXP: number;                    // Secondary ranking (this week's XP)
    currentStreak: number;               // Days
    rank: number;
}

export type LeaderboardScope = 'global' | 'friends';
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';
