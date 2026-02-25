// Badge — inline status label.
// Uses Figma design tokens: accent = cyan primary, muted = slate.

import { cn } from '@/lib/utils'

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'someday' | 'muted'

interface BadgeProps {
  children:   React.ReactNode
  color?:     Color
  className?: string
}

const colors: Record<Color, string> = {
  default: 'bg-white/10 text-slate-400',
  accent:  'bg-primary/15 text-primary border border-primary/25',
  success: 'bg-green-500/15 text-green-400 border border-green-500/25',
  warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  danger:  'bg-red-500/15 text-red-400 border border-red-500/25',
  someday: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
  muted:   'bg-white/5 text-slate-500',
}

export function Badge({ children, color = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full',
        'text-[11px] font-bold uppercase tracking-wide',
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
