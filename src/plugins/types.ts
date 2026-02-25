// plugins/types.ts
// Plugin interface contract — iCCW #4 Modularity layer.
// All Life To Do integrations implement LifeToDoPlugin.
// Core hooks access plugins via the registry; unknown plugins return a no-op.

export type PluginTier = 'free' | 'pro'

export type PluginStatus = 'registered' | 'initialized' | 'error' | 'unavailable'

// ── Base contract ─────────────────────────────────────────────────────────────

/**
 * Minimal interface every plugin must satisfy.
 * Specialised plugins extend this with domain-specific methods.
 */
export interface LifeToDoPlugin {
  /** Unique stable identifier — never changes between versions */
  readonly id:   string
  /** Human-readable display name */
  readonly name: string
  /** Minimum tier required to activate this plugin */
  readonly tier: PluginTier

  /** Called once after the app shell boots. Must not throw. */
  initialize(): Promise<void>

  /** Called on unmount / logout. Clean up listeners, timers, etc. */
  teardown(): Promise<void>

  /**
   * Runtime availability check.
   * Returns false if required permissions / APIs aren't present.
   * The registry uses this to skip initialize() for unavailable plugins.
   */
  isAvailable(): boolean
}

// ── Extended plugin types ─────────────────────────────────────────────────────

export interface CalendarPluginInterface extends LifeToDoPlugin {
  /** Fetch events from the device calendar for a date range */
  fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]>
  /** Add a GTD action as a calendar event */
  addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>
}

export interface AICapturePluginInterface extends LifeToDoPlugin {
  /**
   * Parse natural-language text into a structured GTD capture.
   * Returns confidence 0-1; UI should gate auto-fill on a threshold (e.g. 0.8).
   */
  parse(text: string): Promise<AICaptureResult>
}

// ── Domain types used by plugins ─────────────────────────────────────────────

export interface CalendarEvent {
  id:        string
  title:     string
  startAt:   Date
  endAt:     Date
  allDay:    boolean
  actionId?: string   // linked GTD action id
}

export interface AICaptureResult {
  raw:           string
  destination?:  string   // ActionDestination key
  contextId?:    string
  energy?:       string   // EnergyLevel
  timeEstimate?: number
  projectId?:    string
  projectName?:  string
  confidence:    number   // 0-1
}
