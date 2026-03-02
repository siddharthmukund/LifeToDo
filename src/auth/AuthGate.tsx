// src/auth/AuthGate.tsx
// Renders children when authenticated; shows an inline fallback otherwise.
// NEVER redirects — anonymous users must always be able to navigate freely.
'use client'

import Link from 'next/link'
import { User, LogIn } from 'lucide-react'
import { useAuthStore } from './authStore'

interface AuthGateProps {
  children: React.ReactNode
  /** Optional custom fallback. Defaults to an inline sign-in prompt. */
  fallback?: React.ReactNode
}

export function AuthGate({ children, fallback }: AuthGateProps) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <>{fallback ?? <DefaultSignInPrompt />}</>
  }

  return <>{children}</>
}

function DefaultSignInPrompt() {
  return (
    <div className="flex flex-col items-center gap-5 py-14 px-6 text-center">
      {/* Icon */}
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20">
        <User size={24} className="text-primary-ink" />
      </div>

      {/* Copy */}
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-content-primary">
          Sign in to continue
        </p>
        <p className="text-sm text-content-secondary max-w-xs">
          Create a free account to access your profile, sync across devices,
          and manage your subscription.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <Link
          href="/auth/signup"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl
                     bg-primary text-text-on-brand font-semibold text-sm
                     hover:opacity-90 transition-opacity active:scale-95"
        >
          <LogIn size={16} />
          Create free account
        </Link>
        <Link
          href="/auth/signin"
          className="text-sm text-primary-ink font-medium hover:underline"
        >
          Already have an account? Sign in
        </Link>
        <Link
          href="/"
          className="text-xs text-content-muted hover:text-content-secondary transition-colors"
        >
          Continue without account
        </Link>
      </div>
    </div>
  )
}
