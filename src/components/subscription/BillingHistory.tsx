// src/components/subscription/BillingHistory.tsx
// Lists billing events stored in the local Dexie billing_events table.
// Events are mirrored from Stripe webhooks via the server route.
// iCCW #6 D5C deliverable.
'use client'

import { useEffect, useState } from 'react'
import { Receipt, ExternalLink } from 'lucide-react'
import { db } from '@/lib/db'
import type { BillingEvent } from '@/types'

const EVENT_LABELS: Record<BillingEvent['type'], string> = {
  payment_succeeded:      'Payment succeeded',
  payment_failed:         'Payment failed',
  subscription_created:   'Subscription started',
  subscription_cancelled: 'Subscription cancelled',
  trial_started:          'Trial started',
  trial_ended:            'Trial ended',
  upgrade:                'Upgraded to Pro',
  downgrade:              'Downgraded to Free',
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

export function BillingHistory() {
  const [events, setEvents] = useState<BillingEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.billing_events
      .orderBy('timestamp')
      .reverse()
      .limit(20)
      .toArray()
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  if (events.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
          Billing History
        </h2>
        <div className="bg-surface-card rounded-2xl border border-border-default p-5 text-center">
          <Receipt size={24} className="text-content-muted mx-auto mb-2" />
          <p className="text-sm text-content-secondary">No billing events yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
        Billing History
      </h2>
      <div className="bg-surface-card rounded-2xl border border-border-default overflow-hidden divide-y divide-border-subtle">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm font-medium text-content-primary">
                {EVENT_LABELS[event.type] ?? event.type}
              </p>
              <p className="text-xs text-content-secondary mt-0.5">
                {new Date(event.timestamp).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {event.amount > 0 && (
                <span className={`text-sm font-bold tabular-nums
                  ${event.type === 'payment_failed'
                    ? 'text-status-danger'
                    : 'text-content-primary'}`}
                >
                  {formatAmount(event.amount, event.currency)}
                </span>
              )}
              {event.receiptUrl && (
                <a
                  href={event.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-content-muted hover:text-primary-ink transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
