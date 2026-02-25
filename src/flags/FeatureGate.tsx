'use client'
// flags/FeatureGate.tsx
// Declarative feature gate — renders children if flag is enabled,
// otherwise renders `fallback` (or nothing) for graceful degradation.
//
// For Pro gates where you want a visible upgrade nudge, pass `showUpgradeNudge`.

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useFeatureFlag } from './useFeatureFlag'
import { getFlag }        from './flags'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeatureGateProps {
  /** Feature flag key to check */
  flag:              string
  /** Content to render when flag is enabled */
  children:          React.ReactNode
  /** Custom fallback (overrides showUpgradeNudge) */
  fallback?:         React.ReactNode
  /** Show a styled Pro upgrade nudge when flag is gated (default false) */
  showUpgradeNudge?: boolean
}

// ── Upgrade nudge ─────────────────────────────────────────────────────────────

function UpgradeNudge({ flagKey }: { flagKey: string }) {
  const def = getFlag(flagKey)
  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-primary/8 to-accent/8
                    border border-primary/15 rounded-2xl text-center">
      <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
        <Lock size={18} className="text-primary" />
      </div>
      <div>
        <p className="font-display font-bold text-white text-sm mb-1">
          {def?.label ?? 'Pro Feature'}
        </p>
        {def?.description && (
          <p className="text-xs text-slate-400">{def.description}</p>
        )}
      </div>
      <Link
        href="/settings"
        className="text-xs font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
      >
        Upgrade to Pro →
      </Link>
    </div>
  )
}

// ── Gate component ────────────────────────────────────────────────────────────

export function FeatureGate({
  flag,
  children,
  fallback,
  showUpgradeNudge = false,
}: FeatureGateProps) {
  const enabled = useFeatureFlag(flag)

  if (enabled) return <>{children}</>

  if (fallback !== undefined) return <>{fallback}</>

  if (showUpgradeNudge) return <UpgradeNudge flagKey={flag} />

  return null
}
