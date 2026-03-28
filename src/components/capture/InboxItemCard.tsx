'use client'
// InboxItemCard — swipeable card for a single inbox item.
// Swipe right: open ClarifyFlow (green hint)
// Swipe left:  trash (red hint)

import { useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Mic, Keyboard, Share2, Zap, Trash2 } from 'lucide-react'
import type { InboxItem } from '@/types'
import { timeAgo } from '@/lib/utils'

interface InboxItemCardProps {
  item: InboxItem
  onClarify: (id: string) => void
  onTrash: (id: string) => void
}

const SOURCE_ICONS = {
  voice: { icon: Mic, color: 'text-primary-ink' },
  text: { icon: Keyboard, color: 'text-content-muted' },
  share: { icon: Share2, color: 'text-status-warning' },
}

export function InboxItemCard({ item, onClarify, onTrash }: InboxItemCardProps) {
  const x = useMotionValue(0)
  const hasActed = useRef(false)
  const t = useTranslations('inbox.item')

  // Hint icon opacity
  const trashOpacity = useTransform(x, [-120, -30], [1, 0])
  const clarifyOpacity = useTransform(x, [30, 120], [0, 1])

  const { icon: SourceIcon, color } = SOURCE_ICONS[item.source]

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (hasActed.current) return

    if (info.offset.x > 100) {
      hasActed.current = true
      animate(x, 400, { duration: 0.2 }).then(() => onClarify(item.id))
    } else if (info.offset.x < -100) {
      hasActed.current = true
      animate(x, -400, { duration: 0.2 }).then(() => onTrash(item.id))
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 })
    }
  }

  function handleClarifyClick(e: React.MouseEvent) {
    e.stopPropagation()
    onClarify(item.id)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* Left hint (trash) */}
      <motion.div
        style={{ opacity: trashOpacity }}
        className="absolute inset-0 flex items-center justify-start pl-5
                   bg-red-500 rounded-2xl pointer-events-none"
      >
        <Trash2 size={22} className="text-content-primary" />
        <span className="ml-2 text-content-primary text-sm font-bold tracking-wider">{t('trash')}</span>
      </motion.div>

      {/* Right hint (clarify) */}
      <motion.div
        style={{ opacity: clarifyOpacity }}
        className="absolute inset-0 flex items-center justify-end pr-5
                   bg-primary rounded-2xl pointer-events-none"
      >
        <span className="mr-2 text-content-inverse text-sm font-bold tracking-wider">{t('clarify')}</span>
        <Zap size={22} className="text-content-inverse" />
      </motion.div>

      {/* Draggable card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        className="relative glass-card rounded-2xl p-4 transition-all
                   cursor-grab active:cursor-grabbing shadow-lg"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-bold leading-tight text-content-primary line-clamp-2 italic pr-4">
            &ldquo;{item.text}&rdquo;
          </h3>

          <button
            onClick={handleClarifyClick}
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary-ink transition-all active:scale-95 shadow-glow-accent hover:bg-primary/20"
            aria-label={t('clarifyAriaLabel')}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Zap size={20} className="fill-primary/20" />
            <span className="absolute -right-1 -top-1 pointer-events-none rounded-full bg-surface-card p-0.5">
              <span className="block size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(43,238,108,0.8)]"></span>
            </span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
            {timeAgo(item.capturedAt)}
          </span>
          <div className={`flex items-center gap-1 ${color} opacity-70`}>
            <SourceIcon size={14} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
