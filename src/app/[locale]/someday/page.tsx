'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Plus, ArrowUpRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { db } from '@/lib/db'
import { useGTDStore } from '@/store/gtdStore'
import type { Action } from '@/types'
import { timeAgo } from '@/lib/utils'

export default function SomedayPage() {
  const [items, setItems]     = useState<Action[]>([])
  const [showNew, setShowNew] = useState(false)
  const [text, setText]       = useState('')
  const { addAction, completeAction } = useGTDStore()

  async function load() {
    const all = await db.actions.where('status').equals('someday').reverse().sortBy('createdAt')
    setItems(all)
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!text.trim()) return
    await addAction({ text: text.trim(), contextId: 'ctx-anywhere', energy: 'low', timeEstimate: 60, status: 'someday' })
    setText('')
    setShowNew(false)
    load()
  }

  async function handlePromote(item: Action) {
    await db.actions.update(item.id, { status: 'active', energy: 'medium', updatedAt: new Date() })
    load()
  }

  async function handleDelete(id: string) {
    await db.actions.delete(id)
    load()
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl border-b border-border-subtle px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
              <Sparkles size={22} className="text-gtd-someday" />
              Someday
            </h1>
            <p className="text-sm text-content-secondary mt-0.5">{items.length} ideas parked</p>
          </div>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus size={16} /> Add idea
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-surface-card border border-border-subtle rounded-2xl px-4 py-3
                         flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-content-primary">{item.text}</p>
                <p className="text-xs text-content-secondary mt-1">{timeAgo(item.createdAt)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 mt-0.5">
                <button
                  onClick={() => handlePromote(item)}
                  className="p-1.5 rounded-lg text-primary-ink-ink hover:bg-gtd-accent/10 transition-colors"
                  title="Make active"
                >
                  <ArrowUpRight size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-content-secondary hover:text-status-error transition-colors"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <EmptyState
            icon="🌙"
            title="Idea vault is empty"
            description="Park ideas here with zero commitment. Revisit them during your weekly review."
            action={<Button size="sm" onClick={() => setShowNew(true)}>Add first idea</Button>}
          />
        )}
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Park an idea">
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's the idea? No pressure — no commitment."
            rows={3}
            className="w-full bg-surface-base border border-border-default rounded-xl px-4 py-3
                       text-sm text-content-primary placeholder-gtd-muted focus:outline-none
                       focus:border-gtd-accent/50 resize-none"
            autoFocus
          />
          <Button fullWidth disabled={!text.trim()} onClick={handleAdd}>
            Park it for later
          </Button>
        </div>
      </Modal>
    </div>
  )
}
