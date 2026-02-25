'use client'
// perf/usePerformance.ts
// Hook that reads recent performance logs from Dexie.
// Returns logs grouped by metric name for display in the Insights page.

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import type { PerfLog } from '@/types'

interface PerfSummary {
  metric:   string
  latest:   number
  rating:   PerfLog['rating']
  unit:     string
}

const METRIC_UNITS: Record<string, string> = {
  LCP:              'ms',
  CLS:              '',
  FCP:              'ms',
  INP:              'ms',
  TTFB:             'ms',
  js_heap_used_mb:  'MB',
}

function unitFor(metric: string): string {
  return METRIC_UNITS[metric] ?? 'ms'
}

interface UsePerformanceResult {
  logs:    PerfLog[]
  summary: PerfSummary[]
  loading: boolean
}

/**
 * Load and summarise performance logs.
 *
 * @param limit  Max number of raw log entries to return (default 50)
 */
export function usePerformance(limit = 50): UsePerformanceResult {
  const [logs,    setLogs]    = useState<PerfLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.perf_logs
      .orderBy('ts')
      .reverse()
      .limit(limit)
      .toArray()
      .then(rows => {
        setLogs(rows)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [limit])

  // Build one summary entry per unique metric (latest value wins)
  const seen = new Set<string>()
  const summary: PerfSummary[] = []
  for (const log of logs) {
    if (!seen.has(log.metric)) {
      seen.add(log.metric)
      summary.push({
        metric: log.metric,
        latest: log.value,
        rating: log.rating,
        unit:   unitFor(log.metric),
      })
    }
  }

  return { logs, summary, loading }
}
