// Badge — inline status label.
// Uses Figma design tokens: accent = cyan primary, muted = slate.
// iCCW #13: each color variant has a unique shape-icon so status is never
//           conveyed by color alone (WCAG 1.4.1). Icon is optional + aria-hidden.

import { CheckCircle2, AlertTriangle, XCircle, Clock, Bookmark, Info } from 'lucide-react';
import { cn } from '@/lib/utils'

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'someday' | 'muted'

interface BadgeProps {
  children:   React.ReactNode
  color?:     Color
  className?: string
  /**
   * When true, prepend the status icon defined for this color variant.
   * The icon is aria-hidden — the text label already conveys the status.
   */
  showIcon?:  boolean
}

const colors: Record<Color, string> = {
  default: 'bg-overlay-hover text-content-secondary',
  accent:  'bg-primary/15 text-primary-ink border border-primary/25',
  success: 'bg-status-success/15 text-status-success border border-status-ok',
  warning: 'bg-yellow-500/15 text-status-warning border border-yellow-500/25',
  danger:  'bg-status-error/15 text-status-error border border-red-500/25',
  someday: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
  muted:   'bg-overlay-hover text-content-muted',
}

/**
 * Non-color indicator icons — each status variant has a unique icon so the
 * badge meaning is never dependent on color alone (WCAG 1.4.1).
 */
const ICONS: Partial<Record<Color, React.ElementType>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger:  XCircle,
  accent:  Info,
  someday: Bookmark,
  muted:   Clock,
}

export function Badge({ children, color = 'default', className, showIcon = false }: BadgeProps) {
  const Icon = showIcon ? (ICONS[color] ?? null) : null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full',
        'text-[11px] font-bold uppercase tracking-wide',
        colors[color],
        className,
      )}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />}
      {children}
    </span>
  )
}
