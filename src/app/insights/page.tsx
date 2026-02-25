'use client'
// app/insights/page.tsx
// GTD Health Insights — Pro-tier dashboard.
// Health score visible to all tiers; detailed charts are Pro-gated.
// Recharts is lazily code-split to this route chunk automatically by Next.js.

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Zap, Lock, TrendingUp, Inbox, Activity, BarChart2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useGTDStore } from '@/store/gtdStore'
import { useGTDHealthScore } from '@/analytics/useGTDHealthScore'
import { SCORE_COMPONENT_LABELS, SCORE_COMPONENT_WEIGHTS } from '@/analytics/healthScore'
import type { HealthScoreBreakdown } from '@/analytics/healthScore'
import { HealthScoreRing } from '@/components/ui/HealthScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { db } from '@/lib/db'
import type { AnalyticsEvent } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DayPoint  { day: string; value: number }
interface FlowPoint { day: string; captured: number; clarified: number }

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortDay(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildCompletionTrend(events: AnalyticsEvent[], days = 7): DayPoint[] {
  const points: DayPoint[] = []
  const now = Date.now()
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - i * 86_400_000
    const dayEnd   = dayStart + 86_400_000
    const label    = shortDay(dayStart)
    const value    = events.filter(
      e => e.name === 'next_action_completed' && e.ts >= dayStart && e.ts < dayEnd
    ).length
    points.push({ day: label, value })
  }
  return points
}

function buildInboxFlow(events: AnalyticsEvent[], days = 14): FlowPoint[] {
  const points: FlowPoint[] = []
  const now = Date.now()
  for (let i = days - 1; i >= 0; i--) {
    const dayStart  = now - i * 86_400_000
    const dayEnd    = dayStart + 86_400_000
    const label     = shortDay(dayStart)
    const captured  = events.filter(e => e.name === 'inbox_item_captured'  && e.ts >= dayStart && e.ts < dayEnd).length
    const clarified = events.filter(e => e.name === 'inbox_item_clarified' && e.ts >= dayStart && e.ts < dayEnd).length
    points.push({ day: label, captured, clarified })
  }
  return points
}

function breakdownToChartData(breakdown: HealthScoreBreakdown) {
  return (Object.keys(breakdown) as (keyof HealthScoreBreakdown)[]).map(key => ({
    component: SCORE_COMPONENT_LABELS[key],
    score:     breakdown[key],
    weight:    SCORE_COMPONENT_WEIGHTS[key],
  }))
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card-elevated border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-slate-400 font-bold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const settings      = useGTDStore(s => s.settings)
  const isPro         = settings?.tier === 'pro'

  const { score, loading: scoreLoading, refresh } = useGTDHealthScore()

  const [events,       setEvents]       = useState<AnalyticsEvent[]>([])
  const [chartsLoaded, setChartsLoaded] = useState(false)

  useEffect(() => {
    db.analytics_events.toArray().then(evts => {
      setEvents(evts)
      setChartsLoaded(true)
    })
  }, [])

  const completionTrend = buildCompletionTrend(events, 7)
  const inboxFlow       = buildInboxFlow(events, 14)
  const breakdownData   = score ? breakdownToChartData(score.breakdown) : []

  // ── Loading ────────────────────────────────────────────────────────────────
  if (scoreLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-xl border-b border-primary/10 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BarChart2 size={20} className="text-primary" />
            <h1 className="text-xl font-display font-bold text-white">Insights</h1>
          </div>
          <button
            onClick={() => void refresh()}
            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">

        {/* ── Health Score Card ── */}
        <div className="bg-card-dark rounded-2xl border border-white/8 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">GTD Health Score</p>
              <p className="text-xs text-slate-400">How well your system is running</p>
            </div>
            {!score?.hasEnoughData && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">
                Warming up
              </span>
            )}
          </div>

          {score && score.hasEnoughData ? (
            <div className="flex items-center gap-8">
              <HealthScoreRing score={score.total} size={100} />
              <div className="flex-1 space-y-3">
                {(Object.keys(score.breakdown) as (keyof HealthScoreBreakdown)[]).map(key => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400">{SCORE_COMPONENT_LABELS[key]}</span>
                      <span className="text-[11px] font-bold text-white">{score.breakdown[key]}%</span>
                    </div>
                    <ProgressBar
                      value={score.breakdown[key]}
                      max={100}
                      color={score.breakdown[key] >= 70 ? 'accent' : 'warning'}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6">
              <Zap size={32} className="text-primary/50" />
              <p className="text-slate-500 text-sm text-center">
                Use the app for a few days to see your health score.
              </p>
            </div>
          )}
        </div>

        {/* ── Pro Gate ── */}
        {!isPro && (
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Lock size={20} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-white mb-1">Unlock Detailed Charts</p>
              <p className="text-sm text-slate-400">
                Pro users get action trends, inbox flow charts, and weekly breakdowns.
              </p>
            </div>
            <Link
              href="/settings"
              className="bg-primary text-background-dark font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* ── Charts (Pro only) ── */}
        {isPro && chartsLoaded && (
          <>
            {/* Action Completion Trend */}
            <div className="bg-card-dark rounded-2xl border border-white/8 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Actions Completed — Last 7 Days
                </p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={completionTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Completed"
                    stroke="#00E5CC"
                    strokeWidth={2}
                    dot={{ fill: '#00E5CC', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#00E5CC' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Inbox Flow */}
            <div className="bg-card-dark rounded-2xl border border-white/8 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Inbox size={14} className="text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Inbox Flow — Last 14 Days
                </p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={inboxFlow} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="capturedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#9D4EDD" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9D4EDD" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="clarifiedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00E5CC" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E5CC" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="captured"  name="Captured"  stroke="#9D4EDD" strokeWidth={2} fill="url(#capturedGradient)" />
                  <Area type="monotone" dataKey="clarified" name="Clarified" stroke="#00E5CC" strokeWidth={2} fill="url(#clarifiedGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Health Breakdown Bar Chart */}
            {score && score.hasEnoughData && (
              <div className="bg-card-dark rounded-2xl border border-white/8 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={14} className="text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Health Score Breakdown
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={breakdownData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="component"
                      tick={{ fontSize: 8, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="score" name="Score" fill="#00E5CC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ── Raw Stats ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Events',    value: events.length,                       icon: Activity  },
            { label: 'Reviews Done',    value: '-',                                  icon: BarChart2 },
            { label: 'Actions Tracked', value: events.filter(e => e.name === 'next_action_completed').length, icon: TrendingUp },
            { label: 'Inbox Zeros',     value: events.filter(e => e.name === 'inbox_zero_achieved').length,  icon: Inbox     },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card-dark rounded-2xl border border-white/8 p-4">
              <Icon size={14} className="text-primary mb-2" />
              <p className="text-xl font-display font-bold text-white">{value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
