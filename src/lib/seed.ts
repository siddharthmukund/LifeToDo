// lib/seed.ts
// Idempotent initialization — safe to call on every app launch.
// Creates default contexts and settings if they don't exist yet.

import { db } from './db'
import type { Context, Settings } from '@/types'

const DEFAULT_CONTEXTS: Context[] = [
  { id: 'ctx-computer', name: '@Computer', emoji: '💻', isDefault: true, sortOrder: 0 },
  { id: 'ctx-office', name: '@Office', emoji: '🏢', isDefault: true, sortOrder: 1 },
  { id: 'ctx-home', name: '@Home', emoji: '🏠', isDefault: true, sortOrder: 2 },
  { id: 'ctx-errands', name: '@Errands', emoji: '🚗', isDefault: true, sortOrder: 3 },
  { id: 'ctx-calls', name: '@Calls', emoji: '📞', isDefault: true, sortOrder: 4 },
  { id: 'ctx-anywhere', name: '@Anywhere', emoji: '🌍', isDefault: true, sortOrder: 5 },
]

const DEFAULT_SETTINGS: Settings = {
  id: 'singleton',
  reviewDay: 5,              // Friday
  reviewTime: '17:00',
  notificationsEnabled: false,
  tier: 'free',
  theme: 'system',
  onboardingComplete: false,
  adhdMode: false,
  lastEnergyLevel: null,
}

export async function initializeApp(): Promise<void> {
  await Promise.all([seedContexts(), seedSettings()])
}

async function seedContexts(): Promise<void> {
  const count = await db.contexts.count()
  if (count > 0) return
  await db.contexts.bulkAdd(DEFAULT_CONTEXTS)
}

async function seedSettings(): Promise<void> {
  const existing = await db.settings.get('singleton')
  if (existing) return
  await db.settings.add(DEFAULT_SETTINGS)
}

/** Reset everything — used in Settings > "Clear all data" */
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.inbox_items.clear(),
    db.actions.clear(),
    db.projects.clear(),
    db.reviews.clear(),
  ])
  // Re-seed defaults after clearing
  await initializeApp()
}
