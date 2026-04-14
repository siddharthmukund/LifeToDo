'use client'
// ContextChip — a single GTD context filter pill.
// Active state: filled with primary colour.
// Inactive state: dark surface with muted text.
// Single responsibility: one chip, one tap, one toggle.

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ContextChipProps {
  label: string
  emoji?: string | null
  active?: boolean
  count?: number
  onClick?: () => void
  /** When true the chip renders as a non-interactive display badge */
  readOnly?: boolean
  className?: string
}

export function ContextChip({
  label,
  emoji,
  active = false,
  count,
  onClick,
  readOnly = false,
  className,
}: ContextChipProps) {
  const Tag = readOnly ? 'span' : motion.button

  const baseProps = readOnly
    ? {}
    : {
        whileTap: { scale: 0.94 },
        onClick,
      }

  return (
    <Tag
      {...(baseProps as object)}
      aria-pressed={!readOnly ? active : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full',
        'text-sm font-medium transition-all duration-200 select-none',
        'min-h-[44px] px-4', // touch target
        active
          ? 'bg-primary text-content-inverse font-bold shadow-glow-accent'
          : 'bg-surface-card border border-border-subtle text-content-secondary hover:border-primary/30 hover:text-content-primary',
        readOnly && 'cursor-default',
        !readOnly && !active && 'cursor-pointer active:scale-95',
        className,
      )}
    >
      {emoji && <span className="text-base leading-none">{emoji}</span>}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
            active ? 'bg-surface-base/30 text-content-inverse' : 'bg-overlay-hover text-content-secondary',
          )}
        >
          {count}
        </span>
      )}
    </Tag>
  )
}
