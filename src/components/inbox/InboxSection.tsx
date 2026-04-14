'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings2 } from 'lucide-react'
import { CaptureBar } from '@/components/capture/CaptureBar'
import { InboxItemCard } from '@/components/capture/InboxItemCard'
import { ClarifyModal } from '@/components/clarify/ClarifyModal'
import { EnergyContextFilter } from '@/components/filters/EnergyContextFilter'
import { EmptyState } from '@/components/ui/EmptyState'
import { XPBar } from '@/components/gamification/XPBar'
import { useInbox } from '@/hooks/useInbox'
import { useADHDMode } from '@/hooks/useADHDMode'
import { ADHD_MAX_ITEMS } from '@/constants/gtd'
import type { ClarifyDecision } from '@/types'

export function InboxSection() {
  const { items, addItem, deleteItem, dispatchClarified } = useInbox()
  const { isADHDMode } = useADHDMode()
  const [clarifyingId, setClarifyingId] = useState<string | null>(null)

  const clarifyingItem = items.find(i => i.id === clarifyingId) ?? null
  const visibleItems = isADHDMode ? items.slice(0, ADHD_MAX_ITEMS) : items

  async function handleClarifyComplete(decision: ClarifyDecision) {
    if (!clarifyingItem) return
    await dispatchClarified(clarifyingItem, decision)
    setClarifyingId(null)
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">

      <header className="sticky top-0 z-30 glass-header px-6 min-h-[4rem] flex items-center justify-between">
        <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-primary">Inbox</h1>
        <button className="relative p-2 rounded-full hover:bg-overlay-hover transition-colors active:scale-95">
          <Settings2 size={20} className="text-content-secondary" />
          {items.length > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />}
        </button>
      </header>

      <div className="px-6 pt-6 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-content-secondary mb-1">Velocity Overview</p>
        <div className="flex items-end gap-4 mb-3">
          <span className="text-[3.5rem] font-extrabold tracking-tighter leading-none text-content-primary">{items.length}</span>
          <p className="pb-2 text-content-secondary">Actions pending</p>
        </div>
        <XPBar />
      </div>

      <div className="px-6 pb-4 z-20">
        <CaptureBar onCapture={(text, source) => addItem(text, source)} />
      </div>

      <EnergyContextFilter />

      <div className="flex-1 px-6 custom-scrollbar relative z-10 mt-2">
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-surface-base/90 backdrop-blur-xl pt-2 pb-2 z-20">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-content-secondary">Recent Captures</h3>
            <button
              onClick={() => setClarifyingId(items[0].id)}
              className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors active:scale-95"
            >
              Process All
            </button>
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.04 }}
              >
                <InboxItemCard item={item} onClarify={id => setClarifyingId(id)} onTrash={id => deleteItem(id)} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isADHDMode && items.length > ADHD_MAX_ITEMS && (
            <p className="text-center py-4 text-xs font-bold uppercase tracking-widest text-content-secondary border border-dashed border-border-default rounded-xl mt-4">
              + {items.length - ADHD_MAX_ITEMS} hidden. Focus on these first.
            </p>
          )}

          {items.length === 0 && (
            <div className="mt-8">
              <EmptyState icon="📭" title="Inbox Zero" description="Your mind is clear. Tap the mic above to capture anything on your mind right now." />
            </div>
          )}
        </div>
      </div>

      <ClarifyModal item={clarifyingItem} onComplete={handleClarifyComplete} onClose={() => setClarifyingId(null)} />
    </div>
  )
}
