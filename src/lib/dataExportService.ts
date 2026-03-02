// src/lib/dataExportService.ts
// Comprehensive data export — collects all local Dexie tables into a single JSON snapshot.
// D7 deliverable: full data portability, free tier included.

import { db } from '@/lib/db'

export interface ExportManifest {
  version: 1
  exportedAt: string        // ISO-8601
  // Core GTD
  inbox_items: unknown[]
  actions: unknown[]
  projects: unknown[]
  contexts: unknown[]
  reviews: unknown[]
  settings: unknown[]
  // Observability
  analytics_events: unknown[]
  // Account
  profile: unknown[]
  subscription: unknown[]
  lifetime_stats: unknown[]
}

/** Collects all local data and returns the full export payload. */
export async function buildExportPayload(): Promise<ExportManifest> {
  const [
    inbox_items,
    actions,
    projects,
    contexts,
    reviews,
    settings,
    analytics_events,
    profile,
    subscription,
    lifetime_stats,
  ] = await Promise.all([
    db.inbox_items.toArray(),
    db.actions.toArray(),
    db.projects.toArray(),
    db.contexts.toArray(),
    db.reviews.toArray(),
    db.settings.toArray(),
    db.analytics_events.toArray(),
    db.profile.toArray(),
    db.subscription.toArray(),
    db.lifetime_stats.toArray(),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    inbox_items,
    actions,
    projects,
    contexts,
    reviews,
    settings,
    analytics_events,
    profile,
    subscription,
    lifetime_stats,
  }
}

/** Triggers a browser download of the full export as JSON. */
export async function downloadExportJSON(): Promise<void> {
  const payload = await buildExportPayload()
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  triggerDownload(blob, `life-todo-export-${dateStamp()}.json`)
}

// ── CSV Export ────────────────────────────────────────────────────────────────

/** Convert an array of objects to a CSV string. */
function toCSV(rows: unknown[]): string {
  if (rows.length === 0) return ''
  const flat = rows.map(r => flattenObject(r as Record<string, unknown>))
  const headers = Array.from(
    flat.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach(k => set.add(k))
      return set
    }, new Set<string>())
  )
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const headerLine = headers.map(escape).join(',')
  const lines = flat.map(row => headers.map(h => escape(row[h])).join(','))
  return [headerLine, ...lines].join('\n')
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      Object.assign(result, flattenObject(val as Record<string, unknown>, fullKey))
    } else {
      result[fullKey] = val instanceof Date ? val.toISOString() : val
    }
  }
  return result
}

/**
 * Downloads key GTD tables as individual CSV files, triggered sequentially.
 * No external zip dependency needed — each table is a clean, standalone CSV.
 */
export async function downloadExportCSV(): Promise<void> {
  const [inbox, actions, projects, contexts, reviews] = await Promise.all([
    db.inbox_items.toArray(),
    db.actions.toArray(),
    db.projects.toArray(),
    db.contexts.toArray(),
    db.reviews.toArray(),
  ])

  const tables: Array<{ name: string; rows: unknown[] }> = [
    { name: 'inbox',    rows: inbox },
    { name: 'actions',  rows: actions },
    { name: 'projects', rows: projects },
    { name: 'contexts', rows: contexts },
    { name: 'reviews',  rows: reviews },
  ]

  const stamp = dateStamp()
  for (const { name, rows } of tables) {
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    triggerDownload(blob, `life-todo-${name}-${stamp}.csv`)
    // Small gap so browsers don't block multiple simultaneous downloads
    await new Promise(r => setTimeout(r, 300))
  }
}

// ── Markdown Export ───────────────────────────────────────────────────────────

/** Generates a human-readable Markdown document of the user's GTD system. */
export async function downloadExportMarkdown(): Promise<void> {
  const payload = await buildExportPayload()
  const lines: string[] = []
  const now = new Date().toLocaleDateString('en-US', { dateStyle: 'long' })

  lines.push(`# Life To Do — My GTD System`)
  lines.push(``)
  lines.push(`_Exported on ${now}_`)
  lines.push(``)

  // Active Projects
  const activeProjects = (payload.projects as Array<{
    name: string; outcome: string; status: string; id: string
  }>).filter(p => p.status === 'active')
  const actions = payload.actions as Array<{
    text: string; status: string; projectId?: string; contextId: string; energy: string
  }>

  if (activeProjects.length > 0) {
    lines.push(`## Active Projects`)
    lines.push(``)
    for (const p of activeProjects) {
      lines.push(`### ${p.name}`)
      if (p.outcome) lines.push(`> Outcome: ${p.outcome}`)
      lines.push(``)
      const projectActions = actions.filter(
        a => a.projectId === p.id && a.status === 'active'
      )
      if (projectActions.length > 0) {
        for (const a of projectActions) {
          lines.push(`- [ ] ${a.text}  _(${a.energy} energy · ${a.contextId})_`)
        }
      } else {
        lines.push(`_No active next actions_`)
      }
      lines.push(``)
    }
  }

  // Standalone next actions (no project)
  const standaloneActions = actions.filter(
    a => !a.projectId && a.status === 'active'
  )
  if (standaloneActions.length > 0) {
    lines.push(`## Next Actions (standalone)`)
    lines.push(``)
    for (const a of standaloneActions) {
      lines.push(`- [ ] ${a.text}  _(${a.energy} energy · ${a.contextId})_`)
    }
    lines.push(``)
  }

  // Waiting For
  const waiting = actions.filter(a => a.status === 'waiting')
  if (waiting.length > 0) {
    lines.push(`## Waiting For`)
    lines.push(``)
    for (const a of waiting) {
      lines.push(`- ${a.text}`)
    }
    lines.push(``)
  }

  // Someday / Maybe
  const someday = actions.filter(a => a.status === 'someday')
  const somedayProjects = (payload.projects as Array<{
    name: string; status: string
  }>).filter(p => p.status === 'someday')

  if (someday.length > 0 || somedayProjects.length > 0) {
    lines.push(`## Someday / Maybe`)
    lines.push(``)
    for (const p of somedayProjects) lines.push(`- [ ] **${p.name}** _(project)_`)
    for (const a of someday) lines.push(`- [ ] ${a.text}`)
    lines.push(``)
  }

  // Inbox (unprocessed)
  const inbox = payload.inbox_items as Array<{ text: string; status: string }>
  const unprocessed = inbox.filter(i => i.status === 'raw' || i.status === 'clarifying')
  if (unprocessed.length > 0) {
    lines.push(`## Inbox (${unprocessed.length} unprocessed)`)
    lines.push(``)
    for (const i of unprocessed) lines.push(`- ${i.text}`)
    lines.push(``)
  }

  // Weekly Review History
  const reviews = payload.reviews as Array<{
    completedAt: string | Date; streakCount: number; itemsProcessed: number; durationMinutes: number
  }>
  if (reviews.length > 0) {
    lines.push(`## Weekly Review History`)
    lines.push(``)
    lines.push(`| Date | Items Processed | Duration | Streak |`)
    lines.push(`|------|----------------|----------|--------|`)
    for (const r of [...reviews].reverse().slice(0, 20)) {
      const date = new Date(r.completedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })
      lines.push(`| ${date} | ${r.itemsProcessed} | ${r.durationMinutes} min | ${r.streakCount} |`)
    }
    lines.push(``)
  }

  const md = lines.join('\n')
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
  triggerDownload(blob, `life-todo-export-${dateStamp()}.md`)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dateStamp(): string {
  return new Date().toISOString().split('T')[0]
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
