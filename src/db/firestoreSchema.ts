// src/db/firestoreSchema.ts
// Documentation for Firestore gamification schema additions

/**
 * users/{uid}/
 * ├── ...existing...
 * ├── xp_events/          — XPEvent documents (write-heavy, read via aggregation)
 * ├── achievements/       — UnlockedAchievement documents
 * ├── challenges/         — ActiveChallenge documents
 * ├── gamification_state  — Single document (cached aggregation)
 * └── leaderboard_entry   — Single document (public, for leaderboard queries)
 */
