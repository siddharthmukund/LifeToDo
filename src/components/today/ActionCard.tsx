'use client'
import { useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Action } from '@/types'
import { useGTDStore } from '@/store/gtdStore'
import { cn } from '@/lib/utils'

interface ActionCardProps {
  action: Action
  onComplete: (id: string) => void
  projectName?: string
}

export function ActionCard({ action, onComplete, projectName }: ActionCardProps) {
  const x = useMotionValue(0)
  const hasActed = useRef(false)
  const [completing, setCompleting] = useState(false)

  const contexts = useGTDStore(s => s.contexts)
  const context = contexts.find(c => c.id === action.contextId)

  // A task is stale if it hasn't been updated in 7 days
  const isStale = Date.now() - new Date(action.updatedAt).getTime() > 7 * 24 * 60 * 60 * 1000

  // Energy dictates border color
  // High = primary, Med = warning, Low = slate
  const borderColorName =
    action.energy === 'high' ? 'border-l-primary' :
      action.energy === 'medium' ? 'border-l-yellow-500' :
        'border-l-slate-700/50'

  function handleComplete() {
    if (hasActed.current) return
    hasActed.current = true
    setCompleting(true)
    setTimeout(() => onComplete(action.id), 250)
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (hasActed.current) return

    if (info.offset.x > 90) {
      hasActed.current = true
      setCompleting(true)
      animate(x, 500, { duration: 0.25 }).then(() =>
        setTimeout(() => onComplete(action.id), 100)
      )
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 })
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* Complete hint background behind draggable card */}
      <div className="absolute inset-0 flex items-center justify-start pl-5 bg-primary rounded-2xl">
        <Check size={22} className="text-background-dark" />
        <span className="ml-2 text-background-dark text-sm font-bold">Done!</span>
      </div>

      {/* Draggable card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        animate={completing ? { scale: 0.95, opacity: 0 } : {}}
        className={cn(
          "relative glass-card flex items-start gap-4 rounded-2xl p-4 transition-all",
          "cursor-grab active:cursor-grabbing select-none border-l-4",
          borderColorName
        )}
      >
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              {projectName || (context ? `${context.emoji || ''} ${context.name}` : 'Unknown')}
            </span>
            {isStale && (
              <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[8px] font-bold text-yellow-500 animate-pulse-slow">
                STALE
              </span>
            )}
          </div>

          <h3 className="text-base font-bold leading-tight text-white line-clamp-2">
            {action.text}
          </h3>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleComplete() }}
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
          className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 
                     bg-primary/10 text-primary transition-all active:bg-primary active:text-background-dark hover:scale-105"
        >
          <Check size={18} strokeWidth={3} />
        </button>
      </motion.div>
    </div>
  )
}
