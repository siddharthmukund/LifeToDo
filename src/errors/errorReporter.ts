// errors/errorReporter.ts
// Writes structured errors to db.error_log (IndexedDB — local only, no telemetry).
// Optionally surfaces to the logger for console output.
// Prunes log entries older than 30 days.

import { db } from '@/lib/db'
import type { GTDError } from './types'

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Report an error to the local error log.
 * Safe to call from any context (store, hooks, ErrorBoundary).
 * Never throws — errors in the reporter are swallowed silently.
 */
export async function reportError(error: GTDError): Promise<void> {
  try {
    await db.error_log.add({
      id:      crypto.randomUUID(),
      code:    error.code,
      message: error.message,
      stack:   error.stack,
      ts:      error.ts ?? Date.now(),
      context: error.context,
    })
  } catch {
    // error_log write failure must never crash the app
  }
}

/**
 * Convert a native Error to a GTDError and report it.
 *
 * @example
 * try { await db.inbox_items.add(item) }
 * catch (err) { await reportNativeError('CAPTURE_FAILED', err) }
 */
export async function reportNativeError(
  code:     GTDError['code'],
  err:      unknown,
  context?: Record<string, string>,
): Promise<void> {
  const message = err instanceof Error ? err.message : String(err)
  const stack   = err instanceof Error ? err.stack   : undefined
  const { ERROR_USER_MESSAGES } = await import('./types')
  await reportError({
    code,
    message,
    stack,
    userMsg: ERROR_USER_MESSAGES[code],
    context,
    ts: Date.now(),
  })
}

/**
 * Prune error log entries older than `days` days.
 */
export async function pruneErrorLog(days = 30): Promise<void> {
  try {
    const cutoff = Date.now() - days * 86_400_000
    await db.error_log.where('ts').below(cutoff).delete()
  } catch { /* non-critical */ }
}
