// src/components/auth/AuthMethodLinker.tsx
// Link additional OAuth providers to an existing account.
'use client'

import { motion } from 'framer-motion'
import { Link2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import type { AuthProviderType } from '@/auth/types'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor">
      <path d="M14.046 0c.03 1.565-.453 2.71-1.2 3.57-.742.843-1.765 1.49-3.022 1.395-.063-1.48.476-2.624 1.215-3.465C11.8.637 12.977.065 14.046 0ZM18 13.024c-.44 1.284-.976 2.35-1.718 3.324C15.455 17.5 14.67 18 13.726 18c-.826 0-1.374-.55-2.525-.55-1.148 0-1.756.554-2.607.554-.926 0-1.767-.558-2.638-1.748C4.67 14.626 3.6 12.246 3.6 9.97c0-3.685 2.4-5.636 4.765-5.636.942 0 1.727.616 2.322.616.574 0 1.47-.654 2.558-.654.413 0 1.68.043 2.55 1.287-.065.039-1.526.892-1.51 2.656.017 2.115 1.86 2.818 1.715 2.785Z"/>
    </svg>
  )
}

const LINKABLE_PROVIDERS: Array<{
  id: AuthProviderType
  label: string
  icon: React.ReactNode
}> = [
  { id: 'google.com', label: 'Google',      icon: <GoogleIcon /> },
  { id: 'apple.com',  label: 'Apple',       icon: <AppleIcon /> },
]

export function AuthMethodLinker() {
  const { user, linkAuthProvider, error, isLoading } = useAuth()
  const linked = new Set(user?.providers ?? [])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-content-secondary">
        <Link2 size={12} />
        Sign-in methods
      </div>

      <div className="bg-surface-card rounded-2xl border border-border-default overflow-hidden divide-y divide-border-subtle">
        {/* Email/password — always shown if user has email */}
        {user?.email && (
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-overlay-hover flex items-center justify-center text-content-secondary text-xs font-bold">
                @
              </div>
              <div>
                <p className="text-sm font-medium text-content-primary">Email</p>
                <p className="text-xs text-content-secondary">{user.email}</p>
              </div>
            </div>
            {linked.has('email') && (
              <CheckCircle size={16} className="text-status-success flex-shrink-0" />
            )}
          </div>
        )}

        {LINKABLE_PROVIDERS.map(p => {
          const isLinked = linked.has(p.id)
          return (
            <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-overlay-hover flex items-center justify-center">
                  {p.icon}
                </div>
                <p className="text-sm font-medium text-content-primary">{p.label}</p>
              </div>
              {isLinked ? (
                <CheckCircle size={16} className="text-status-success flex-shrink-0" />
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => linkAuthProvider(p.id === 'google.com' ? 'google' : 'apple')}
                  disabled={isLoading}
                  className="text-xs text-primary-ink font-semibold hover:underline disabled:opacity-50"
                >
                  Connect
                </motion.button>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="text-xs text-status-error px-1">{error}</p>}
    </div>
  )
}
