# Gamification System Architecture

## Overview
The gamification system is designed as a modular, additive layer to the main "Life To Do" app. It rewards consistent GTD discipline rather than simply creating empty tasks, directly mitigating "busywork gamification" anti-patterns.

## Core Layers
The system is built on these foundational pillars:
1. **XP Engine (`xpEngine.ts`, `xpMiddleware.ts`)**: Ingests predefined GTD analytics events. Includes built-in diminishing returns per action type per day to stop spam-clicking for points.
2. **Streak Manager (`streakManager.ts`, `useStreak.ts`)**: Tracks "Daily Practice" across consecutive days. Rewards streak multipliers (1.0x to 2.5x) and handles grace days for reasonable breaks.
3. **Achievements Engine (`achievementChecker.ts`, `achievements.ts`)**: Processes unlocked badges. Some are standard volume stats ("Complete 100 projects"), some are precise event configurations ("Process an inbox item after midnight").
4. **Daily Challenges (`challengeEngine.ts`, `challenges.ts`)**: Selects rotational quests (more available to Pro users). Expire and regenerate nightly. Fired seamlessly alongside XP middleware.
5. **Leaderboards (`leaderboardService.ts`)**: Opt-in global Firestore rankings tracking GTD Health Score, not sheer volume, for equitable comparisons.
6. **Celebration UI (`useCelebration.ts`, `CelebrationOverlay.tsx`)**: The UI feedback layer. Intentionally reads the `adhdMode` config to automatically prune and scale down screen-takeover motion effects.

## The Store
`gamificationStore.ts` (Zustand)
Holds all live synced client data:
- `preferences`: User settings for toggling systems on/off.
- `totalXP`: Cash pool. 
- `currentLevel`: Calculated automatically. 
- `currentStreak`: Active streak stats.
- `achievements`: User's unlocked achievements.
- `activeChallenges`: Today's queue of challenges.

## Data Persistence Strategy
1. **Dexie.js (Local)**: Fast read/writes for offline-first support. We added `xp_events`, `achievements_unlocked`, `active_challenges`, and `gamification_state` to version 5 of the schema.
2. **Firestore (Remote - Pro)**: Stores the `leaderboard_entry` documents for synchronous cross-user queries.

## Adding New Gamification Elements
1. **New Action Event**: Add to `GTDEventName` in `analytics/events.ts`. Register it to `isValidXPAction` inside `xpMiddleware.ts`. Add a base value in `calculateXP`.
2. **New Achievement**: Push a new `AchievementDefinition` object into `achievements.ts`. If it uses complex conditionals, intercept its ID check within `achievementChecker.ts`.
3. **New Challenge**: Push a new `ChallengeDefinition` object into `challenges.ts`.

## Opt-out and Accessibility
Complete feature kill-switches are housed in `<GamificationSettings />`. These kill-switches affect all API levels — tracking, processing, and UI rendering entirely halt if Gamification is disabled. 
If `adhdMode` is toggled inside the main settings screen, gamification's global "Celebration Intensity" is forcefully down-stepped to `subtle` so full-screen overlays never break focus.
