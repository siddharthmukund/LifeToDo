// ── Core GTD Entity Types ───────────────────────────────────────────────────

export type SyncStatus = 'local' | 'queued' | 'synced'
export type ActionStatus = 'active' | 'complete' | 'waiting' | 'someday'
export type ProjectStatus = 'active' | 'someday' | 'complete' | 'archived'
export type EnergyLevel = 'high' | 'medium' | 'low'
export type TimeEstimate = 5 | 15 | 30 | 60 | 90
export type CaptureSource = 'voice' | 'text' | 'share'
export type InboxItemStatus = 'raw' | 'clarifying' | 'processed'

export type ActionDestination =
  | 'next_action'
  | 'waiting_for'
  | 'project'
  | 'someday'
  | 'reference'
  | 'trash'
  | 'complete'

// ── Entity Interfaces ───────────────────────────────────────────────────────

export interface InboxItem {
  id: string
  text: string
  capturedAt: Date
  source: CaptureSource
  status: InboxItemStatus
  syncStatus: SyncStatus
  nlpMetadata?: { dueDate: Date | null, projects: string[], contexts: string[] }
}

export interface Action {
  id: string
  text: string
  projectId?: string
  contextId: string
  energy: EnergyLevel
  timeEstimate: TimeEstimate
  status: ActionStatus
  waitingFor?: { person: string; followUpDate: Date }
  scheduledDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  syncStatus: SyncStatus
}

export interface Project {
  id: string
  name: string
  outcome: string
  status: ProjectStatus
  nextActionId?: string
  areaOfFocus?: string
  createdAt: Date
  updatedAt: Date
  syncStatus: SyncStatus
}

export interface Context {
  id: string
  name: string
  emoji?: string
  isDefault: boolean
  sortOrder: number
}

export interface Review {
  id: string
  completedAt: Date
  streakCount: number
  itemsProcessed: number
  intentionsSet: string[]
  durationMinutes: number
}

export interface Settings {
  id: 'singleton'
  reviewDay: number              // 0 = Sunday
  reviewTime: string             // "HH:MM" 24h
  notificationsEnabled: boolean
  tier: 'free' | 'pro'
  userId?: string                // legacy — use firebaseUid or anonId going forward
  /** Firebase UID — set after first authentication */
  firebaseUid?: string
  /** Permanent local UUID — exists before and after auth, offline fallback */
  anonId?: string
  theme: 'light' | 'dark' | 'system'
  onboardingComplete: boolean
  adhdMode: boolean              // limits lists to 7, scales fonts 1.5×
  lastEnergyLevel: EnergyLevel | null  // persisted energy filter
}

// ── User Profile & Account Types (iCCW #6) ──────────────────────────────────

export type UserRole = 'professional' | 'freelancer' | 'student' | 'custom'

export interface WorkingHours {
  enabled: boolean
  days: number[]       // 0 = Sunday … 6 = Saturday
  startTime: string    // HH:mm 24h
  endTime: string      // HH:mm 24h
}

export interface ReviewScheduleConfig {
  dayOfWeek: number              // 0-6
  timeOfDay: string              // HH:mm
  reminderMinutesBefore: number  // 0 | 15 | 30 | 60
}

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string
  avatarUrl: string | null
  bio: string              // max 200 chars
  timezone: string         // IANA e.g. 'Asia/Kolkata'
  role: UserRole
  workingHours: WorkingHours
  reviewSchedule: ReviewScheduleConfig
  defaultContexts: string[]
  createdAt: string        // ISO-8601
  updatedAt: string        // ISO-8601
}

export interface SubscriptionRecord {
  uid: string
  tier: 'free' | 'pro'
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: string | null   // ISO-8601
  cancelAtPeriodEnd: boolean
  /** ISO-8601 — used to detect 7-day offline degradation */
  lastVerifiedAt: string
}

export type GTDMilestone =
  | 'first_capture'
  | 'first_inbox_zero'
  | 'first_weekly_review'
  | '10_weekly_reviews'
  | '52_weekly_reviews'
  | '100_tasks_completed'
  | '500_tasks_completed'
  | '1000_tasks_completed'
  | '30_day_streak'
  | '90_day_streak'
  | '365_day_streak'

export interface HealthScoreComponents {
  inboxProcessing: number
  reviewConsistency: number
  actionCompletion: number
  inboxZeroFrequency: number
  systemFreshness: number
}

export interface LifetimeGTDStats {
  uid: string
  // All-time totals
  totalItemsCaptured: number
  totalItemsClarified: number
  totalNextActionsCompleted: number
  totalProjectsCompleted: number
  totalWeeklyReviewsCompleted: number
  totalTwoMinuteTasksDone: number
  totalInboxZeroAchievements: number
  // Streaks
  currentWeeklyReviewStreak: number
  longestWeeklyReviewStreak: number
  currentDailyActivityStreak: number
  longestDailyActivityStreak: number
  // Rolling 30-day averages
  avgInboxProcessingHours: number
  avgDailyActionsCompleted: number
  avgWeeklyReviewDurationMinutes: number
  // Health score history
  healthScoreHistory: Array<{
    weekOf: string       // ISO-8601 Monday of that week
    score: number
    components: HealthScoreComponents
  }>
  // Milestones
  milestones: Array<{
    type: GTDMilestone
    achievedAt: string   // ISO-8601
  }>
  updatedAt: string      // ISO-8601
}

export interface DeletionRequest {
  id?: number            // auto-increment primary key
  uid: string
  requestedAt: string             // ISO-8601
  scheduledDeletionAt: string     // ISO-8601 (+7 days from requestedAt)
  status: 'pending' | 'cancelled' | 'completed'
  cancelledAt?: string            // ISO-8601
}

export type ConsentType =
  | 'analytics'
  | 'sync'
  | 'notifications'
  | 'crash_reporting'
  | 'core_processing'

export interface ConsentRecord {
  id: string
  type: ConsentType
  granted: boolean
  timestamp: string      // ISO-8601
  method: 'onboarding' | 'settings' | 'prompt'
  appVersion: string
}

export type BillingEventType =
  | 'payment_succeeded'
  | 'payment_failed'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'trial_started'
  | 'trial_ended'
  | 'upgrade'
  | 'downgrade'

export interface BillingEvent {
  id: string
  subscriptionId: string
  type: BillingEventType
  amount: number          // In cents (e.g. 499 = $4.99)
  currency: string        // ISO-4217 (e.g. 'usd')
  timestamp: string       // ISO-8601
  receiptUrl: string | null
}

// ── New types for refinement pass ───────────────────────────────────────────

/** Result from the voice-clarify keyword parser (Free) or Whisper/GPT (Pro) */
export interface VoiceClarifyResult {
  destination?: ActionDestination
  contextId?: string
  energy?: EnergyLevel
  timeEstimate?: TimeEstimate
  projectId?: string
  projectName?: string
  /** 0–1 confidence. Show confirmation UI when < 0.7 */
  confidence: number
}

/** Stale item counts across all GTD buckets */
export interface StaleCounts {
  inbox: number       // capturedAt > 7 days ago, still unprocessed
  someday: number     // createdAt > 30 days ago
  waitingFor: number  // updatedAt > 14 days ago
  total: number
}

/** ADHD-safe paginated list — hard cap at PAGE_SIZE (default 7) */
export interface PaginatedList<T> {
  items: T[]
  page: number
  totalPages: number
  totalItems: number
  hasMore: boolean
}

// ── Flow / UI Types ─────────────────────────────────────────────────────────

export interface ClarifyDecision {
  destination: ActionDestination
  contextId?: string
  energy?: EnergyLevel
  timeEstimate?: TimeEstimate
  scheduledDate?: Date
  nextActionText?: string    // used when destination = 'project'
  projectName?: string
  projectOutcome?: string
  waitingForPerson?: string
  waitingForDate?: Date
}

export interface ReviewSection {
  id: string
  phase: 'get_clear' | 'get_current' | 'get_creative'
  title: string
  description: string
  count: number
  items?: (Action | Project | InboxItem)[]
  completed: boolean
}

export interface WeeklyReviewData {
  sections: ReviewSection[]
  totalItems: number
  estimatedMinutes: number
  lastReviewDate: Date | null
  currentStreak: number
}

// ── Filter Types ────────────────────────────────────────────────────────────

export interface ActionFilters {
  contextId: string | null
  energy: EnergyLevel | null
  maxTime: TimeEstimate | null
}

// ── Analytics & Observability Types (iCCW #4) ────────────────────────────────

/** A single GTD behaviour event stored locally in Dexie — no PII */
export interface AnalyticsEvent {
  id: string
  name: string                                          // GTDEventName
  ts: number                                            // Date.now()
  props?: Record<string, string | number | boolean>
}

/** A Web Vitals or custom performance sample */
export interface PerfLog {
  id: string
  metric: string                                        // e.g. 'LCP', 'CLS', 'render_time'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  ts: number
}

/** A structured application error captured by the error boundary */
export interface ErrorLog {
  id: string
  code: string                                          // e.g. 'CAPTURE_FAILED'
  message: string
  stack?: string
  ts: number
  context?: Record<string, string>
}

/** An offline write queued for cloud sync (Pro tier, future) */
export interface SyncQueueItem {
  id: string
  tableName: string
  operation: 'add' | 'update' | 'delete'
  recordId: string
  payload?: string                                      // JSON-serialised record
  ts: number
  attempts: number
}
