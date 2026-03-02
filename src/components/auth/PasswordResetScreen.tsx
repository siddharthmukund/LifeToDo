// src/components/auth/PasswordResetScreen.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'

export function PasswordResetScreen() {
  const { sendPasswordReset, isLoading } = useAuth()
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [err, setErr]       = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!email.trim()) { setErr('Please enter your email.'); return }
    try {
      await sendPasswordReset(email.trim())
      setSent(true)
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Something went wrong.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 w-full max-w-sm mx-auto px-2"
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-status-success/15 border border-status-success/20">
              <CheckCircle size={24} className="text-status-success" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-content-primary">Check your inbox</h3>
              <p className="text-sm text-content-secondary">
                We sent a password reset link to{' '}
                <span className="font-medium text-content-primary">{email}</span>.
              </p>
            </div>
            <Link href="/auth/signin" className="text-sm text-primary-ink font-medium hover:underline mt-2">
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleReset} className="flex flex-col gap-4">
            <p className="text-sm text-content-secondary text-center">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-secondary pointer-events-none" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full h-12 pl-10 pr-4 rounded-2xl
                           bg-surface-card border border-border-default
                           text-sm text-content-primary placeholder-content-muted
                           focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            {err && <p className="text-xs text-status-error px-1">{err}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl
                         bg-primary text-text-on-brand font-semibold text-sm
                         hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
            >
              {isLoading
                ? <div className="w-4 h-4 rounded-full border-2 border-text-on-brand border-t-transparent animate-spin" />
                : 'Send reset link'
              }
            </button>

            <Link href="/auth/signin" className="text-sm text-center text-primary-ink font-medium hover:underline">
              Back to sign in
            </Link>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
