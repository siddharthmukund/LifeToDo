'use client'
// GardenView — ADHD Mode only.
// Shows 5 plants whose stages are derived from a single "growth score"
// computed from this week's GTD activity. The garden NEVER dies — worst
// state is "resting" at 45% opacity.
//
// Growth score (0–100):
//   +20  any action completed today
//   +20  3+ actions completed this week
//   +20  inbox cleared (0 unprocessed items)
//   +20  weekly review completed this week
//   +20  5+ actions completed this week
// Score bands → garden state displayed in the label.

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useGTDStore } from '@/store/gtdStore'
import { db } from '@/lib/db'
import { GardenPlant } from './GardenPlant'
import type { PlantStage } from './GardenPlant'
import { shouldShowWelcomeBack } from './WelcomeBack'

// Map a growth score 0-100 to a stage for each of the 5 plants
function scoresToStages(score: number, recovering: boolean): PlantStage[] {
  if (recovering) {
    // All plants are "sprout" — just returning, garden brightens immediately
    return ['sprout', 'seedling', 'seedling', 'seedling', 'seedling']
  }
  if (score === 0) return ['resting', 'resting', 'resting', 'resting', 'resting']

  const thresholds: PlantStage[] = [
    score >= 20 ? 'sprout'   : 'resting',
    score >= 40 ? 'growing'  : 'resting',
    score >= 60 ? 'growing'  : 'resting',
    score >= 80 ? 'blooming' : 'resting',
    score >= 100 ? 'thriving' : 'resting',
  ]
  return thresholds
}

export function GardenView() {
  const t = useTranslations('adhd.garden')
  const { actions, inboxCount } = useGTDStore()
  const [score, setScore] = useState(0)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    async function compute() {
      const now = Date.now()
      const startOfDay  = new Date(); startOfDay.setHours(0, 0, 0, 0)
      const startOfWeek = new Date(now - 7 * 24 * 60 * 60 * 1000)

      const completedToday = actions.filter(
        a => a.status === 'complete' && a.completedAt && new Date(a.completedAt) >= startOfDay
      ).length

      const completedThisWeek = actions.filter(
        a => a.status === 'complete' && a.completedAt && new Date(a.completedAt) >= startOfWeek
      ).length

      const lastReview = await db.reviews.orderBy('completedAt').last()
      const reviewedThisWeek = lastReview
        && new Date(lastReview.completedAt) >= startOfWeek

      let s = 0
      if (completedToday >= 1)    s += 20
      if (completedThisWeek >= 3) s += 20
      if (inboxCount === 0)       s += 20
      if (reviewedThisWeek)       s += 20
      if (completedThisWeek >= 5) s += 20

      setScore(s)
      setRecovering(shouldShowWelcomeBack())
    }
    compute()
  }, [actions, inboxCount])

  const stages = scoresToStages(score, recovering)

  const gardenLabel =
    recovering         ? t('recovering') :
    score === 0        ? t('resting')    :
    score >= 100       ? t('thriving')   :
    score >= 80        ? t('blooming')   :
                         t('growing')

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl
                 bg-surface-card border border-border-subtle"
    >
      <p className="text-[9px] font-bold uppercase tracking-widest text-content-muted mb-1">
        {t('title')}
      </p>

      {/* Plants row — ground line at bottom */}
      <div className="flex items-end justify-center gap-5 w-full relative">
        {/* Ground line */}
        <div className="absolute bottom-1 left-0 right-0 h-px bg-border-subtle/60" aria-hidden="true" />

        {stages.map((stage, i) => (
          <GardenPlant key={i} stage={stage} delay={i * 0.07} />
        ))}
      </div>

      <p className="text-[10px] font-bold text-primary-ink mt-1 tracking-wide">
        {gardenLabel}
      </p>
    </motion.div>
  )
}
