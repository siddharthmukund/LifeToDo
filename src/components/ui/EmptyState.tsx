import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: string          // emoji
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-8 text-center',
        className,
      )}
    >
      <div className="text-5xl">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gtd-text mb-1">{title}</h3>
        <p className="text-sm text-gtd-text-muted leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
