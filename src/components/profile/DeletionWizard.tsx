// src/components/profile/DeletionWizard.tsx
// 4-step account deletion wizard — warning → export offer → confirm → scheduled.
// D8 deliverable.
'use client'

import { useState } from 'react'
import { AlertTriangle, Download, Trash2, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/useAuth'
import { downloadExportJSON } from '@/lib/dataExportService'
import { scheduleAccountDeletion } from '@/lib/deletionService'

type WizardStep = 'warning' | 'export' | 'confirm' | 'scheduled'

const DATA_SURFACES = [
  'All inbox items, actions, and projects',
  'Weekly reviews and insights history',
  'Contexts and settings',
  'Analytics events stored on this device',
  'Your profile and preferences',
  'Subscription record (Stripe link removed)',
]

interface Props {
  onCancel: () => void
}

export function DeletionWizard({ onCancel }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<WizardStep>('warning')
  const [confirmText, setConfirmText] = useState('')
  const [exporting, setExporting] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [error, setError] = useState('')

  async function handleExport() {
    setExporting(true)
    try {
      await downloadExportJSON()
    } finally {
      setExporting(false)
    }
  }

  async function handleSchedule() {
    if (!user?.uid) return
    setScheduling(true)
    setError('')
    try {
      await scheduleAccountDeletion(user.uid)
      setStep('scheduled')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setScheduling(false)
    }
  }

  return (
    <div id="delete" className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
        Delete account
      </h2>

      <div className="bg-surface-card rounded-2xl border border-status-danger/25 overflow-hidden">
        <AnimatePresence mode="wait">

          {step === 'warning' && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
              className="p-5 space-y-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-status-danger/10 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-status-danger" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-content-primary">Delete your account?</p>
                  <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                    You&apos;ll have 7 days to change your mind. After that, the following will be permanently erased:
                  </p>
                </div>
              </div>

              <ul className="space-y-2 pl-1">
                {DATA_SURFACES.map(surface => (
                  <li key={surface} className="flex items-center gap-2.5 text-xs text-content-secondary">
                    <span className="w-1 h-1 rounded-full bg-status-danger/50 flex-shrink-0" />
                    {surface}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 pt-1">
                <Button variant="secondary" fullWidth onClick={onCancel}>
                  <X size={15} /> Never mind
                </Button>
                <Button variant="danger" fullWidth onClick={() => setStep('export')}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
              className="p-5 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download size={18} className="text-primary-ink" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-content-primary">Save a copy first?</p>
                  <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                    Download all your data as JSON before it&apos;s gone. Optional but recommended.
                  </p>
                </div>
              </div>

              <Button variant="secondary" fullWidth loading={exporting} onClick={handleExport}>
                <Download size={15} /> Export my data
              </Button>

              <div className="flex gap-2">
                <Button variant="secondary" fullWidth onClick={() => setStep('warning')}>
                  Back
                </Button>
                <Button variant="danger" fullWidth onClick={() => setStep('confirm')}>
                  Skip, continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
              className="p-5 space-y-4"
            >
              <p className="text-sm font-semibold text-content-primary">Type DELETE to confirm</p>
              <p className="text-xs text-content-secondary leading-relaxed">
                This schedules deletion in 7 days. A banner will appear on every page so you can cancel anytime.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                className="w-full bg-surface-base border border-border-default rounded-xl
                           px-4 py-3 text-sm text-content-primary placeholder-content-muted
                           focus:outline-none focus:border-status-danger font-mono tracking-widest"
              />

              {error && (
                <p className="text-xs text-status-danger">{error}</p>
              )}

              <div className="flex gap-2">
                <Button variant="secondary" fullWidth onClick={() => setStep('export')}>
                  Back
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  disabled={confirmText !== 'DELETE'}
                  loading={scheduling}
                  onClick={handleSchedule}
                >
                  <Trash2 size={15} /> Schedule deletion
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'scheduled' && (
            <motion.div
              key="scheduled"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-status-success/10 flex items-center justify-center">
                  <Check size={18} className="text-status-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-content-primary">Deletion scheduled</p>
                  <p className="text-xs text-content-secondary mt-0.5 leading-relaxed">
                    Your account will be deleted in 7 days. Cancel anytime from the banner at the top of every page.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
