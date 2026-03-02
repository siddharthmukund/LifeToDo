// src/components/auth/EmailVerificationPrompt.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/auth/useAuth'

export function EmailVerificationPrompt() {
  const { user, resendVerificationEmail, isLoading } = useAuth()
  const [sent, setSent] = useState(false)
  const [err, setErr]   = useState('')

  async function handleResend() {
    setErr('')
    try {
      await resendVerificationEmail()
      setSent(true)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not send email. Try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 py-10 px-6 text-center max-w-sm mx-auto"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
        <Mail size={28} className="text-primary-ink" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-content-primary">Check your inbox</h2>
        <p className="text-sm text-content-secondary leading-relaxed">
          We sent a verification link to{' '}
          <span className="font-semibold text-content-primary">{user?.email}</span>.
          Click the link to activate cloud sync.
        </p>
      </div>

      <div className="w-full space-y-3">
        {sent ? (
          <div className="flex items-center justify-center gap-2 text-sm text-status-success">
            <CheckCircle size={16} />
            Verification email sent!
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl
                       bg-surface-card border border-border-default
                       text-sm font-medium text-content-primary
                       hover:bg-overlay-hover transition-colors active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Resend verification email
          </button>
        )}

        {err && <p className="text-xs text-status-error">{err}</p>}

        <p className="text-xs text-content-secondary leading-relaxed px-2">
          Your GTD data is safe and fully usable while verification is pending.
          Sync activates once you verify.
        </p>
      </div>

      <Link href="/" className="text-sm text-primary-ink font-medium hover:underline">
        Continue using the app →
      </Link>
    </motion.div>
  )
}
