// src/components/subscription/UpgradePrompt.tsx
// Inline "unlock [feature] with Pro" card — shown inside feature-gated areas.
// iCCW #6 D5C deliverable.
'use client'

import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSubscription } from '@/subscription/useSubscription'

interface Props {
  feature: string
  description?: string
}

export function UpgradePrompt({ feature, description }: Props) {
  const { upgrade, isLoading } = useSubscription()

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
          <Zap size={18} className="text-primary-ink" />
        </div>
        <div>
          <p className="text-sm font-semibold text-content-primary">
            Unlock {feature} with Pro
          </p>
          {description && (
            <p className="text-xs text-content-secondary mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="primary"
        fullWidth
        loading={isLoading}
        onClick={() => void upgrade()}
      >
        <Zap size={15} /> Start Pro — $4.99/month
      </Button>
    </div>
  )
}
