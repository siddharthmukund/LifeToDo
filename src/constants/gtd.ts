// constants/gtd.ts
// Single source of truth for all magic numbers and labels.
// Import these everywhere instead of hardcoding values.

import type { EnergyLevel, TimeEstimate } from '@/types'

// ── ADHD constraints ─────────────────────────────────────────────────────────
export const ADHD_MAX_ITEMS = 7

// ── Stale detection thresholds (days) ────────────────────────────────────────
export const STALE_THRESHOLDS = {
  inbox:      7,   // inbox items unclarified for 7+ days
  someday:    30,  // someday/maybe items not touched for 30+ days
  waitingFor: 14,  // waiting-for items not updated for 14+ days
} as const

// ── Energy display config ─────────────────────────────────────────────────────
export const ENERGY_CONFIG: Record<EnergyLevel, { label: string; icon: string; color: string; bg: string }> = {
  high:   { label: 'High',   icon: '⚡', color: '#EF4444', bg: 'bg-gtd-danger/20'  },
  medium: { label: 'Med',    icon: '🔸', color: '#F59E0B', bg: 'bg-gtd-warning/20' },
  low:    { label: 'Low',    icon: '🌱', color: '#22C55E', bg: 'bg-gtd-success/20' },
}

// ── Time estimate display ─────────────────────────────────────────────────────
export const TIME_CONFIG: Record<TimeEstimate, { label: string; minutes: number }> = {
  5:  { label: '5m',  minutes: 5  },
  15: { label: '15m', minutes: 15 },
  30: { label: '30m', minutes: 30 },
  60: { label: '1h',  minutes: 60 },
  90: { label: '90m', minutes: 90 },
}

// ── Voice clarify keywords → field values (Free tier) ─────────────────────────
export const VOICE_CLARIFY_KEYWORDS = {
  destination: {
    next_action:  ['next action', 'just do it', 'action item', 'task'],
    waiting_for:  ['waiting for', 'delegate', 'delegated', 'waiting on'],
    someday:      ['someday', 'maybe', 'some day', 'one day', 'later'],
    reference:    ['reference', 'fyi', 'save it', 'keep it', 'information'],
    trash:        ['trash', 'delete', 'remove', 'discard', 'ignore'],
    project:      ['project', 'multi-step', 'multiple steps'],
  },
  context: {
    'ctx-computer': ['computer', 'laptop', 'online', 'digital', 'email'],
    'ctx-office':   ['office', 'work', 'desk', 'meeting room'],
    'ctx-home':     ['home', 'house', 'at home'],
    'ctx-errands':  ['errands', 'out', 'shopping', 'store', 'pick up'],
    'ctx-calls':    ['call', 'phone', 'ring', 'dial'],
    'ctx-anywhere': ['anywhere', 'any context'],
  },
  energy: {
    high:   ['urgent', 'hard', 'complex', 'deep work', 'challenging', 'high energy', 'focus'],
    medium: ['medium', 'normal', 'moderate', 'regular'],
    low:    ['easy', 'quick', 'low energy', 'relaxed', 'simple', 'mindless'],
  },
  time: {
    5:  ['5 min', 'five min', 'quick', 'very fast', 'two min', '2 min'],
    15: ['15 min', 'fifteen min', 'quarter hour'],
    30: ['30 min', 'half hour', 'thirty min'],
    60: ['hour', '60 min', 'one hour'],
    90: ['90 min', 'hour and a half', 'ninety min'],
  },
} as const

// ── Review phases ─────────────────────────────────────────────────────────────
export const REVIEW_PHASE_LABELS = {
  get_clear:   'Get Clear',
  get_current: 'Get Current',
  get_creative:'Get Creative',
} as const

// ── Free tier limits ──────────────────────────────────────────────────────────
export const FREE_TIER = {
  maxProjects: 5,
  maxContexts: 3,   // custom contexts; default 6 are always available
} as const
