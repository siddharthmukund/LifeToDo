// src/components/profile/ProfileForm.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader } from 'lucide-react'
import { updateProfile } from '@/lib/profileService'
import { ROLE_OPTIONS } from '@/components/onboarding/rolePresets'
import type { UserProfile, UserRole } from '@/types'

const TIMEZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf('timeZone')
  : ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo']

interface ProfileFormProps {
  profile: UserProfile
  onSaved?: (updated: UserProfile) => void
}

export function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const [form, setForm]       = useState({ ...profile })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')
  const [tzSearch, setTzSearch] = useState('')

  function patch(key: keyof UserProfile, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  const filteredTz = TIMEZONES.filter(tz =>
    tz.toLowerCase().includes(tzSearch.toLowerCase())
  ).slice(0, 50)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.displayName.trim()) { setError('Name is required.'); return }
    if (form.bio.length > 200) { setError('Bio must be 200 characters or fewer.'); return }
    setError('')
    setSaving(true)
    try {
      await updateProfile(profile.uid, {
        displayName: form.displayName.trim(),
        bio:         form.bio.trim(),
        timezone:    form.timezone,
        role:        form.role,
      })
      setSaved(true)
      onSaved?.({ ...form })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Display name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-content-secondary uppercase tracking-widest">
          Name
        </label>
        <input
          type="text"
          value={form.displayName}
          onChange={e => patch('displayName', e.target.value)}
          maxLength={80}
          placeholder="Your name"
          className="w-full h-12 px-4 rounded-xl bg-surface-card border border-border-default
                     text-sm text-content-primary placeholder-content-muted
                     focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-content-secondary uppercase tracking-widest flex justify-between">
          Bio
          <span className={form.bio.length > 180 ? 'text-status-warning' : ''}>
            {form.bio.length}/200
          </span>
        </label>
        <textarea
          value={form.bio}
          onChange={e => patch('bio', e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="A short note about yourself (optional)"
          className="w-full px-4 py-3 rounded-xl bg-surface-card border border-border-default
                     text-sm text-content-primary placeholder-content-muted resize-none
                     focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-content-secondary uppercase tracking-widest">
          Role
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map(opt => (
            <button
              key={opt.role}
              type="button"
              onClick={() => patch('role', opt.role as UserRole)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium
                transition-colors active:scale-95
                ${form.role === opt.role
                  ? 'bg-primary/10 border-primary/30 text-primary-ink'
                  : 'bg-surface-card border-border-default text-content-secondary hover:bg-overlay-hover'
                }`}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-content-secondary uppercase tracking-widest">
          Timezone
        </label>
        <input
          type="text"
          value={tzSearch || form.timezone}
          onFocus={() => setTzSearch('')}
          onChange={e => setTzSearch(e.target.value)}
          placeholder="Search timezone…"
          className="w-full h-12 px-4 rounded-xl bg-surface-card border border-border-default
                     text-sm text-content-primary placeholder-content-muted
                     focus:outline-none focus:border-brand transition-colors"
        />
        {tzSearch && (
          <div className="rounded-xl bg-surface-elevated border border-border-default
                          max-h-40 overflow-y-auto shadow-lg z-10">
            {filteredTz.length === 0 && (
              <p className="text-xs text-content-muted px-4 py-3">No results</p>
            )}
            {filteredTz.map(tz => (
              <button
                key={tz}
                type="button"
                onClick={() => { patch('timezone', tz); setTzSearch('') }}
                className="w-full text-left px-4 py-2.5 text-sm text-content-secondary
                           hover:bg-overlay-hover hover:text-content-primary transition-colors"
              >
                {tz}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-status-error px-1">{error}</p>}

      <motion.button
        type="submit"
        disabled={saving}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl
          font-semibold text-sm transition-all active:scale-95 disabled:opacity-60
          ${saved
            ? 'bg-status-success/15 text-status-success border border-status-success/20'
            : 'bg-primary text-text-on-brand hover:opacity-90'
          }`}
      >
        {saving ? (
          <Loader size={15} className="animate-spin" />
        ) : saved ? (
          <><Check size={15} /> Saved</>
        ) : (
          'Save changes'
        )}
      </motion.button>
    </form>
  )
}
