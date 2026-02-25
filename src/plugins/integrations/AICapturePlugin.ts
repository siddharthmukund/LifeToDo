// plugins/integrations/AICapturePlugin.ts
// AI Smart Capture plugin — Pro tier.
// Free tier uses the keyword-based parser (src/lib/captureParser.ts).
// Pro tier upgrades to this plugin which calls an LLM endpoint for higher
// confidence structured parsing.
//
// Confidence gating:
//   ≥ 0.8  → auto-populate Clarify fields (single-tap confirm)
//   < 0.8  → show editable confirmation UI before committing

import type { AICapturePluginInterface, AICaptureResult } from '../types'

// ── Config ────────────────────────────────────────────────────────────────────

// Destination keyword → ActionDestination mapping used by the fallback parser
const DESTINATION_KEYWORDS: Record<string, string> = {
  'call':     'next_action',
  'email':    'next_action',
  'buy':      'next_action',
  'waiting':  'waiting_for',
  'wait':     'waiting_for',
  'project':  'project',
  'someday':  'someday',
  'maybe':    'someday',
  'trash':    'trash',
  'delete':   'trash',
}

const ENERGY_KEYWORDS: Record<string, string> = {
  'focus': 'high', 'deep': 'high', 'important': 'high',
  'quick': 'low',  'easy': 'low',  'simple':    'low',
}

// ── Keyword-based local parser (no network) ───────────────────────────────────

function localParse(text: string): AICaptureResult {
  const lower = text.toLowerCase()

  let destination: string | undefined
  for (const [kw, dest] of Object.entries(DESTINATION_KEYWORDS)) {
    if (lower.includes(kw)) { destination = dest; break }
  }

  let energy: string | undefined
  for (const [kw, level] of Object.entries(ENERGY_KEYWORDS)) {
    if (lower.includes(kw)) { energy = level; break }
  }

  // Time estimate from "5 min", "15 min", etc.
  const timeMatch = lower.match(/(\d+)\s*min/)
  const timeEstimate = timeMatch
    ? [5, 15, 30, 60, 90].find(t => t >= parseInt(timeMatch[1], 10)) ?? 30
    : undefined

  // Confidence based on how many fields were extracted
  const extracted = [destination, energy, timeEstimate].filter(Boolean).length
  const confidence = Math.min(0.4 + extracted * 0.15, 0.75)  // local parser caps at 0.75

  return { raw: text, destination, energy, timeEstimate, confidence }
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export const AICapturePlugin: AICapturePluginInterface = {
  id:   'ai-capture',
  name: 'AI Smart Capture',
  tier: 'pro',

  isAvailable(): boolean {
    return typeof window !== 'undefined'
  },

  async initialize(): Promise<void> {
    // Future: warm up the LLM endpoint, check API key in settings
  },

  async teardown(): Promise<void> {
    // Future: abort any in-flight API calls
  },

  /**
   * Parse natural-language text.
   * Currently uses the local keyword parser (always offline-safe).
   * Future: POST to /api/ai-parse when user has an active Pro subscription
   * and the result is cached locally to avoid re-parsing identical inputs.
   */
  async parse(text: string): Promise<AICaptureResult> {
    // TODO (Pro server side): replace with authenticated LLM call
    // const response = await fetch('/api/ai-parse', { method: 'POST', body: JSON.stringify({ text }) })
    // return response.json()
    return localParse(text)
  },
}
