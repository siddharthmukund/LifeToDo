// src/components/data/DeletionCoolingBanner.tsx
// Persistent banner shown during the 7-day account deletion cooling period.
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { db } from '@/lib/db'
import { useAuthStore } from '@/auth/authStore'
import type { DeletionRequest } from '@/types'

export function DeletionCoolingBanner() {
  const { user } = useAuthStore()
  const [request, setRequest] = useState<DeletionRequest | null>(null)

  useEffect(() => {
    if (!user?.uid) return
    async function check() {
      const pending = await db.deletion_requests
        .where('status').equals('pending')
        .and(r => r.uid === user!.uid)
        .first()
      setRequest(pending ?? null)
    }
    void check()
  }, [user?.uid])

  async function handleCancel() {
    if (!request?.id) return
    await db.deletion_requests.update(request.id, {
      status:      'cancelled',
      cancelledAt: new Date().toISOString(),
    })
    setRequest(null)
  }

  if (!request) return null

  const scheduledDate = new Date(request.scheduledDeletionAt)
  const daysLeft = Math.max(
    0,
    Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-2.5
                        bg-status-danger/10 border-b border-status-danger/20">
          <AlertTriangle size={15} className="text-status-danger flex-shrink-0" />
          <p className="flex-1 text-xs font-medium text-status-danger">
            Account deletion in <strong>{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</strong>
            {' '}({scheduledDate.toLocaleDateString()}).
            All data will be permanently erased.
          </p>
          <button
            onClick={handleCancel}
            className="flex-shrink-0 text-xs font-bold text-status-danger underline hover:no-underline"
          >
            Cancel
          </button>
          <button onClick={() => setRequest(null)} className="p-0.5 text-status-danger/60 hover:text-status-danger">
            <X size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
