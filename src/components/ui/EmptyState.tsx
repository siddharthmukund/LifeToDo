// EmptyState — guided zero-data screen.
// Uses new design tokens: text-white (primary text), text-slate-400 (body).

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon:        string           // emoji or small image
  title:       string
  description: string
  action?:     React.ReactNode
  className?:  string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center gap-5 py-20 px-8 text-center',
        className,
      )}
    >
      <div className="text-6xl animate-bounce-in">{icon}</div>
      <div className="space-y-2">
        <h3 className="text-xl font-display font-bold text-white">{title}</h3>
        <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  )
}
