// perf/memoryWatcher.ts
// Periodic JS heap memory sampling — Chrome/Edge only (performance.memory API).
// Logs to db.perf_logs. Returns a cleanup function to stop the interval.
// Silently no-ops on browsers that don't expose performance.memory.

import { db } from '@/lib/db'
import type { PerfLog } from '@/types'

// ── Config ────────────────────────────────────────────────────────────────────
const DEFAULT_INTERVAL_MS = 60_000   // sample every 60 seconds
const WARN_HEAP_MB        = 100      // needs-improvement above this
const CRITICAL_HEAP_MB    = 150      // poor above this

// ── Chrome-specific memory API ────────────────────────────────────────────────
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize:   number
    totalJSHeapSize:  number
    jsHeapSizeLimit:  number
  }
}

/**
 * Start periodic memory sampling.
 * Returns a stop function — call it on component unmount or app teardown.
 *
 * @example
 * const stop = startMemoryWatcher()
 * // later: stop()
 */
export function startMemoryWatcher(intervalMs = DEFAULT_INTERVAL_MS): () => void {
  if (typeof window === 'undefined') return () => {}

  const perf = performance as PerformanceWithMemory
  if (!perf.memory) return () => {}  // not Chrome/Edge

  const id = setInterval(async () => {
    const usedMB = perf.memory!.usedJSHeapSize / 1_048_576

    const log: PerfLog = {
      id:     crypto.randomUUID(),
      metric: 'js_heap_used_mb',
      value:  Math.round(usedMB * 10) / 10,
      rating: usedMB < WARN_HEAP_MB     ? 'good'
            : usedMB < CRITICAL_HEAP_MB ? 'needs-improvement'
            :                             'poor',
      ts:     Date.now(),
    }
    try { await db.perf_logs.add(log) } catch { /* non-critical */ }
  }, intervalMs)

  return () => clearInterval(id)
}
