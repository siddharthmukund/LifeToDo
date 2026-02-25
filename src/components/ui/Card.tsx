'use client'
// Card — generic glass surface for any GTD list item.
// Supports swipe-to-action (right = complete, left = delete).
// Single responsibility: surface + layout. Business actions via callbacks.

import { useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { cn } from '@/lib/utils'

type AccentColor = 'primary' | 'warning' | 'danger' | 'muted' | 'none'

const ACCENT_BORDER: Record<AccentColor, string> = {
  primary: 'border-l-primary',
  warning: 'border-l-yellow-500',
  danger:  'border-l-danger',
  muted:   'border-l-white/10',
  none:    '',
}

interface CardProps {
  children: React.ReactNode
  /** Left border accent — maps to an energy level or state colour */
  accent?: AccentColor
  /** Called when the card is swiped right past threshold (complete / confirm) */
  onSwipeRight?: () => void
  /** Called when the card is swiped left past threshold (delete / dismiss) */
  onSwipeLeft?: () => void
  /** Rendered behind the card on right-swipe (default: "Done ✓") */
  rightAction?: React.ReactNode
  /** Rendered behind the card on left-swipe */
  leftAction?: React.ReactNode
  className?: string
  /** Disable all swipe gestures */
  noSwipe?: boolean
}

const SWIPE_THRESHOLD = 88 // px before action fires

export function Card({
  children,
  accent = 'none',
  onSwipeRight,
  onSwipeLeft,
  rightAction,
  leftAction,
  className,
  noSwipe = false,
}: CardProps) {
  const x         = useMotionValue(0)
  const hasActed  = useRef(false)

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (hasActed.current || noSwipe) return

    if (onSwipeRight && info.offset.x > SWIPE_THRESHOLD) {
      hasActed.current = true
      animate(x, 420, { duration: 0.22 }).then(() => onSwipeRight())
      return
    }

    if (onSwipeLeft && info.offset.x < -SWIPE_THRESHOLD) {
      hasActed.current = true
      animate(x, -420, { duration: 0.22 }).then(() => onSwipeLeft())
      return
    }

    // Snap back
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 })
  }

  if (noSwipe) {
    return (
      <div
        className={cn(
          'glass-card rounded-2xl',
          accent !== 'none' && `border-l-4 ${ACCENT_BORDER[accent]}`,
          className,
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Right-swipe background (complete / confirm) */}
      {onSwipeRight && (
        <div className="absolute inset-0 flex items-center justify-start pl-5 bg-primary rounded-2xl">
          {rightAction ?? (
            <span className="text-background-dark text-sm font-bold flex items-center gap-2">
              ✓ Done!
            </span>
          )}
        </div>
      )}

      {/* Left-swipe background (delete / dismiss) */}
      {onSwipeLeft && (
        <div className="absolute inset-0 flex items-center justify-end pr-5 bg-danger rounded-2xl">
          {leftAction ?? (
            <span className="text-white text-sm font-bold flex items-center gap-2">
              🗑 Delete
            </span>
          )}
        </div>
      )}

      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        onDragEnd={handleDragEnd}
        className={cn(
          'relative glass-card rounded-2xl cursor-grab active:cursor-grabbing',
          accent !== 'none' && `border-l-4 ${ACCENT_BORDER[accent]}`,
          className,
        )}
      >
        {children}
      </motion.div>
    </div>
  )
}
