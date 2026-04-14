'use client'

import { useXP } from '@/gamification/useXP'
import { motion } from 'framer-motion'

export function XPBar() {
  const { totalXP, currentLevel, xpToNextLevel, isEnabled, showXPBar } = useXP()

  if (!isEnabled || !showXPBar) return null

  const reqForCurrent = Math.floor(50 * Math.pow(currentLevel, 1.8))
  const reqForNext = Math.floor(50 * Math.pow(currentLevel + 1, 1.8))
  const progressToNext = totalXP - reqForCurrent
  const levelBracket = reqForNext - reqForCurrent
  const progressPercent = Math.min(100, Math.max(0, (progressToNext / levelBracket) * 100))

  return (
    <div className="flex items-center gap-3 w-full max-w-xs group cursor-default">
      {/* Level Badge */}
      <div className="flex items-center justify-center bg-surface-card text-xs font-bold w-7 h-7 rounded-lg text-content-secondary ring-1 ring-border-default">
        {currentLevel}
      </div>

      {/* Progress Track */}
      <div className="flex-1 h-2 bg-surface-card rounded-full overflow-hidden relative border border-border-subtle">
        <motion.div
          className="absolute top-0 left-0 bottom-0 bg-primary rounded-full shadow-glow-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* XP text hover info */}
      <div className="text-xs text-content-muted font-medium font-mono min-w-[40px] text-right">
        <span className="group-hover:hidden">{xpToNextLevel} xp</span>
        <span className="hidden group-hover:inline text-primary-ink">{totalXP}</span>
      </div>
    </div>
  )
}
