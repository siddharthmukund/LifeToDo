'use client'

import { useEffect, useState } from 'react'
import { User, LogOut, Shield, Download, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { AuthGate } from '@/auth/AuthGate'
import { useAuth } from '@/auth/useAuth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileStatsCard } from '@/components/profile/ProfileStatsCard'
import { DataSummary } from '@/components/profile/DataSummary'
import { DeletionWizard } from '@/components/profile/DeletionWizard'
import { AuthMethodLinker } from '@/components/auth/AuthMethodLinker'
import { fetchProfile } from '@/lib/profileService'
import { downloadExportJSON, downloadExportMarkdown, downloadExportCSV } from '@/lib/dataExportService'
import type { UserProfile } from '@/types'

function ProfileContent() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeletion, setShowDeletion] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<'json' | 'csv' | 'md' | null>(null)

  async function handleExport(format: 'json' | 'csv' | 'md') {
    setExportingFormat(format)
    try {
      if (format === 'json') await downloadExportJSON()
      else if (format === 'csv') await downloadExportCSV()
      else await downloadExportMarkdown()
    } finally {
      setExportingFormat(null)
    }
  }

  useEffect(() => {
    if (!user?.uid) return
    fetchProfile(user.uid)
      .then(p => {
        if (p) setProfile(p)
        else {
          // Build a minimal profile from Firebase user
          setProfile({
            uid:            user.uid,
            email:          user.email,
            displayName:    user.displayName ?? '',
            avatarUrl:      user.photoURL,
            bio:            '',
            timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone,
            role:           'custom',
            workingHours:   { enabled: false, days: [1,2,3,4,5], startTime: '09:00', endTime: '18:00' },
            reviewSchedule: { dayOfWeek: 0, timeOfDay: '18:00', reminderMinutesBefore: 30 },
            defaultContexts: [],
            createdAt:      new Date().toISOString(),
            updatedAt:      new Date().toISOString(),
          })
        }
      })
      .finally(() => setLoading(false))
  }, [user?.uid])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
      {/* Header */}
      <ProfileHeader profile={profile} />

      {/* Lifetime stats */}
      <ProfileStatsCard />

      {/* Edit profile */}
      <section className="space-y-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
          Profile
        </h2>
        <div className="bg-surface-card rounded-2xl border border-border-default p-5">
          <ProfileForm profile={profile} onSaved={setProfile} />
        </div>
      </section>

      {/* Sign-in methods */}
      <section>
        <AuthMethodLinker />
      </section>

      {/* Account links */}
      <section className="space-y-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
          Account
        </h2>
        <div className="bg-surface-card rounded-2xl border border-border-default overflow-hidden divide-y divide-border-subtle">
          <Link href="/subscription" className="flex items-center justify-between px-5 py-4 hover:bg-overlay-hover transition-colors">
            <div className="flex items-center gap-3">
              <Shield size={17} className="text-content-secondary" />
              <p className="text-sm font-medium text-content-primary">Subscription</p>
            </div>
            <ChevronRight size={15} className="text-content-muted" />
          </Link>
        </div>
      </section>

      {/* Your data */}
      <section id="data" className="space-y-3">
        <DataSummary />
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
            Export your data
          </p>
          {(
            [
              { fmt: 'json' as const, label: 'JSON (machine-readable · GDPR Art. 20)', ext: '.json' },
              { fmt: 'csv'  as const, label: 'CSV (spreadsheet, per table)', ext: '.csv' },
              { fmt: 'md'   as const, label: 'Markdown (human-readable archive)', ext: '.md' },
            ] as const
          ).map(({ fmt, label }) => (
            <button
              key={fmt}
              onClick={() => void handleExport(fmt)}
              disabled={exportingFormat !== null}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl
                         bg-surface-card border border-border-default
                         text-sm font-medium text-content-secondary
                         hover:bg-surface-elevated hover:border-primary/30 transition-colors active:scale-95
                         disabled:opacity-40 disabled:pointer-events-none"
            >
              {exportingFormat === fmt
                ? <span className="size-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                : <Download size={15} />
              }
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Account deletion */}
      {!showDeletion ? (
        <section>
          <button
            onClick={() => setShowDeletion(true)}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl
                       bg-surface-card border border-status-danger/20
                       text-sm font-medium text-status-danger/70
                       hover:bg-status-danger/5 hover:text-status-danger transition-colors active:scale-95"
          >
            Delete account
          </button>
        </section>
      ) : (
        <DeletionWizard onCancel={() => setShowDeletion(false)} />
      )}

      {/* Sign out */}
      <section>
        <button
          onClick={signOut}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl
                     bg-surface-card border border-border-default
                     text-sm font-medium text-content-secondary
                     hover:bg-overlay-hover hover:text-status-danger transition-colors active:scale-95"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </section>

      <div className="h-8" />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl
                      border-b border-border-default px-6 pt-14 pb-4">
        <h1 className="text-2xl font-display font-bold text-content-primary flex items-center gap-2">
          <User size={22} className="text-primary-ink" />
          Profile
        </h1>
      </div>

      <AuthGate>
        <ProfileContent />
      </AuthGate>
    </div>
  )
}
