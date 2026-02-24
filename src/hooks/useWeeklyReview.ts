'use client'
import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import type { ReviewSection, WeeklyReviewData, Action, Project, InboxItem } from '@/types'

export function useWeeklyReview() {
  const [data, setData] = useState<WeeklyReviewData | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [startedAt] = useState(Date.now())

  const generate = useCallback(async () => {
    setIsLoading(true)

    const [
      inboxItems,
      waitingFor,
      activeActions,
      allProjects,
      somedayActions,
      lastReview,
    ] = await Promise.all([
      db.inbox_items.where('status').anyOf(['raw', 'clarifying']).toArray(),
      db.actions.where('status').equals('waiting').toArray(),
      db.actions.where('status').equals('active').toArray(),
      db.projects.where('status').equals('active').toArray(),
      db.actions.where('status').equals('someday').toArray(),
      db.reviews.orderBy('completedAt').last(),
    ])

    // Projects missing a next action — the GTD red flag
    const projectsNoAction = await Promise.all(
      allProjects.map(async p => {
        if (!p.nextActionId) return p
        const action = await db.actions.get(p.nextActionId)
        return action ? null : p
      })
    ).then(list => list.filter(Boolean) as Project[])

    // Stale = active but not updated in 14+ days
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const stale  = activeActions.filter(a => new Date(a.updatedAt) < cutoff)

    const sections: ReviewSection[] = [
      // ── GET CLEAR ─────────────────────────────────────────────────────────
      {
        id: 'process_inbox',
        phase: 'get_clear',
        title: 'Process Inbox to Zero',
        description: 'Clarify every item until the inbox is empty.',
        count: inboxItems.length,
        items: inboxItems as InboxItem[],
        completed: false,
      },
      {
        id: 'review_waiting',
        phase: 'get_clear',
        title: 'Review Waiting For',
        description: 'Send any overdue follow-ups.',
        count: waitingFor.length,
        items: waitingFor,
        completed: false,
      },
      // ── GET CURRENT ───────────────────────────────────────────────────────
      {
        id: 'review_stale',
        phase: 'get_current',
        title: 'Prune Stale Actions',
        description: `${stale.length} actions haven't moved in 2+ weeks. Delete or defer them.`,
        count: stale.length,
        items: stale,
        completed: false,
      },
      {
        id: 'review_projects',
        phase: 'get_current',
        title: 'Review Projects',
        description: 'Every project must have a next action.',
        count: projectsNoAction.length,
        items: projectsNoAction,
        completed: false,
      },
      {
        id: 'review_calendar',
        phase: 'get_current',
        title: 'Review Calendar',
        description: 'Check past week + next 2 weeks. Any new actions triggered?',
        count: 0,
        items: [],
        completed: false,
      },
      // ── GET CREATIVE ──────────────────────────────────────────────────────
      {
        id: 'review_someday',
        phase: 'get_creative',
        title: 'Browse Someday / Maybe',
        description: 'Anything ready to become active?',
        count: somedayActions.length,
        items: somedayActions.slice(0, 8) as Action[],
        completed: false,
      },
      {
        id: 'set_intentions',
        phase: 'get_creative',
        title: 'Set Intentions for Next Week',
        description: 'What are the 3 most important outcomes?',
        count: 0,
        items: [],
        completed: false,
      },
    ]

    const totalItems = sections.reduce((s, r) => s + r.count, 0)
    // Rough estimate: 1 min per inbox item + 0.5 min per other + 3 min base
    const estimatedMinutes = Math.max(
      Math.ceil(inboxItems.length * 1 + (totalItems - inboxItems.length) * 0.5 + 3),
      5
    )

    setData({
      sections,
      totalItems,
      estimatedMinutes,
      lastReviewDate: lastReview?.completedAt ?? null,
      currentStreak:  lastReview?.streakCount ?? 0,
    })
    setIsLoading(false)
  }, [])

  useEffect(() => { generate() }, [generate])

  const completeSection = (id: string) =>
    setCompletedIds(prev => new Set(Array.from(prev).concat(id)))

  const isAllDone = data !== null && data.sections.every(s => completedIds.has(s.id))

  const finalize = async (intentions: string[]): Promise<number> => {
    const last = await db.reviews.orderBy('completedAt').last()
    const now  = new Date()
    const daysSinceLast = last?.completedAt
      ? (now.getTime() - new Date(last.completedAt).getTime()) / 86_400_000
      : Infinity

    const newStreak = daysSinceLast <= 8 ? (last?.streakCount ?? 0) + 1 : 1
    const durationMinutes = Math.round((Date.now() - startedAt) / 60_000)

    await db.reviews.add({
      id: crypto.randomUUID(),
      completedAt: now,
      streakCount: newStreak,
      itemsProcessed: data?.totalItems ?? 0,
      intentionsSet: intentions.filter(Boolean),
      durationMinutes,
    })

    return newStreak
  }

  return {
    data,
    isLoading,
    completedIds,
    isAllDone,
    completeSection,
    finalize,
    refresh: generate,
  }
}
