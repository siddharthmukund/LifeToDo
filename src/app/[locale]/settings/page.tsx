'use client'
// Settings — app preferences, contexts, export, ADHD mode.
// Updated in iCCW #6: NotificationPreferences, GTDPreferences,
// WorkingHoursEditor, ConsentManager wired in.

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Plus, Trash2, Download, Zap, User, Star, Database, ChevronRight, Trash } from 'lucide-react' // eslint-disable-line @typescript-eslint/no-unused-vars
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useGTDStore } from '@/store/gtdStore'
import { useAuth } from '@/auth/useAuth'
import { dayLabel, formatTime12h } from '@/lib/utils'
import { downloadExportJSON } from '@/lib/dataExportService'
import { NotificationPreferences } from '@/components/settings/NotificationPreferences'
import { GTDPreferences } from '@/components/settings/GTDPreferences'
import { WorkingHoursEditor } from '@/components/settings/WorkingHoursEditor'
import { ConsentManager } from '@/components/settings/ConsentManager'
import { GamificationSettings } from '@/components/gamification/GamificationSettings'
import { useTranslations } from 'next-intl'

const DAYS = [0, 1, 2, 3, 4, 5, 6]

export default function SettingsPage() {
  const t = useTranslations('settings')
  const { contexts, settings, updateSettings, addContext, deleteContext } = useGTDStore()
  const { user } = useAuth()
  const [newCtx, setNewCtx] = useState('')
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await downloadExportJSON()
    } finally {
      setExporting(false)
    }
  }


  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── TopAppBar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 glass-header px-6 pb-4 flex items-center justify-between min-h-[4rem]">
        <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-primary">
          Life To Do
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-9 h-9 rounded-full bg-surface-bright overflow-hidden ring-2 ring-primary/20">
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <User size={18} className="text-content-secondary" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Profile card ───────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-primary/20">
            <User size={36} className="text-content-secondary" />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-on-brand p-1 rounded-full">
            <Star size={12} />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-content-primary">{user?.displayName ?? user?.email?.split('@')[0] ?? 'You'}</h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mt-2">
          <Star size={12} className="text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{t('title')}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">

        {/* ── Weekly Review ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mb-3 px-1">
            {t('weeklyReview.label')}
          </h2>
          <div className="bg-surface-card rounded-2xl border border-border-default p-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-content-primary mb-3">{t('weeklyReview.reviewDay')}</p>
              <div className="flex gap-1.5">
                {DAYS.map(d => (
                  <button
                    key={d}
                    onClick={() => updateSettings({ reviewDay: d })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-95
                      ${settings?.reviewDay === d
                        ? 'bg-primary text-on-brand shadow-glow-accent'
                        : 'bg-surface-elevated text-content-secondary hover:text-content-primary border border-border-default'}`}
                  >
                    {dayLabel(d)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-content-primary mb-2">
                {t('weeklyReview.reviewTime')}
                {settings?.reviewTime && (
                  <span className="ml-2 text-primary-ink text-xs font-bold">
                    {formatTime12h(settings.reviewTime)}
                  </span>
                )}
              </p>
              <input
                type="time"
                value={settings?.reviewTime ?? '17:00'}
                onChange={e => updateSettings({ reviewTime: e.target.value })}
                className="w-full bg-surface-base border border-border-default rounded-xl px-4 py-3
                           text-sm text-content-primary focus:outline-none focus:border-brand shadow-inner"
              />
            </div>
          </div>
        </section>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <section>
          <NotificationPreferences />
        </section>

        {/* ── Accessibility / ADHD Mode ───────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mb-3 px-1">
            {t('accessibility')}
          </h2>
          <div className="bg-surface-card rounded-2xl border border-border-default p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 border border-primary/20 text-primary-ink font-bold text-sm">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium text-content-primary">{t('adhdMode.label')}</p>
                  <p className="text-xs text-content-secondary mt-0.5">{t('adhdMode.description')}</p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ adhdMode: !settings?.adhdMode })}
                className={`relative w-12 h-6 rounded-full transition-colors active:scale-95
                  ${settings?.adhdMode ? 'bg-primary shadow-glow-accent' : 'bg-overlay-dim'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                              ${settings?.adhdMode ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
            {settings?.adhdMode && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Zap size={14} className="text-primary-ink flex-shrink-0" />
                <p className="text-xs font-bold text-primary-ink">{t('adhdMode.active')}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Gamification Preferences ─────────────────────────────────────────────── */}
        <section>
          <div className="bg-surface-card rounded-2xl border border-border-default p-5">
            <GamificationSettings />
          </div>
        </section>

        {/* ── GTD Preferences ─────────────────────────────────────────────── */}
        <section>
          <GTDPreferences />
        </section>

        {/* ── Contexts ────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mb-3 px-1">
            {t('contexts.label')}
          </h2>
          <div className="bg-surface-card rounded-2xl border border-border-default divide-y divide-border-subtle">
            {contexts.map(ctx => (
              <div key={ctx.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-base flex-shrink-0">{ctx.emoji}</span>
                <p className="flex-1 text-sm font-medium text-content-primary">{ctx.name}</p>
                {!ctx.isDefault && (
                  <button
                    onClick={() => deleteContext(ctx.id)}
                    className="text-content-secondary hover:text-status-danger transition-colors p-1 rounded-lg hover:bg-status-danger-surface"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
            {/* Add context row */}
            <div className="flex items-center gap-2 px-5 py-3.5">
              <Plus size={15} className="text-content-secondary flex-shrink-0" />
              <input
                value={newCtx}
                onChange={e => setNewCtx(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCtx.trim()) {
                    addContext(newCtx.trim())
                    setNewCtx('')
                  }
                }}
                placeholder={t('contexts.addPlaceholder')}
                className="flex-1 bg-transparent text-sm text-content-primary placeholder-content-muted outline-none"
              />
              {newCtx.trim() && (
                <button
                  onClick={() => { addContext(newCtx.trim()); setNewCtx('') }}
                  className="text-xs text-primary-ink font-bold hover:text-primary-ink/80 transition-colors"
                >
                  {t('contexts.addButton')}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Working Hours ────────────────────────────────────────────────── */}
        <section>
          <WorkingHoursEditor />
        </section>

        {/* ── Data & Export ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mb-3 px-1">
            {t('data.label')}
          </h2>
          <div className="bg-surface-card rounded-2xl border border-border-default p-5 space-y-4">
            <p className="text-xs text-content-secondary leading-relaxed">
              {t('data.description')}
            </p>
            <Button
              variant="secondary"
              fullWidth
              loading={exporting}
              onClick={handleExport}
            >
              <Download size={16} /> {t('data.exportJson')}
            </Button>
          </div>
        </section>

        {/* ── Privacy & Consent ───────────────────────────────────────────── */}
        <section>
          <ConsentManager />
        </section>

        {/* ── Account ─────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mb-3 px-1">
            {t('account')}
          </h2>
          <div className="bg-surface-card rounded-2xl border border-border-default overflow-hidden divide-y divide-border-subtle">
            {/* Profile row */}
            <Link href={user ? '/profile' : '/auth/signin'}
              className="flex items-center justify-between px-5 py-4 hover:bg-overlay-hover transition-colors">
              <div className="flex items-center gap-3">
                <User size={17} className="text-content-secondary" />
                <div>
                  <p className="text-sm font-medium text-content-primary">
                    {user ? (user.displayName ?? user.email ?? t('profile')) : t('signIn')}
                  </p>
                  <p className="text-xs text-content-secondary">
                    {user ? t('manageProfile') : t('createAccount')}
                  </p>
                </div>
              </div>
              <ChevronRight size={15} className="text-content-muted" />
            </Link>

            {/* Subscription row */}
            <Link href="/subscription"
              className="flex items-center justify-between px-5 py-4 hover:bg-overlay-hover transition-colors">
              <div className="flex items-center gap-3">
                <Star size={17} className="text-content-secondary" />
                <div>
                  <p className="text-sm font-medium text-content-primary">{t('subscription.label')}</p>
                  <p className="text-xs text-content-secondary">
                    {settings?.tier === 'pro' ? t('subscription.active') : t('subscription.free')}
                  </p>
                </div>
              </div>
              <ChevronRight size={15} className="text-content-muted" />
            </Link>

            {/* Data export row */}
            <Link href="/profile#data"
              className="flex items-center justify-between px-5 py-4 hover:bg-overlay-hover transition-colors">
              <div className="flex items-center gap-3">
                <Database size={17} className="text-content-secondary" />
                <p className="text-sm font-medium text-content-primary">{t('yourData')}</p>
              </div>
              <ChevronRight size={15} className="text-content-muted" />
            </Link>

            {/* Account deletion row (only shown if signed in) */}
            {user && (
              <Link href="/profile#delete"
                className="flex items-center justify-between px-5 py-4 hover:bg-overlay-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Trash size={17} className="text-status-danger/70" />
                  <p className="text-sm font-medium text-status-danger">{t('deleteAccount')}</p>
                </div>
                <ChevronRight size={15} className="text-content-muted" />
              </Link>
            )}
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  )
}
