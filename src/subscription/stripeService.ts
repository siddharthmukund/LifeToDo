// src/subscription/stripeService.ts
// Stripe Checkout + Customer Portal redirects (client-side).
// No card data ever passes through the app — Stripe handles PCI scope.
'use client'

import { loadStripe } from '@stripe/stripe-js'
import { useSubscriptionStore } from './subscriptionStore'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

/**
 * Redirect to Stripe Checkout to upgrade to Pro.
 * On success Stripe redirects to /subscription?success=1.
 * On cancel  Stripe redirects to /subscription?cancelled=1.
 */
export async function createCheckoutSession(uid: string): Promise<void> {
  const { setSubState, setError, setLoading } = useSubscriptionStore.getState()

  if (!stripePromise) {
    setError('Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local.')
    return
  }

  setSubState('CHECKOUT_STARTED')
  setLoading(true)
  setError(null)

  try {
    // Call our own API route to create a Checkout Session server-side
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    })

    if (!res.ok) {
      const { error } = await res.json() as { error?: string }
      throw new Error(error ?? 'Failed to create checkout session')
    }

    const { url } = await res.json() as { url: string }
    window.location.href = url
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Something went wrong'
    setError(msg)
    setSubState('FREE')
  } finally {
    setLoading(false)
  }
}

/**
 * Redirect to Stripe Customer Portal to manage billing, update card,
 * view invoices, or cancel subscription.
 */
export async function createPortalSession(uid: string): Promise<void> {
  const { setError, setLoading } = useSubscriptionStore.getState()

  setLoading(true)
  setError(null)

  try {
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    })

    if (!res.ok) {
      const { error } = await res.json() as { error?: string }
      throw new Error(error ?? 'Failed to create portal session')
    }

    const { url } = await res.json() as { url: string }
    window.location.href = url
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Something went wrong'
    setError(msg)
  } finally {
    setLoading(false)
  }
}
