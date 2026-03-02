'use client'
// store/gtdStore.ts
// Zustand store — single source of reactive UI state.
// Every mutation writes to IndexedDB first, then updates React state.
// This guarantees the DB is always the truth; React is a projection of it.
// iCCW #4: analytics track() calls added to key mutations (fire-and-forget).

import { create } from 'zustand'
import { db } from '@/lib/db'
import { track } from '@/analytics/tracker'
import type {
  Action,
  ActionFilters,
  Context,
  InboxItem,
  Project,
  Settings,
} from '@/types'

interface GTDState {
  // ── Data ──────────────────────────────────────────────────────────────────
  inboxItems: InboxItem[]
  actions: Action[]
  projects: Project[]
  contexts: Context[]
  settings: Settings | null

  // ── UI State ──────────────────────────────────────────────────────────────
  filters: ActionFilters
  inboxCount: number        // badge on nav tab
  isCapturing: boolean
  clarifyingItemId: string | null // which inbox item is in ClarifyFlow

  // ── Loaders ──────────────────────────────────────────────────────────────
  loadAll: () => Promise<void>
  loadInbox: () => Promise<void>
  loadActions: () => Promise<void>
  loadProjects: () => Promise<void>
  loadContexts: () => Promise<void>
  loadSettings: () => Promise<void>

  // ── Inbox mutations ───────────────────────────────────────────────────────
  addInboxItem: (text: string, source: 'voice' | 'text', nlpMetadata?: { dueDate: Date | null, projects: string[], contexts: string[] }) => Promise<InboxItem>
  markInboxProcessed: (id: string) => Promise<void>
  deleteInboxItem: (id: string) => Promise<void>

  // ── Action mutations ──────────────────────────────────────────────────────
  addAction: (data: Omit<Action, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<Action>
  completeAction: (id: string) => Promise<void>
  updateAction: (id: string, updates: Partial<Action>) => Promise<void>

  // ── Project mutations ─────────────────────────────────────────────────────
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  archiveProject: (id: string) => Promise<void>

  // ── Settings mutations ────────────────────────────────────────────────────
  updateSettings: (updates: Partial<Settings>) => Promise<void>
  addContext: (name: string, emoji?: string) => Promise<void>
  deleteContext: (id: string) => Promise<void>

  // ── Filter setters ────────────────────────────────────────────────────────
  setFilter: (key: keyof ActionFilters, value: ActionFilters[keyof ActionFilters]) => void
  clearFilters: () => void
  setIsCapturing: (v: boolean) => void
  setClarifyingItem: (id: string | null) => void
}

export const useGTDStore = create<GTDState>((set, get) => ({
  inboxItems: [],
  actions: [],
  projects: [],
  contexts: [],
  settings: null,
  filters: { contextId: null, energy: null, maxTime: null },
  inboxCount: 0,
  isCapturing: false,
  clarifyingItemId: null,

  // ── Loaders ───────────────────────────────────────────────────────────────

  loadAll: async () => {
    const { loadInbox, loadActions, loadProjects, loadContexts, loadSettings } = get()
    await Promise.all([loadInbox(), loadActions(), loadProjects(), loadContexts(), loadSettings()])
  },

  loadInbox: async () => {
    const items = await db.inbox_items
      .where('status').anyOf(['raw', 'clarifying'])
      .reverse().sortBy('capturedAt')
    set({ inboxItems: items, inboxCount: items.length })
  },

  loadActions: async () => {
    const actions = await db.actions
      .where('status').anyOf(['active', 'waiting'])
      .reverse().sortBy('updatedAt')
    set({ actions })
  },

  loadProjects: async () => {
    const projects = await db.projects
      .where('status').equals('active')
      .reverse().sortBy('updatedAt')
    set({ projects })
  },

  loadContexts: async () => {
    const contexts = await db.contexts.orderBy('sortOrder').toArray()
    set({ contexts })
  },

  loadSettings: async () => {
    let settings = await db.settings.get('singleton')
    if (!settings) {
      // Initialize default settings if none exist
      settings = {
        id: 'singleton',
        reviewDay: 0,
        reviewTime: '09:00',
        notificationsEnabled: false,
        tier: 'free',
        theme: 'system',
        onboardingComplete: false,
        adhdMode: false,
        lastEnergyLevel: null,
      }
      await db.settings.add(settings)
    }
    set({ settings })
  },

  // ── Inbox mutations ────────────────────────────────────────────────────────

  addInboxItem: async (text, source, nlpMetadata) => {
    const item: InboxItem = {
      id: crypto.randomUUID(),
      text: text.trim(),
      capturedAt: new Date(),
      source,
      status: 'raw',
      syncStatus: 'local',
      nlpMetadata,
    }
    await db.inbox_items.add(item)
    set(s => ({
      inboxItems: [item, ...s.inboxItems],
      inboxCount: s.inboxCount + 1,
    }))
    void track('inbox_item_captured', { source })
    if (source === 'voice') void track('voice_capture_used', { success: true })
    return item
  },

  markInboxProcessed: async (id) => {
    await db.inbox_items.update(id, { status: 'processed' })
    set(s => {
      const next = s.inboxItems.filter(i => i.id !== id)
      if (next.length === 0) void track('inbox_zero_achieved')
      return { inboxItems: next, inboxCount: next.length }
    })
    void track('inbox_item_clarified')
  },

  deleteInboxItem: async (id) => {
    await db.inbox_items.delete(id)
    set(s => {
      const next = s.inboxItems.filter(i => i.id !== id)
      return { inboxItems: next, inboxCount: next.length }
    })
  },

  // ── Action mutations ───────────────────────────────────────────────────────

  addAction: async (data) => {
    const now = new Date()
    const action: Action = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local',
    }
    await db.actions.add(action)
    if (action.status === 'active' || action.status === 'waiting') {
      set(s => ({ actions: [action, ...s.actions] }))
    }
    return action
  },

  completeAction: async (id) => {
    const action = await db.actions.get(id)
    const now = new Date()
    await db.actions.update(id, { status: 'complete', completedAt: now, updatedAt: now })
    set(s => ({ actions: s.actions.filter(a => a.id !== id) }))
    void track('next_action_completed', {
      energy: action?.energy ?? 'medium',
      timeEstimate: action?.timeEstimate ?? 0,
      hasProject: Boolean(action?.projectId),
    })
    if (action?.timeEstimate && action.timeEstimate <= 5) {
      void track('two_minute_completed')
    }
  },

  updateAction: async (id, updates) => {
    const updatedAt = new Date()
    await db.actions.update(id, { ...updates, updatedAt })
    set(s => ({
      actions: s.actions.map(a =>
        a.id === id ? { ...a, ...updates, updatedAt } : a
      ),
    }))
  },

  // ── Project mutations ──────────────────────────────────────────────────────

  addProject: async (data) => {
    const now = new Date()
    const project: Project = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local',
    }
    await db.projects.add(project)
    set(s => ({ projects: [project, ...s.projects] }))
    return project
  },

  updateProject: async (id, updates) => {
    const updatedAt = new Date()
    await db.projects.update(id, { ...updates, updatedAt })
    set(s => ({
      projects: s.projects.map(p =>
        p.id === id ? { ...p, ...updates, updatedAt } : p
      ),
    }))
  },

  archiveProject: async (id) => {
    await db.projects.update(id, { status: 'archived' })
    set(s => ({ projects: s.projects.filter(p => p.id !== id) }))
  },

  // ── Settings mutations ─────────────────────────────────────────────────────

  updateSettings: async (updates) => {
    await db.settings.update('singleton', updates)
    set(s => ({
      settings: s.settings ? { ...s.settings, ...updates } : null,
    }))
    if (updates.adhdMode !== undefined) {
      void track('adhd_mode_toggled', { value: updates.adhdMode })
    }
  },

  addContext: async (name, emoji) => {
    const contexts = get().contexts
    const ctx = {
      id: `ctx-${crypto.randomUUID()}`,
      name: name.startsWith('@') ? name : `@${name}`,
      emoji,
      isDefault: false,
      sortOrder: contexts.length,
    }
    await db.contexts.add(ctx)
    set(s => ({ contexts: [...s.contexts, ctx] }))
  },

  deleteContext: async (id) => {
    await db.contexts.delete(id)
    set(s => ({ contexts: s.contexts.filter(c => c.id !== id) }))
  },

  // ── Filter setters ─────────────────────────────────────────────────────────

  setFilter: (key, value) =>
    set(s => ({ filters: { ...s.filters, [key]: value } })),

  clearFilters: () =>
    set({ filters: { contextId: null, energy: null, maxTime: null } }),

  setIsCapturing: (v) => set({ isCapturing: v }),

  setClarifyingItem: (id) => set({ clarifyingItemId: id }),
}))
