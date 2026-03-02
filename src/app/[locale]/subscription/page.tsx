'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, CheckCircle } from 'lucide-react'
import { AuthGate } from '@/auth/AuthGate'
import { useAuth } from '@/auth/useAuth'
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard'
import { PlanComparisonTable } from '@/components/subscription/PlanComparisonTable'
import { CancellationFlow } from '@/components/subscription/CancellationFlow'
import { useSubscriptionStore } from '@/subscription/subscriptionStore'
import { fetchSubscription } from '@/lib/profileService'

function SuccessBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-5 py-3.5 rounded-2xl
                 bg-status-success/10 border border-status-success/20"
    >
      <CheckCircle size={18} className="text-status-success flex-shrink-0" />
      <div>
        <p className="text-sm font-bold text-status-success">Welcome to Pro!</p>
        <p className="text-xs text-status-success/80">All Pro features are now active on this device.</p>
      </div>
    </motion.div>
  )
}

function SubscriptionContent() {
  const { user } = useAuth()
  const { hydrate } = useSubscriptionStore()
  const params = useSearchParams()
  const isSuccess = params.get('success') === '1'

  useEffect(() => {
    if (!user?.uid) return
    fetchSubscription(user.uid).then(sub => {
      if (sub) hydrate(sub)
    })
  }, [user?.uid, hydrate])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
      {isSuccess && <SuccessBanner />}
      <SubscriptionCard />
      <CancellationFlow />

      <section className="space-y-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
          Free vs Pro
        </h2>
        <PlanComparisonTable />
      </section>

      <div className="h-8" />
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl
                      border-b border-border-default px-6 pt-14 pb-4">
        <h1 className="text-2xl font-display font-bold text-content-primary flex items-center gap-2">
          <Star size={22} className="text-primary-ink fill-primary/20" />
          Subscription
        </h1>
      </div>

      <AuthGate>
        <SubscriptionContent />
      </AuthGate>
    </div>
  )
}
