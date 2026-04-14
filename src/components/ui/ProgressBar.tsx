'use client'
// ProgressBar — horizontal fill bar with optional label.
// Single responsibility: render a progress state visually.
// Updated in iCCW #3: replaced gtd-* tokens with new design tokens.
// Updated in iCCW #13: role="progressbar" + aria-valuenow/min/max/label.

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number           // current value
  max: number             // maximum value
  label?: string          // e.g. "3 of 7 done"
  /** Accessible label for the progress bar (used as aria-label). */
  ariaLabel?: string
  color?: 'accent' | 'success' | 'warning'
  size?: 'sm' | 'md'
  className?: string
  showLabel?: boolean
  animate?: boolean
}

const COLORS = {
  accent:  'bg-primary',
  success: 'bg-status-ok',
  warning: 'bg-status-warning',
}

const HEIGHTS = {
  sm: 'h-1',
  md: 'h-1.5',
}

export function ProgressBar({
  value,
  max,
  label,
  ariaLabel,
  color = 'accent',
  size = 'md',
  className,
  showLabel = true,
  animate = true,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const isDone = value >= max && max > 0
  const displayLabel = label ?? `${value} of ${max}`

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (label || max > 0) && (
        // aria-hidden: the progressbar element itself carries the semantic value
        <div className="flex items-center justify-between mb-1.5" aria-hidden="true">
          <span className="text-xs font-medium text-content-muted">
            {displayLabel}
          </span>
          {isDone && (
            <span className="text-xs font-bold text-status-success">✓ Done</span>
          )}
        </div>
      )}
      {/* role="progressbar" with aria-value* satisfies WCAG 4.1.2 (Name, Role, Value) */}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel ?? displayLabel}
        className={cn('w-full bg-overlay-hover rounded-full overflow-hidden', HEIGHTS[size])}
      >
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
