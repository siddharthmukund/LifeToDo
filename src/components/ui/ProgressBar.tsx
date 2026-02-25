'use client'
// ProgressBar — horizontal fill bar with optional label.
// Single responsibility: render a progress state visually.
// Updated in iCCW #3: replaced gtd-* tokens with new design tokens.

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number           // current value
  max: number             // maximum value
  label?: string          // e.g. "3 of 7 done"
  color?: 'accent' | 'success' | 'warning'
  size?: 'sm' | 'md'
  className?: string
  showLabel?: boolean
  animate?: boolean
}

const COLORS = {
  accent:  'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
}

const HEIGHTS = {
  sm: 'h-1',
  md: 'h-1.5',
}

export function ProgressBar({
  value,
  max,
  label,
  color = 'accent',
  size = 'md',
  className,
  showLabel = true,
  animate = true,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const isDone = value >= max && max > 0

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (label || max > 0) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">
            {label ?? `${value} of ${max}`}
          </span>
          {isDone && (
            <span className="text-xs font-bold text-green-400">✓ Done</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-white/8 rounded-full overflow-hidden', HEIGHTS[size])}>
        <motion.div
          className={cn('h-full rounded-full', COLORS[isDone ? 'success' : color])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={animate ? { duration: 0.4, ease: 'easeOut' } : { duration: 0 }}
        />
      </div>
    </div>
  )
}
