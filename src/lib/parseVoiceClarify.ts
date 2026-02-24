// lib/parseVoiceClarify.ts
// Free-tier voice clarify keyword parser.
// Single responsibility: convert a natural-language clarification string into
// a VoiceClarifyResult by matching against keyword dictionaries.
// No UI logic, no React, no DB calls — pure function for easy testing.

import { VOICE_CLARIFY_KEYWORDS } from '@/constants/gtd'
import type { VoiceClarifyResult, ActionDestination, EnergyLevel, TimeEstimate } from '@/types'

/**
 * Parse a natural-language clarification utterance.
 *
 * @param text        The transcribed clarification speech (e.g. "next action at computer medium 15 min")
 * @param projectNames Map of projectId → name for fuzzy project matching
 * @returns Partial VoiceClarifyResult with confidence score
 */
export function parseVoiceClarify(
  text: string,
  projectNames: Record<string, string> = {},
): VoiceClarifyResult {
  const lower      = text.toLowerCase().trim()
  let matchCount   = 0
  let totalChecked = 0

  const result: VoiceClarifyResult = { confidence: 0 }

  // ── Destination ─────────────────────────────────────────────────────────────
  totalChecked++
  const destEntries = Object.entries(VOICE_CLARIFY_KEYWORDS.destination) as Array<
    [ActionDestination, readonly string[]]
  >
  for (const [dest, keywords] of destEntries) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.destination = dest
      matchCount++
      break
    }
  }

  // ── Context ──────────────────────────────────────────────────────────────────
  totalChecked++
  const ctxEntries = Object.entries(VOICE_CLARIFY_KEYWORDS.context) as Array<
    [string, readonly string[]]
  >
  for (const [ctxId, keywords] of ctxEntries) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.contextId = ctxId
      matchCount++
      break
    }
  }

  // ── Energy ───────────────────────────────────────────────────────────────────
  totalChecked++
  const energyEntries = Object.entries(VOICE_CLARIFY_KEYWORDS.energy) as Array<
    [EnergyLevel, readonly string[]]
  >
  for (const [level, keywords] of energyEntries) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.energy = level
      matchCount++
      break
    }
  }

  // ── Time estimate ────────────────────────────────────────────────────────────
  totalChecked++
  const timeEntries = Object.entries(VOICE_CLARIFY_KEYWORDS.time) as Array<
    [string, readonly string[]]
  >
  for (const [mins, keywords] of timeEntries) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.timeEstimate = Number(mins) as TimeEstimate
      matchCount++
      break
    }
  }

  // ── Project name (fuzzy) ─────────────────────────────────────────────────────
  totalChecked++
  const projectEntries = Object.entries(projectNames)
  for (const [id, name] of projectEntries) {
    const nameLower = name.toLowerCase()
    // Check if any word of the project name appears in the utterance
    const words = nameLower.split(/\s+/).filter(w => w.length > 3)
    const matched = words.some(w => lower.includes(w))
    if (matched) {
      result.projectId   = id
      result.projectName = name
      matchCount++
      break
    }
  }
  // If no project matched in DB, look for "for [project]" pattern
  if (!result.projectId) {
    const forMatch = lower.match(/\bfor\s+(?:the\s+)?([a-z0-9 ]+?)(?:\s+project)?\b/)
    if (forMatch) {
      result.projectName = forMatch[1].trim()
      matchCount += 0.5
    }
  }

  // ── Confidence score ─────────────────────────────────────────────────────────
  // Each field that matched increases confidence proportionally
  result.confidence = totalChecked > 0
    ? Math.min(matchCount / totalChecked, 1)
    : 0

  return result
}
