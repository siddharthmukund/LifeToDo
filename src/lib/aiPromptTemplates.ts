// lib/aiPromptTemplates.ts
// LLM prompt templates for Pro-tier AI capture parsing.
// These are sent to the server-side AI endpoint (future).
// Kept separate from the plugin so they can be unit-tested and iterated
// without touching network code.

// ── System prompt ─────────────────────────────────────────────────────────────

export const AI_CAPTURE_SYSTEM_PROMPT = `
You are a GTD (Getting Things Done) assistant. Your job is to parse natural-language
capture text and extract structured metadata for a personal productivity app.

Return ONLY valid JSON with this exact schema:
{
  "destination": "next_action" | "waiting_for" | "project" | "someday" | "reference" | "trash" | "complete",
  "energy": "high" | "medium" | "low" | null,
  "timeEstimate": 5 | 15 | 30 | 60 | 90 | null,  // minutes
  "projectName": string | null,
  "contextHint": string | null,  // e.g. "@phone", "@home", "@computer"
  "waitingFor": string | null,   // person name if delegated
  "confidence": number            // 0-1, your confidence in the extraction
}

Rules:
- Default destination is "next_action" when unclear
- Never include PII beyond first names
- confidence >= 0.8 means the user can auto-accept without reviewing
- confidence < 0.8 means show confirmation UI
`.trim()

// ── User message template ─────────────────────────────────────────────────────

export function buildCapturePrompt(rawText: string): string {
  return `Parse this GTD capture: "${rawText}"`
}

// ── Response parser ───────────────────────────────────────────────────────────

export interface AIParseResponse {
  destination?:  string
  energy?:       string
  timeEstimate?: number
  projectName?:  string
  contextHint?:  string
  waitingFor?:   string
  confidence:    number
}

export function parseAIResponse(json: unknown): AIParseResponse {
  if (typeof json !== 'object' || json === null) {
    return { confidence: 0 }
  }
  const r = json as Record<string, unknown>
  return {
    destination:   typeof r.destination  === 'string' ? r.destination  : undefined,
    energy:        typeof r.energy       === 'string' ? r.energy       : undefined,
    timeEstimate:  typeof r.timeEstimate === 'number' ? r.timeEstimate : undefined,
    projectName:   typeof r.projectName  === 'string' ? r.projectName  : undefined,
    contextHint:   typeof r.contextHint  === 'string' ? r.contextHint  : undefined,
    waitingFor:    typeof r.waitingFor   === 'string' ? r.waitingFor   : undefined,
    confidence:    typeof r.confidence   === 'number' ? r.confidence   : 0,
  }
}

// ── Confidence threshold ──────────────────────────────────────────────────────

/** Minimum confidence to auto-fill without user confirmation */
export const AUTO_FILL_CONFIDENCE = 0.8
