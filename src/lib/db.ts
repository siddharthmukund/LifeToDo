// lib/db.ts
// Single source of truth for all local storage.
// Dexie.js wraps IndexedDB with a clean Promise-based API.
// All data lives here first; Firestore sync is additive (Pro tier, future).

import Dexie, { type Table } from 'dexie'
import type {
  InboxItem,
  Action,
  Project,
  Context,
  Review,
  Settings,
  AnalyticsEvent,
  PerfLog,
  ErrorLog,
  SyncQueueItem,
  UserProfile,
  SubscriptionRecord,
  LifetimeGTDStats,
  DeletionRequest,
  ConsentRecord,
  BillingEvent,
} from '@/types'
import type {
  XPEvent,
  UnlockedAchievement,
  ActiveChallenge,
  UserGamificationState
} from '@/types/gamification'

class GTDDatabase extends Dexie {
  // ── Core GTD tables ───────────────────────────────────────────────────────
  inbox_items!: Table<InboxItem>
  actions!: Table<Action>
  projects!: Table<Project>
  contexts!: Table<Context>
  reviews!: Table<Review>
  settings!: Table<Settings>

  // ── Observability tables (iCCW #4) ────────────────────────────────────────
  analytics_events!: Table<AnalyticsEvent>
  perf_logs!: Table<PerfLog>
  error_log!: Table<ErrorLog>
  sync_queue!: Table<SyncQueueItem>

  // ── Identity & account tables (iCCW #6) ───────────────────────────────────
  profile!: Table<UserProfile>
  subscription!: Table<SubscriptionRecord>
  lifetime_stats!: Table<LifetimeGTDStats>
  deletion_requests!: Table<DeletionRequest>

  // ── Compliance tables (iCCW #6 D6) ────────────────────────────────────────
  consent_log!: Table<ConsentRecord>
  billing_events!: Table<BillingEvent>

  // ── Gamification tables (iCCW #12) ────────────────────────────────────────
  xp_events!: Table<XPEvent>
  achievements_unlocked!: Table<UnlockedAchievement>
  active_challenges!: Table<ActiveChallenge>
  gamification_state!: Table<UserGamificationState>

  constructor() {
    super('GTDLifeDB')

    // v1 schema — indexed fields listed after '&id'
    // '&' = unique primary key, no prefix = regular index
    this.version(1).stores({
      inbox_items: '&id, capturedAt, status, syncStatus',
      actions: '&id, projectId, contextId, status, energy, timeEstimate, scheduledDate, updatedAt, syncStatus',
      projects: '&id, status, updatedAt, syncStatus',
      contexts: '&id, sortOrder',
      reviews: '&id, completedAt',
      settings: '&id',
    })

    // v2 schema — adds observability + sync queue tables (iCCW #4 Enhancement Layer)
    // Existing table schemas are unchanged; only new tables are declared here.
    this.version(2).stores({
      inbox_items: '&id, capturedAt, status, syncStatus',
      actions: '&id, projectId, contextId, status, energy, timeEstimate, scheduledDate, updatedAt, syncStatus',
      projects: '&id, status, updatedAt, syncStatus',
      contexts: '&id, sortOrder',
      reviews: '&id, completedAt',
      settings: '&id',
      analytics_events: '&id, name, ts',
      perf_logs: '&id, metric, ts',
      error_log: '&id, code, ts',
      sync_queue: '&id, tableName, operation, ts',
    })

    // v3 schema — adds identity & account tables (iCCW #6 User Profile)
    // All existing tables carried forward unchanged.
    this.version(3).stores({
      inbox_items: '&id, capturedAt, status, syncStatus',
      actions: '&id, projectId, contextId, status, energy, timeEstimate, scheduledDate, updatedAt, syncStatus',
      projects: '&id, status, updatedAt, syncStatus',
      contexts: '&id, sortOrder',
      reviews: '&id, completedAt',
      settings: '&id',
      analytics_events: '&id, name, ts',
      perf_logs: '&id, metric, ts',
      error_log: '&id, code, ts',
      sync_queue: '&id, tableName, operation, ts',
      // New in v3:
      profile: '&uid',
      subscription: '&uid',
      lifetime_stats: '&uid',
      deletion_requests: '++id, uid, requestedAt, status',
    })

    // v4 schema — adds consent_log + billing_events (iCCW #6 D6 compliance tables)
    // All existing tables carried forward unchanged.
    this.version(4).stores({
      inbox_items: '&id, capturedAt, status, syncStatus',
      actions: '&id, projectId, contextId, status, energy, timeEstimate, scheduledDate, updatedAt, syncStatus',
      projects: '&id, status, updatedAt, syncStatus',
      contexts: '&id, sortOrder',
      reviews: '&id, completedAt',
      settings: '&id',
      analytics_events: '&id, name, ts',
      perf_logs: '&id, metric, ts',
      error_log: '&id, code, ts',
      sync_queue: '&id, tableName, operation, ts',
      profile: '&uid',
      subscription: '&uid',
      lifetime_stats: '&uid',
      deletion_requests: '++id, uid, requestedAt, status',
      // New in v4:
      consent_log: '&id, type, timestamp',
      billing_events: '&id, subscriptionId, type, timestamp',
    })

    // v5 schema — adds gamification tables (iCCW #12)
    this.version(5).stores({
      inbox_items: '&id, capturedAt, status, syncStatus',
      actions: '&id, projectId, contextId, status, energy, timeEstimate, scheduledDate, updatedAt, syncStatus',
      projects: '&id, status, updatedAt, syncStatus',
      contexts: '&id, sortOrder',
      reviews: '&id, completedAt',
      settings: '&id',
      analytics_events: '&id, name, ts',
      perf_logs: '&id, metric, ts',
      error_log: '&id, code, ts',
      sync_queue: '&id, tableName, operation, ts',
      profile: '&uid',
      subscription: '&uid',
      lifetime_stats: '&uid',
      deletion_requests: '++id, uid, requestedAt, status',
      consent_log: '&id, type, timestamp',
      billing_events: '&id, subscriptionId, type, timestamp',
      // New in v5:
      xp_events: '&id, userId, timestamp, action',
      achievements_unlocked: '&achievementId',
      active_challenges: '&challengeId',
      gamification_state: '&userId', // assuming primary key is userId or we can just use 1 row
    })

    // Ensure Date objects are properly reconstructed from IndexedDB
    this.inbox_items.hook('reading', obj => {
      if (obj.capturedAt) obj.capturedAt = new Date(obj.capturedAt)
      return obj
    })
    this.actions.hook('reading', obj => {
      if (obj.createdAt) obj.createdAt = new Date(obj.createdAt)
      if (obj.updatedAt) obj.updatedAt = new Date(obj.updatedAt)
      if (obj.completedAt) obj.completedAt = new Date(obj.completedAt)
      if (obj.scheduledDate) obj.scheduledDate = new Date(obj.scheduledDate)
      if (obj.waitingFor?.followUpDate) {
        obj.waitingFor.followUpDate = new Date(obj.waitingFor.followUpDate)
      }
      return obj
    })
    this.projects.hook('reading', obj => {
      if (obj.createdAt) obj.createdAt = new Date(obj.createdAt)
      if (obj.updatedAt) obj.updatedAt = new Date(obj.updatedAt)
      return obj
    })
    this.reviews.hook('reading', obj => {
      if (obj.completedAt) obj.completedAt = new Date(obj.completedAt)
      return obj
    })
  }
}

// Singleton — import this everywhere instead of new GTDDatabase()
export const db = new GTDDatabase()

// ── Convenience Query Helpers ───────────────────────────────────────────────

/**
 * Query unprocessed inbox items with optional context/energy filters.
 * Used by the store to keep filtering logic out of components.
 */
export async function queryInbox(filters?: { contextId?: string | null; energy?: string | null }): Promise<InboxItem[]> {
  let collection = db.inbox_items.where('status').anyOf(['raw', 'clarifying'])
  const results = await collection.reverse().sortBy('capturedAt')
  if (!filters) return results
  return results.filter(i => {
    if (filters.contextId && i.nlpMetadata?.contexts?.length && !i.nlpMetadata.contexts.includes(filters.contextId)) return false
    return true
  })
}

/** All unprocessed inbox items, newest first */
export async function getInboxItems(): Promise<InboxItem[]> {
  return db.inbox_items
    .where('status')
    .anyOf(['raw', 'clarifying'])
    .reverse()
    .sortBy('capturedAt')
}

/** Active next actions — optionally filtered */
export async function getNextActions(filters?: {
  contextId?: string
  energy?: string
  maxTime?: number
}): Promise<Action[]> {
  let collection = db.actions.where('status').equals('active')

  const results = await collection.toArray()

  return results.filter(a => {
    if (filters?.contextId && a.contextId !== filters.contextId) return false
    if (filters?.energy && a.energy !== filters.energy) return false
    if (filters?.maxTime && a.timeEstimate > filters.maxTime) return false
    return true
  })
}

/** All active projects with their next action attached */
export async function getProjectsWithNextActions(): Promise<
  Array<Project & { nextAction: Action | null }>
> {
  const projects = await db.projects
    .where('status')
    .equals('active')
    .sortBy('updatedAt')

  return Promise.all(
    projects.reverse().map(async p => {
      const nextAction = p.nextActionId
        ? (await db.actions.get(p.nextActionId)) ?? null
        : null
      return { ...p, nextAction }
    })
  )
}

/** Current review streak (0 if never reviewed) */
export async function getCurrentStreak(): Promise<number> {
  const last = await db.reviews.orderBy('completedAt').last()
  return last?.streakCount ?? 0
}
