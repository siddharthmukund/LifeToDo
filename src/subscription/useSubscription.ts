// src/subscription/useSubscription.ts
'use client'

import { useSubscriptionStore } from './subscriptionStore'
import { createCheckoutSession, createPortalSession } from './stripeService'
import { useAuthStore } from '@/auth/authStore'

export function useSubscription() {
  const sub  = useSubscriptionStore()
  const { user } = useAuthStore()

  return {
    // ── State ──────────────────────────────────────────────────────────────
    tier:              sub.tier,
    status:            sub.status,
    subState:          sub.subState,
    currentPeriodEnd:  sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    isLoading:         sub.isLoading,
    error:             sub.error,
    isPro:             sub.tier === 'pro',

    // ── Actions ────────────────────────────────────────────────────────────
    upgrade: () => {
      if (!user?.uid) return Promise.resolve()
      return createCheckoutSession(user.uid)
    },
    manage: () => {
      if (!user?.uid) return Promise.resolve()
      return createPortalSession(user.uid)
    },
  }
}
