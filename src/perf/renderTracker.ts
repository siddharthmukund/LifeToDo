// perf/renderTracker.ts
// Lightweight render-time measurement utilities.
// Use measureRender() inside useEffect (after paint) to log component render durations.
// Stored in db.perf_logs; used by the Insights page (Pro tier).

import { db } from '@/lib/db'
import type { PerfLog } from '@/types'

// ── Rating thresholds (ms) ────────────────────────────────────────────────────
const THRESHOLDS: Record<string, [number, number]> = {
  default: [100, 300],   // good <100ms, needs-improvement 100-300ms, poor >300ms
  list:    [50,  150],   // stricter for list renders
  modal:   [80,  200],
}

function rateMs(ms: number, key = 'default'): PerfLog['rating'] {
  const [good, ni] = THRESHOLDS[key] ?? THRESHOLDS.default
  if (ms <= good) return 'good'
  if (ms <= ni)   return 'needs-improvement'
  return 'poor'
}

/**
 * Record a component render duration.
 *
 * @param name        Component or route identifier (e.g. 'InboxPage', 'ActionCard')
 * @param durationMs  Elapsed milliseconds (from performance.now() diff)
 * @param type        Threshold category ('default' | 'list' | 'modal')
 */
export async function measureRender(
  name:       string,
  durationMs: number,
  type:       keyof typeof THRESHOLDS = 'default',
): Promise<void> {
  const log: PerfLog = {
    id:     crypto.randomUUID(),
    metric: `render_${name}`,
    value:  durationMs,
    rating: rateMs(durationMs, type),
    ts:     Date.now(),
  }
  try { await db.perf_logs.add(log) } catch { /* non-critical */ }
}

/**
 * HOF: wrap an async function and record its execution time.
 *
 * @example
 * const timedLoad = withTiming('loadInbox', async () => { ... })
 */
export function withTiming<T>(
  name: string,
  fn:   () => Promise<T>,
): () => Promise<T> {
  return async () => {
    const start = performance.now()
    const result = await fn()
    void measureRender(name, performance.now() - start)
    return result
  }
}
