'use client'
// SoftDeadlineBadge — ADHD Mode only.
// Replaces hard "DUE: Thursday" / "OVERDUE" with gentle "Aim for Thursday".
// Neutral colour regardless of overdue state — no shame, no red.

import { useTranslations } from 'next-intl'

interface SoftDeadlineBadgeProps {
  date: Date | string
  className?: string
}

export function SoftDeadlineBadge({ date, className = '' }: SoftDeadlineBadgeProps) {
  const t = useTranslations('adhd.deadline')

  const d = date instanceof Date ? date : new Date(date)
  const formatted = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest
                  text-content-secondary bg-surface-card border border-border-subtle
                  px-2.5 py-1 rounded-full ${className}`}
    >
      🗓 {t('aimFor', { date: formatted })}
    </span>
  )
}
