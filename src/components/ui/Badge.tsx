import { cn } from '@/lib/utils'

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'someday' | 'muted'

interface BadgeProps {
  children: React.ReactNode
  color?: Color
  className?: string
}

const colors: Record<Color, string> = {
  default: 'bg-white/10 text-gtd-text-muted',
  accent:  'bg-gtd-accent/20 text-gtd-accent-light border border-gtd-accent/30',
  success: 'bg-gtd-success/20 text-gtd-success border border-gtd-success/30',
  warning: 'bg-gtd-warning/20 text-gtd-warning border border-gtd-warning/30',
  danger:  'bg-gtd-danger/20 text-gtd-danger border border-gtd-danger/30',
  someday: 'bg-gtd-someday/20 text-gtd-someday border border-gtd-someday/30',
  muted:   'bg-white/5 text-gtd-muted',
}

export function Badge({ children, color = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
