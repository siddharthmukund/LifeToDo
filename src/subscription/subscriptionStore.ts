// src/subscription/subscriptionStore.ts
'use client'

import { create } from 'zustand'
import type { SubscriptionStoreState, SubscriptionStoreActions } from './types'

export const useSubscriptionStore = create<
  SubscriptionStoreState & SubscriptionStoreActions
>((set) => ({
  // ── State ────────────────────────────────────────────────────────────────
  tier:              'free',
  status:            null,
  subState:          'FREE',
  currentPeriodEnd:  null,
  cancelAtPeriodEnd: false,
  isLoading:         false,
  error:             null,

  // ── Actions ──────────────────────────────────────────────────────────────
  setTier:             (tier)             => set({ tier }),
  setSubState:         (subState)         => set({ subState }),
  setStatus:           (status)           => set({ status }),
  setCurrentPeriodEnd: (currentPeriodEnd) => set({ currentPeriodEnd }),
  setCancelAtPeriodEnd:(cancelAtPeriodEnd)=> set({ cancelAtPeriodEnd }),
  setLoading:          (isLoading)        => set({ isLoading }),
  setError:            (error)            => set({ error }),

  hydrate(record) {
    set(s => {
      const tier      = record.tier      ?? s.tier
      const status    = record.status    ?? s.status
      const cancel    = record.cancelAtPeriodEnd ?? s.cancelAtPeriodEnd

      // Derive state from Firestore data
      let subState: SubscriptionStoreState['subState'] = 'FREE'
      if (tier === 'pro') {
        if (status === 'past_due') subState = 'PRO_GRACE_PERIOD'
        else if (cancel)          subState = 'CANCELLATION_REQUESTED'
        else                      subState = 'PRO_ACTIVE'
      }

      return {
        tier,
        status,
        subState,
        currentPeriodEnd:  record.currentPeriodEnd  ?? s.currentPeriodEnd,
        cancelAtPeriodEnd: cancel,
        isLoading: false,
        error: null,
      }
    })
  },
}))
