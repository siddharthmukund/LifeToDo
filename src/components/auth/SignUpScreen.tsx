// src/components/auth/SignUpScreen.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M14.046 0c.03 1.565-.453 2.71-1.2 3.57-.742.843-1.765 1.49-3.022 1.395-.063-1.48.476-2.624 1.215-3.465C11.8.637 12.977.065 14.046 0ZM18 13.024c-.44 1.284-.976 2.35-1.718 3.324C15.455 17.5 14.67 18 13.726 18c-.826 0-1.374-.55-2.525-.55-1.148 0-1.756.554-2.607.554-.926 0-1.767-.558-2.638-1.748C4.67 14.626 3.6 12.246 3.6 9.97c0-3.685 2.4-5.636 4.765-5.636.942 0 1.727.616 2.322.616.574 0 1.47-.654 2.558-.654.413 0 1.68.043 2.55 1.287-.065.039-1.526.892-1.51 2.656.017 2.115 1.86 2.818 1.715 2.785Z"/>
    </svg>
  )
}

export function SignUpScreen() {
  const { signUpWithEmail, signInWithGoogle, signInWithApple, error, isLoading } = useAuth()
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [localErr, setLocalErr]   = useState('')

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLocalErr('')
    if (!email.trim() || !password) {
      setLocalErr('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setLocalErr('Password must be at least 6 characters.')
      return
    }
    try {
      await signUpWithEmail(email.trim(), password)
    } catch { /* error shown via authStore */ }
  }

  const displayError = localErr || error

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full max-w-sm mx-auto px-2"
    >
      {/* OAuth */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => signInWithGoogle()}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 h-12 rounded-2xl
                     bg-surface-card border border-border-default
                     text-sm font-semibold text-content-primary
                     hover:bg-overlay-hover transition-colors active:scale-95 disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          onClick={() => signInWithApple()}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 h-12 rounded-2xl
                     bg-surface-card border border-border-default
                     text-sm font-semibold text-content-primary
                     hover:bg-overlay-hover transition-colors active:scale-95 disabled:opacity-50"
        >
          <AppleIcon />
          Continue with Apple
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border-default" />
        <span className="text-xs text-content-muted">or sign up with email</span>
        <div className="flex-1 h-px bg-border-default" />
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
        {/* Name (optional — used for display name) */}
        <div className="relative">
          <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            className="w-full h-12 pl-10 pr-4 rounded-2xl
                       bg-surface-card border border-border-default
                       text-sm text-content-primary placeholder-content-muted
                       focus:outline-none focus:border-brand transition-colors"
          />
        </div>

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

        <div className="relative">
          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-secondary pointer-events-none" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Password (min. 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full h-12 pl-10 pr-11 rounded-2xl
                       bg-surface-card border border-border-default
                       text-sm text-content-primary placeholder-content-muted
                       focus:outline-none focus:border-brand transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-content-secondary"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {displayError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-xs text-status-error px-1"
          >
            {displayError}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 h-12 rounded-2xl
                     bg-primary text-text-on-brand font-semibold text-sm
                     hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-text-on-brand border-t-transparent animate-spin" />
          ) : (
            <>Create free account <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      <p className="text-xs text-content-muted text-center leading-relaxed">
        By signing up you agree to our{' '}
        <span className="text-primary-ink">Terms of Service</span> and{' '}
        <span className="text-primary-ink">Privacy Policy</span>.
      </p>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-content-secondary">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary-ink font-medium hover:underline">
            Sign in
          </Link>
        </p>
        <Link href="/" className="text-xs text-content-muted hover:text-content-secondary">
          Continue without account
        </Link>
      </div>
    </motion.div>
  )
}
