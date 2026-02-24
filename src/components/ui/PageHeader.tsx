// PageHeader — sticky page title bar with subtitle and right-slot.
// Single responsibility: consistent sticky header across all pages.
// Enforces ADHD rule: progress indicator on every screen via optional progressBar slot.

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: string
  right?: React.ReactNode
  below?: React.ReactNode   // slot for EnergyToggle, FilterBar, ProgressBar, etc.
  className?: string
}

export function PageHeader({ title, subtitle, right, below, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 bg-gtd-bg/95 backdrop-blur-xl border-b border-white/5 px-5 pt-12 pb-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gtd-text leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gtd-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex-shrink-0 mt-1">{right}</div>}
      </div>
      {below && <div className="mt-3">{below}</div>}
    </div>
  )
}
