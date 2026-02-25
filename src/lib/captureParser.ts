// lib/captureParser.ts
// Free-tier GTD capture parser — pure function, no network, no LLM.
// Extracts GTD metadata from natural-language text using keyword matching.
// Used by useAICaptureParse when tier === 'free', or as fallback when AICapturePlugin
// is unavailable.
//
// For Pro users the AICapturePlugin (src/plugins/integrations/AICapturePlugin.ts)
// wraps this with an LLM call and higher confidence scores.

import type { EnergyLevel, TimeEstimate, ActionDestination } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ParsedCapture {
  raw:           string
  destination?:  ActionDestination
  energy?:       EnergyLevel
  timeEstimate?: TimeEstimate
  projectName?:  string
  contextHint?:  string         // e.g. '@home', '@computer'
  waitingFor?:   string         // person name after "waiting for" / "ask"
  confidence:    number         // 0-1
}

// ── Keyword tables ────────────────────────────────────────────────────────────

const DESTINATION_PATTERNS: Array<{ re: RegExp; dest: ActionDestination }> = [
  { re: /\b(waiting for|waiting on|asked|ask)\b/i,            dest: 'waiting_for'  },
  { re: /\b(someday|maybe|one day|eventually)\b/i,            dest: 'someday'      },
  { re: /\b(trash|delete|remove|ignore|skip)\b/i,             dest: 'trash'        },
  { re: /\b(project:|project\s+\w)/i,                         dest: 'project'      },
  { re: /\b(reference|read later|file|save for later)\b/i,    dest: 'reference'    },
  { re: /\b(done|completed|finished)\b/i,                     dest: 'complete'     },
]

const ENERGY_PATTERNS: Array<{ re: RegExp; energy: EnergyLevel }> = [
  { re: /\b(focus|deep work|important|complex|hard|creative)\b/i, energy: 'high'   },
  { re: /\b(quick|easy|simple|light|small|low effort)\b/i,        energy: 'low'    },
]

const TIME_PATTERNS: Array<{ re: RegExp; estimate: TimeEstimate }> = [
  { re: /\b([1-4]|[1-9]\s*min(?:ute)?s?)\b/i,                 estimate: 5  },
  { re: /\b(1[0-4]\s*min(?:ute)?s?|~?15\s*min)\b/i,           estimate: 15 },
  { re: /\b(2[0-9]|~?30\s*min(?:ute)?s?|half\s*hour)\b/i,     estimate: 30 },
  { re: /\b([4-9][0-9]|~?1\s*h(?:our)?)\b/i,                  estimate: 60 },
  { re: /\b([2-9]\s*h(?:ours?)?|afternoon|morning)\b/i,        estimate: 90 },
]

const CONTEXT_RE = /@[\w-]+/

const WAITING_RE = /(?:waiting for|ask|asked|waiting on)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i

const PROJECT_NAME_RE = /project[:\s]+([^,\.]+)/i

// ── Core parser ───────────────────────────────────────────────────────────────

/**
 * Parse a natural-language capture string into GTD metadata.
 * Returns a `ParsedCapture` with a confidence score (0-1).
 *
 * @example
 * parseCapture('Call John about proposal — 15 min @phone')
 * // → { destination: 'next_action', energy: undefined, timeEstimate: 15,
 * //     contextHint: '@phone', confidence: 0.7 }
 */
export function parseCapture(text: string): ParsedCapture {
  const result: ParsedCapture = { raw: text, confidence: 0 }
  let fieldsFound = 0

  // Destination
  for (const { re, dest } of DESTINATION_PATTERNS) {
    if (re.test(text)) { result.destination = dest; fieldsFound++; break }
  }
  if (!result.destination) result.destination = 'next_action'  // sensible default

  // Energy
  for (const { re, energy } of ENERGY_PATTERNS) {
    if (re.test(text)) { result.energy = energy; fieldsFound++; break }
  }

  // Time estimate
  for (const { re, estimate } of TIME_PATTERNS) {
    if (re.test(text)) { result.timeEstimate = estimate; fieldsFound++; break }
  }

  // Context hint (@tag)
  const ctxMatch = text.match(CONTEXT_RE)
  if (ctxMatch) { result.contextHint = ctxMatch[0]; fieldsFound++ }

  // Waiting-for person
  const waitMatch = text.match(WAITING_RE)
  if (waitMatch) { result.waitingFor = waitMatch[1]; fieldsFound++ }

  // Project name
  const projMatch = text.match(PROJECT_NAME_RE)
  if (projMatch) { result.projectName = projMatch[1].trim(); fieldsFound++ }

  // Confidence: 0.35 base + 0.1 per extracted field, capped at 0.75
  // (Pro LLM parser can exceed 0.75 and reach 0.95+)
  result.confidence = Math.min(0.35 + fieldsFound * 0.10, 0.75)

  return result
}
