import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaptureBar } from '@/components/capture/CaptureBar'
import { InboxItemCard } from '@/components/capture/InboxItemCard'
import { ClarifyModal } from '../clarify/ClarifyModal'
import { EnergyContextFilter } from '@/components/filters/EnergyContextFilter'
import { EmptyState } from '@/components/ui/EmptyState'
import { XPBar } from '@/components/gamification/XPBar'
import { useInbox } from '@/hooks/useInbox'
import { useGTDStore } from '@/store/gtdStore'
import { Settings2 } from 'lucide-react'
import type { ClarifyDecision, VoiceClarifyResult } from '@/types'

export function InboxSection() {
  const {
    items,
    addItem,
    processItem,
    deleteItem,
    clarifyingItemId,
    startClarify,
    filters,
    setFilter,
    clearFilters,
  } = useInbox()
  const { addAction, addProject, updateProject, settings } = useGTDStore()

  const [clarifyingId, setClarifyingId] = useState<string | null>(null)
  const adhdMode = settings?.adhdMode
  const clarifyingItem = items.find(i => i.id === clarifyingId) ?? null

  async function handleCapture(text: string, source: 'voice' | 'text', _clarify?: VoiceClarifyResult) {
    await addItem(text, source)
  }

  async function handleTrash(id: string) {
    await deleteItem(id)
  }

  async function handleClarifyComplete(decision: ClarifyDecision) {
    if (!clarifyingItem) return

    const {
      destination,
      contextId = 'ctx-anywhere',
      energy = 'medium',
      timeEstimate = 15,
      projectName,
      nextActionText,
      waitingForPerson,
      waitingForDate,
    } = decision

    switch (destination) {
      case 'next_action': {
        await addAction({
          text: clarifyingItem.text,
          contextId,
          energy,
          timeEstimate,
          status: 'active',
          projectId: undefined,
        })
        break
      }
      case 'project': {
        const project = await addProject({
          name: projectName ?? clarifyingItem.text,
          outcome: projectName ?? clarifyingItem.text,
          status: 'active',
        })
        const action = await addAction({
          text: nextActionText ?? clarifyingItem.text,
          contextId,
          energy,
          timeEstimate,
          status: 'active',
          projectId: project.id,
        })
        await updateProject(project.id, { nextActionId: action.id })
        break
      }
      case 'waiting_for': {
        await addAction({
          text: clarifyingItem.text,
          contextId,
          energy,
          timeEstimate,
          status: 'waiting',
          waitingFor: waitingForPerson
            ? { person: waitingForPerson, followUpDate: waitingForDate ?? new Date() }
            : undefined,
        })
        break
      }
      case 'someday': {
        await addAction({
          text: clarifyingItem.text,
          contextId,
          energy,
          timeEstimate,
          status: 'someday',
        })
        break
      }
      default:
        break
    }

    await processItem(clarifyingItem.id)
    setClarifyingId(null)
  }

  return (
    <div className="flex flex-col h-full animate-fade-in pb-8">
      <header className="flex items-center justify-between px-6 pt-14 pb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-content-primary">
          Inbox
        </h1>
        <button className="relative rounded-full bg-surface-card p-2 text-primary-ink border border-border-default active:scale-95 transition-transform shadow-glow-accent">
          <Settings2 size={20} />
          {items.length > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary border-2 border-surface-card" />
          )}
        </button>
      </header>

      <EnergyContextFilter />

      <div className="px-6 flex justify-between items-end mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-ink mb-1">
            Unprocessed
          </p>
          <h2 className="text-4xl font-display font-bold text-content-primary leading-none mb-3">
            {items.length}
            {items.length > 0 && (
              <span className="text-lg text-content-secondary ml-1">items</span>
            )}
          </h2>
          <XPBar />
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setClarifyingId(items[0].id)}
            className="text-xs font-bold uppercase tracking-widest text-content-secondary border border-border-default rounded-full px-4 py-2 hover:bg-overlay-hover transition-colors active:scale-95"
          >
            Process All
          </button>
        )}
      </div>

      <div className="px-6 z-20">
        <CaptureBar onCapture={handleCapture} />
      </div>

      <div className="flex-1 px-6 custom-scrollbar relative z-10 mt-4">
        {items.length > 0 && (
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mb-4 sticky top-0 bg-surface-base/90 backdrop-blur pb-2 pt-2 z-20">
            Recent Captures
          </h3>
        )}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {(adhdMode ? items.slice(0, 7) : items).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.04 }}
              >
                <InboxItemCard
                  item={item}
                  onClarify={id => setClarifyingId(id)}
                  onTrash={handleTrash}
                />
              </motion.div>
            ))}

            {adhdMode && items.length > 7 && (
              <div className="text-center py-4 text-xs font-bold uppercase tracking-widest text-content-secondary border border-dashed border-border-default rounded-xl mt-4">
                + {items.length - 7} hidden. Focus on these first.
              </div>
            )}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="mt-8">
              <EmptyState
                icon="📭"
                title="Inbox Zero"
                description="Your mind is clear. Tap the mic above to capture anything on your mind right now."
              />
            </div>
          )}
        </div>
      </div>

      <ClarifyModal
        item={clarifyingItem}
        onComplete={handleClarifyComplete}
        onClose={() => setClarifyingId(null)}
      />
    </div>
  )
}
