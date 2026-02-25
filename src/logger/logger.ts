// logger/logger.ts
// Structured application logger for Life To Do.
//
// Levels (in ascending severity):
//   debug  — dev-only verbose tracing (stripped in production)
//   info   — key user actions and state transitions
//   warn   — degraded functionality (non-fatal, user may notice)
//   error  — route to errorReporter + console.error
//
// Log entries are stored in the in-memory circular buffer (logStore.ts)
// and printed to the browser console at the appropriate level.

import { pushLog, type LogLevel } from './logStore'
import { reportNativeError }      from '@/errors/errorReporter'
import type { ErrorCode }         from '@/errors/types'

// ── Config ────────────────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === 'development'
const PREFIX = '[Life To Do]'

// ── Core logger factory ───────────────────────────────────────────────────────

function makeEntry(level: LogLevel, message: string, args: unknown[]) {
  return { level, message, args, ts: Date.now() }
}

// ── Singleton logger ──────────────────────────────────────────────────────────

export const logger = {
  /**
   * Verbose traces — dev-only, stripped from production builds.
   * Use for render cycles, query timings, state diffs.
   */
  debug(message: string, ...args: unknown[]): void {
    if (!IS_DEV) return
    console.debug(`${PREFIX} ${message}`, ...args)
    pushLog(makeEntry('debug', message, args))
  },

  /**
   * Key lifecycle events — always on, keep noisy calls to a minimum.
   * Use for boot steps, navigation, significant state transitions.
   */
  info(message: string, ...args: unknown[]): void {
    console.info(`${PREFIX} ${message}`, ...args)
    pushLog(makeEntry('info', message, args))
  },

  /**
   * Non-fatal degradation — something isn't working as intended,
   * but the user can continue. Use for missing optional APIs,
   * cache misses, retry attempts.
   */
  warn(message: string, ...args: unknown[]): void {
    console.warn(`${PREFIX} ${message}`, ...args)
    pushLog(makeEntry('warn', message, args))
  },

  /**
   * Fatal or near-fatal errors — always routes to errorReporter.
   * @param code  GTD error code (used for structured reporting)
   */
  error(
    message:   string,
    code:      ErrorCode = 'RENDER_ERROR',
    err?:      unknown,
    context?:  Record<string, string>,
  ): void {
    console.error(`${PREFIX} [${code}] ${message}`, err ?? '')
    pushLog(makeEntry('error', `[${code}] ${message}`, [err]))
    if (err !== undefined) {
      void reportNativeError(code, err, { message, ...context })
    }
  },
}
