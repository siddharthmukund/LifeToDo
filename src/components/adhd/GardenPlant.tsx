'use client'
// GardenPlant — ADHD Mode only.
// A single plant that visualises one pillar of GTD practice.
// Five growth stages + a resting state (never dead — just quiet).
// Rendered as a CSS stem + crown so it scales cleanly with the app design system.

import { motion } from 'framer-motion'

export type PlantStage = 'seedling' | 'sprout' | 'growing' | 'blooming' | 'thriving' | 'resting'

interface GardenPlantProps {
  stage: PlantStage
  /** Delay the entrance animation (stagger across multiple plants). */
  delay?: number
}

const STAGE = {
  seedling: { stemH: 12,  crown: '🌱', sway: false, glow: false },
  sprout:   { stemH: 24,  crown: '🌿', sway: false, glow: false },
  growing:  { stemH: 40,  crown: '🌿', sway: true,  glow: false },
  blooming: { stemH: 52,  crown: '🌸', sway: true,  glow: true  },
  thriving: { stemH: 64,  crown: '🌺', sway: true,  glow: true  },
  resting:  { stemH: 14,  crown: '🌱', sway: false, glow: false },
} as const

export function GardenPlant({ stage, delay = 0 }: GardenPlantProps) {
  const { stemH, crown, sway, glow } = STAGE[stage]
  const isResting = stage === 'resting'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isResting ? 0.45 : 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center justify-end"
      style={{ height: 80 }}
    >
      {/* Crown — flower / leaf emoji */}
      <motion.span
        className="text-xl leading-none mb-0.5 select-none"
        animate={
          sway
            ? { rotate: [-2, 2, -2], scale: glow ? [1, 1.08, 1] : 1 }
            : { rotate: isResting ? -8 : 0 }
        }
        transition={
          sway
            ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0 }
        }
        aria-hidden="true"
      >
        {crown}
      </motion.span>

      {/* Stem */}
      <motion.div
        className="w-0.5 rounded-t-full bg-green-400/70"
        initial={{ height: 0 }}
        animate={{ height: stemH }}
        transition={{ duration: 0.6, delay: delay + 0.1, ease: 'easeOut' }}
      />

      {/* Ground dot */}
      <div className="w-2.5 h-1 rounded-full bg-green-300/40 mt-0.5" />
    </motion.div>
  )
}
