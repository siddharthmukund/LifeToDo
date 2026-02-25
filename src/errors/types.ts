// errors/types.ts
// Structured error taxonomy for Life To Do — iCCW #4 Clarity layer.
// Every error has a machine-readable code, a dev message, and a user-friendly message.
// Two severity tiers:
//   - CRITICAL: blocks the user (CAPTURE_FAILED, STORAGE_FULL, RENDER_ERROR)
//   - DEGRADED:  gracefully degrades (SYNC_FAILED, PLUGIN_ERROR, PARSE_ERROR)

// ── Error codes ───────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  CAPTURE_FAILED: 'CAPTURE_FAILED',   // failed to write inbox item to IndexedDB
  SYNC_FAILED:    'SYNC_FAILED',      // network sync cycle failed
  STORAGE_FULL:   'STORAGE_FULL',     // IndexedDB quota exceeded
  PLUGIN_ERROR:   'PLUGIN_ERROR',     // plugin initialize/teardown threw
  PARSE_ERROR:    'PARSE_ERROR',      // AI/keyword parser returned unexpected shape
  RENDER_ERROR:   'RENDER_ERROR',     // React render threw (caught by ErrorBoundary)
} as const

export type ErrorCode = keyof typeof ERROR_CODES

// ── Typed error interface ─────────────────────────────────────────────────────

export interface GTDError {
  code:      ErrorCode
  /** Technical message for logs */
  message:   string
  /** Human-friendly message shown in UI */
  userMsg:   string
  stack?:    string
  context?:  Record<string, string>
  ts?:       number
}

// ── User-facing messages per code ─────────────────────────────────────────────

export const ERROR_USER_MESSAGES: Record<ErrorCode, string> = {
  CAPTURE_FAILED: 'Your item couldn\'t be saved right now. It will retry automatically.',
  SYNC_FAILED:    'Sync is paused — your data is safe locally.',
  STORAGE_FULL:   'Your device storage is full. Please free up space.',
  PLUGIN_ERROR:   'A feature failed to load. Core functionality is unaffected.',
  PARSE_ERROR:    'Couldn\'t read that capture. Try typing it manually.',
  RENDER_ERROR:   'Something went wrong. Pull to refresh.',
}

// ── Error factory ─────────────────────────────────────────────────────────────

export function createGTDError(
  code:     ErrorCode,
  message:  string,
  context?: Record<string, string>,
): GTDError {
  return {
    code,
    message,
    userMsg: ERROR_USER_MESSAGES[code],
    context,
    ts: Date.now(),
  }
}
