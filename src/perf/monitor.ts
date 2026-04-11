// perf/monitor.ts
// Core Web Vitals capture using the web-vitals library.
// Each metric is written to db.perf_logs (local IndexedDB — no network).
// Call initPerformanceMonitoring() once on app mount (non-blocking).
//
// Metrics tracked: LCP, CLS, FCP, INP, TTFB
// web-vitals reports each metric once (or on page hide for CLS/INP).

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'
import { db } from '@/lib/db'
import type { PerfLog } from '@/types'

function handleMetric(metric: Metric): void {
  const log: PerfLog = {
    id:     crypto.randomUUID(),
    metric: metric.name,
    value:  metric.value,
    rating: metric.rating,
    ts:     Date.now(),
  }
  void db.perf_logs.add(log).catch(() => { /* non-critical */ })
}

/**
 * Register all Core Web Vitals observers.
 * Safe to call multiple times — web-vitals guards against duplicate observers.
 * Must be called in a browser context (not during SSR).
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return
  onLCP(handleMetric)
  onCLS(handleMetric)
  onFCP(handleMetric)
  onINP(handleMetric)
  onTTFB(handleMetric)
}

/**
 * Prune perf logs older than `days` days.
 * Call alongside pruneOldEvents() on app mount.
 */
export async function prunePerfLogs(days = 30): Promise<void> {
  try {
    const cutoff = Date.now() - days * 86_400_000
    await db.perf_logs.where('ts').below(cutoff).delete()
  } catch { /* non-critical */ }
}

/**
 * Prune all transient observability + gamification logs that have no
 * retention requirement. Runs on app mount alongside pruneOldEvents().
 *
 * Retention policy:
 *   error_log   — 7 days  (short-lived debugging data)
 *   sync_queue  — 3 days  (stale items will never sync anyway)
 *   xp_events   — 90 days (needed for lifetime stats aggregation)
 */
export async function pruneTransientLogs(): Promise<void> {
  const now = Date.now()
  const DAY = 86_400_000

  await Promise.allSettled([
    // Error logs: keep 7 days for debugging, drop older entries
    db.error_log
      .where('ts')
      .below(now - 7 * DAY)
      .delete(),

    // Sync queue: stale entries older than 3 days will never be retried
    db.sync_queue
      .where('ts')
      .below(now - 3 * DAY)
      .delete(),

    // XP events: keep 90 days for streak / weekly aggregations
    db.xp_events
      .where('timestamp')
      .below(now - 90 * DAY)
      .delete(),
  ])
}
