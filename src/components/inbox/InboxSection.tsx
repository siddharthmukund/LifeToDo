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
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── TopAppBar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 glass-header px-6 min-h-[4rem] flex items-center justify-between">
        <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#37f6dd]">
          Inbox
        </h1>
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors active:scale-95">
          <Settings2 size={20} className="text-[#aba9b9]" />
          {items.length > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#37f6dd]" />
          )}
        </button>
      </header>

      {/* ── Velocity stat ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aba9b9] mb-1">Velocity Overview</p>
        <div className="flex items-end gap-4 mb-3">
          <span className="text-[3.5rem] font-extrabold tracking-tighter leading-none text-[#e9e6f7]">
            {items.length}
          </span>
          <div className="pb-2">
            <p className="text-[#aba9b9] leading-tight">
              Actions pending
            </p>
          </div>
        </div>
        <XPBar />
      </div>

      {/* ── Capture bar ────────────────────────────────────────────────────── */}
      <div className="px-6 pb-4 z-20">
        <CaptureBar onCapture={handleCapture} />
      </div>

      <EnergyContextFilter />

      {/* ── Items list ─────────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 custom-scrollbar relative z-10 mt-2">
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-[#0d0d18]/90 backdrop-blur-xl pt-2 pb-2 z-20">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aba9b9]">
              Recent Captures
            </h3>
            <button
              onClick={() => setClarifyingId(items[0].id)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#37f6dd] border border-[#37f6dd]/20 rounded-full px-3 py-1.5 hover:bg-[#37f6dd]/10 transition-colors active:scale-95"
            >
              Process All
            </button>
          </div>
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
