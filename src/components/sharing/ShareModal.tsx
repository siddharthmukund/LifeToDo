'use client'
// components/sharing/ShareModal.tsx
// Share a GTD action via the Web Share API or clipboard fallback.
// Optionally includes delegation context (Pro feature).

import { useState } from 'react'
import { Share2, Copy, UserCheck, Check } from 'lucide-react'
import { Modal }          from '@/components/ui/Modal'
import { Button }         from '@/components/ui/Button'
import { useShareAction } from '@/hooks/useShareAction'
import type { Action }    from '@/types'

interface ShareModalProps {
  action:   Action
  open:     boolean
  onClose:  () => void
}

export function ShareModal({ action, open, onClose }: ShareModalProps) {
  const { share, lastMethod, sharing } = useShareAction()
  const [delegateTo, setDelegateTo]   = useState(action.waitingFor?.person ?? '')
  const [copied,     setCopied]       = useState(false)

  async function handleShare() {
    const success = await share(action, delegateTo.trim() || undefined)
    if (success && lastMethod === 'clipboard') {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    if (success) onClose()
  }

  const shareLabel =
    copied  ? 'Copied!'
    : sharing ? 'Sharing…'
    : 'Share Action'

  return (
    <Modal open={open} onClose={onClose} title="Share Action">
      <div className="space-y-5">
        {/* Action preview */}
        <div className="bg-card-elevated rounded-xl p-3 border border-white/8">
          <p className="text-sm text-white font-medium">{action.text}</p>
          <p className="text-xs text-slate-500 mt-1">
            {action.energy} energy · {action.timeEstimate} min
          </p>
        </div>

        {/* Optional delegation */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <UserCheck size={11} /> Delegate to (optional)
          </label>
          <input
            type="text"
            value={delegateTo}
            onChange={e => setDelegateTo(e.target.value)}
            placeholder="Person's name…"
            className="w-full bg-card-elevated border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Method indicator */}
        {lastMethod === 'clipboard' && (
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Copy size={11} /> Copied to clipboard
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            className="flex-1 gap-2"
            onClick={() => void handleShare()}
            disabled={sharing}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {shareLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
