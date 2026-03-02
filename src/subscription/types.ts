// src/subscription/types.ts

export type SubscriptionTier   = 'free' | 'pro'
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

export type SubscriptionStateName =
  | 'FREE'
  | 'CHECKOUT_STARTED'
  | 'PAYMENT_PROCESSING'
  | 'PRO_ACTIVE'
  | 'PRO_GRACE_PERIOD'     // payment failed, 3-day window
  | 'CANCELLATION_REQUESTED' // cancelAtPeriodEnd=true, still Pro until period end

export interface SubscriptionStoreState {
  tier: SubscriptionTier
  status: SubscriptionStatus | null
  subState: SubscriptionStateName
  currentPeriodEnd: string | null   // ISO-8601
  cancelAtPeriodEnd: boolean
  isLoading: boolean
  error: string | null
}

export interface SubscriptionStoreActions {
  setTier: (tier: SubscriptionTier) => void
  setSubState: (state: SubscriptionStateName) => void
  setStatus: (status: SubscriptionStatus | null) => void
  setCurrentPeriodEnd: (end: string | null) => void
  setCancelAtPeriodEnd: (v: boolean) => void
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
  /** Called when Firestore subscription record is fetched */
  hydrate: (record: Partial<SubscriptionStoreState>) => void
}
