// src/app/api/stripe/webhook/route.ts
// Stripe webhook handler — verifies signature, maps events to Firestore updates.
// Runs server-side only; never touches client state directly.
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

function getStripe(): Stripe {
  if (!stripeSecret) throw new Error('STRIPE_SECRET_KEY not set')
  return new Stripe(stripeSecret, { apiVersion: '2026-02-25.clover' })
}

/**
 * Update the Firestore subscription document using Firebase Admin SDK.
 * In production, initialise firebase-admin with service account credentials
 * (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY).
 */
async function updateFirestoreSubscription(
  uid: string,
  data: Record<string, unknown>
): Promise<void> {
  // Guard: skip if Firebase Admin is not configured
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  if (!projectId) {
    console.warn('[webhook] FIREBASE_ADMIN_PROJECT_ID not set — skipping Firestore update')
    return
  }

  // Lazy-import firebase-admin to avoid bundle bloat in dev
  const admin = await import('firebase-admin')
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    })
  }

  const ref = admin.firestore()
    .collection('users').doc(uid)
    .collection('data').doc('subscription')
  await ref.set(data, { merge: true })
}

export async function POST(req: NextRequest) {
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  const body   = await req.text()
  const sig    = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    console.error('[webhook] Signature verification failed:', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Extract uid from metadata — typed to work with Stripe's Record<string,string>|null
  function extractUid(metadata: Stripe.Metadata | null | undefined): string | null {
    return metadata?.uid ?? null
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const uid = extractUid(session.metadata)
        if (!uid) break
        const subId = typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as Stripe.Subscription | null)?.id ?? null
        await updateFirestoreSubscription(uid, {
          uid,
          tier:                 'pro',
          status:               'active',
          stripeCustomerId:     typeof session.customer === 'string' ? session.customer : null,
          stripeSubscriptionId: subId,
          cancelAtPeriodEnd:    false,
          lastVerifiedAt:       new Date().toISOString(),
        })
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
        const subId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : (invoice.subscription as Stripe.Subscription | null)?.id
        if (!subId) break
        const sub = await stripe.subscriptions.retrieve(subId)
        const uid = extractUid(sub.metadata)
        if (!uid) break
        await updateFirestoreSubscription(uid, {
          tier:              'pro',
          status:            'active',
          currentPeriodEnd:  new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          lastVerifiedAt:    new Date().toISOString(),
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
        const subId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : (invoice.subscription as Stripe.Subscription | null)?.id
        if (!subId) break
        const sub = await stripe.subscriptions.retrieve(subId)
        const uid = extractUid(sub.metadata)
        if (!uid) break
        await updateFirestoreSubscription(uid, {
          status:        'past_due',
          lastVerifiedAt: new Date().toISOString(),
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription & { current_period_end: number }
        const uid = extractUid(sub.metadata)
        if (!uid) break
        await updateFirestoreSubscription(uid, {
          status:            sub.status,
          currentPeriodEnd:  new Date(sub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          lastVerifiedAt:    new Date().toISOString(),
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const uid = extractUid(sub.metadata)
        if (!uid) break
        await updateFirestoreSubscription(uid, {
          tier:              'free',
          status:            'canceled',
          cancelAtPeriodEnd: false,
          currentPeriodEnd:  null,
          lastVerifiedAt:    new Date().toISOString(),
        })
        break
      }

      default:
        // Unhandled event type — acknowledge receipt
        break
    }
  } catch (err) {
    console.error('[webhook] Error processing event:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
