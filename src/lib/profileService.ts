// src/lib/profileService.ts
// Firestore ↔ Dexie profile sync.
// Rule: Firestore wins for profile data; Dexie is a local read cache.
'use client'

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type FieldValue,
} from 'firebase/firestore'
import { getFirebaseFirestore, FIREBASE_CONFIGURED } from '@/lib/firebase'
import { db } from '@/lib/db'
import type { UserProfile, SubscriptionRecord, LifetimeGTDStats } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────

function profileRef(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid, 'data', 'profile')
}

function subscriptionRef(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid, 'data', 'subscription')
}

function statsRef(uid: string) {
  return doc(getFirebaseFirestore(), 'users', uid, 'data', 'stats')
}

// ── Profile ───────────────────────────────────────────────────────────────

/**
 * Fetch profile from Firestore and cache locally.
 * Falls back to Dexie cache when offline.
 */
export async function fetchProfile(uid: string): Promise<UserProfile | null> {
  // Try Firestore first
  if (FIREBASE_CONFIGURED) {
    try {
      const snap = await getDoc(profileRef(uid))
      if (snap.exists()) {
        const remote = snap.data() as UserProfile & { createdAt: FieldValue; updatedAt: FieldValue }
        // Firestore Timestamps → ISO strings for local storage
        const profile: UserProfile = {
          ...remote,
          createdAt: (remote.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString()
            ?? new Date().toISOString(),
          updatedAt: (remote.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString()
            ?? new Date().toISOString(),
        }
        // Update Dexie cache
        await db.profile.put(profile)
        return profile
      }
    } catch {
      // Offline — fall through to Dexie cache
    }
  }

  // Dexie fallback (offline)
  return (await db.profile.get(uid)) ?? null
}

/**
 * Write profile updates to Firestore and update Dexie cache.
 */
export async function updateProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  const now = new Date().toISOString()
  const payload = { ...updates, updatedAt: now }

  // Optimistic local update
  const existing = await db.profile.get(uid)
  if (existing) {
    await db.profile.put({ ...existing, ...payload })
  }

  // Firestore write
  if (FIREBASE_CONFIGURED) {
    try {
      await updateDoc(profileRef(uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      // Revert optimistic update on failure
      if (existing) await db.profile.put(existing)
      throw err
    }
  }
}

/**
 * Create a new profile document. Safe to call multiple times (no-op if exists).
 */
export async function createProfileIfAbsent(
  uid: string,
  initial: Partial<UserProfile>
): Promise<void> {
  const existing = await db.profile.get(uid)
  if (existing) return

  const now = new Date().toISOString()
  const profile: UserProfile = {
    uid,
    email:           null,
    displayName:     '',
    avatarUrl:       null,
    bio:             '',
    timezone:        Intl.DateTimeFormat().resolvedOptions().timeZone,
    role:            'custom',
    workingHours: {
      enabled:   false,
      days:      [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime:   '18:00',
    },
    reviewSchedule: {
      dayOfWeek:              0,
      timeOfDay:             '18:00',
      reminderMinutesBefore: 30,
    },
    defaultContexts: [],
    createdAt: now,
    updatedAt: now,
    ...initial,
  }

  await db.profile.put(profile)

  if (FIREBASE_CONFIGURED) {
    const fsSnap = await getDoc(profileRef(uid)).catch(() => null)
    if (!fsSnap?.exists()) {
      await setDoc(profileRef(uid), {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }
}

// ── Subscription ──────────────────────────────────────────────────────────

/**
 * Fetch subscription record from Firestore and cache in Dexie.
 * Dexie cache is used for offline tier checks.
 */
export async function fetchSubscription(
  uid: string
): Promise<SubscriptionRecord | null> {
  if (FIREBASE_CONFIGURED) {
    try {
      const snap = await getDoc(subscriptionRef(uid))
      if (snap.exists()) {
        const sub = snap.data() as SubscriptionRecord
        await db.subscription.put(sub)
        return sub
      }
    } catch {
      // Offline — fall through
    }
  }
  return (await db.subscription.get(uid)) ?? null
}

/**
 * Returns the effective tier, degrading to 'free' if Pro is unverified
 * for more than 7 days (no server contact while offline).
 */
export async function getEffectiveTier(
  uid: string
): Promise<'free' | 'pro'> {
  const sub = await db.subscription.get(uid)
  if (!sub || sub.tier !== 'pro') return 'free'

  const lastVerified = new Date(sub.lastVerifiedAt).getTime()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  if (Date.now() - lastVerified > sevenDaysMs) {
    console.warn('[subscription] Pro tier unverified for >7 days — degrading to free')
    return 'free'
  }
  return 'pro'
}

// ── Lifetime Stats ────────────────────────────────────────────────────────

export async function fetchLifetimeStats(
  uid: string
): Promise<LifetimeGTDStats | null> {
  if (FIREBASE_CONFIGURED) {
    try {
      const snap = await getDoc(statsRef(uid))
      if (snap.exists()) {
        const stats = snap.data() as LifetimeGTDStats
        const withDates: LifetimeGTDStats = {
          ...stats,
          updatedAt: (stats.updatedAt as unknown as { toDate?: () => Date })
            ?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        }
        await db.lifetime_stats.put(withDates)
        return withDates
      }
    } catch {
      // Offline — fall through
    }
  }
  return (await db.lifetime_stats.get(uid)) ?? null
}
