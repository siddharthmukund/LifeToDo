'use client'
// Settings — app preferences, contexts, export, ADHD mode.
// Updated in iCCW #3: migrated all gtd-* tokens to new design system.

import { useState } from 'react'
import { Settings, Plus, Trash2, Download, Bell, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useGTDStore } from '@/store/gtdStore'
import { dayLabel, formatTime12h } from '@/lib/utils'
import { db } from '@/lib/db'

const DAYS = [0, 1, 2, 3, 4, 5, 6]

export default function SettingsPage() {
  const { contexts, settings, updateSettings, addContext, deleteContext } = useGTDStore()
  const [newCtx, setNewCtx] = useState('')
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    const [inbox, actions, projects] = await Promise.all([
      db.inbox_items.toArray(),
      db.actions.toArray(),
      db.projects.toArray(),
    ])
    const data = {
      exportedAt: new Date().toISOString(),
      inbox,
      actions,
      projects,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gtd-life-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  async function handleNotificationToggle() {
    if (!settings) return
    if (!settings.notificationsEnabled) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        await updateSettings({ notificationsEnabled: true })
      }
    } else {
      await updateSettings({ notificationsEnabled: false })
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-xl border-b border-primary/10 px-6 pt-14 pb-4">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Settings size={22} className="text-primary fill-primary/20" />
          Settings
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">

        {/* ── Weekly Review ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
            Weekly Review
          </h2>
          <div className="bg-card-dark rounded-2xl border border-white/8 p-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-white mb-3">Review day</p>
              <div className="flex gap-1.5">
                {DAYS.map(d => (
                  <button
                    key={d}
                    onClick={() => updateSettings({ reviewDay: d })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-95
                      ${settings?.reviewDay === d
                        ? 'bg-primary text-background-dark shadow-glow-accent'
                        : 'bg-card-elevated text-slate-400 hover:text-white border border-white/5'}`}
                  >
                    {dayLabel(d)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-2">
                Review time
                {settings?.reviewTime && (
                  <span className="ml-2 text-primary text-xs font-bold">
                    {formatTime12h(settings.reviewTime)}
                  </span>
                )}
              </p>
              <input
                type="time"
                value={settings?.reviewTime ?? '17:00'}
                onChange={e => updateSettings({ reviewTime: e.target.value })}
                className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3
                           text-sm text-white focus:outline-none focus:border-primary/50 shadow-inner"
              />
            </div>
          </div>
        </section>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
            Notifications
          </h2>
          <div className="bg-card-dark rounded-2xl border border-white/8 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/8">
                  <Bell size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Review reminders</p>
                  <p className="text-xs text-slate-500 mt-0.5">Get nudged on your review day</p>
                </div>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`relative w-12 h-6 rounded-full transition-colors active:scale-95
                  ${settings?.notificationsEnabled ? 'bg-primary shadow-glow-accent' : 'bg-white/15'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                              ${settings?.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ── Accessibility / ADHD Mode ───────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
            Accessibility
          </h2>
          <div className="bg-card-dark rounded-2xl border border-white/8 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 border border-primary/20 text-primary font-bold text-sm">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium text-white">ADHD Mode</p>
                  <p className="text-xs text-slate-500 mt-0.5">Limits lists to 7 items · 1.5× larger font</p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ adhdMode: !settings?.adhdMode })}
                className={`relative w-12 h-6 rounded-full transition-colors active:scale-95
                  ${settings?.adhdMode ? 'bg-primary shadow-glow-accent' : 'bg-white/15'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                              ${settings?.adhdMode ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
            {settings?.adhdMode && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Zap size={14} className="text-primary flex-shrink-0" />
                <p className="text-xs font-bold text-primary">Active — 7-item pages · 1.5× font scale</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Contexts ────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
            Contexts
          </h2>
          <div className="bg-card-dark rounded-2xl border border-white/8 divide-y divide-white/5">
            {contexts.map(ctx => (
              <div key={ctx.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-base">{ctx.emoji}</span>
                <p className="flex-1 text-sm font-medium text-white">{ctx.name}</p>
                {!ctx.isDefault && (
                  <button
                    onClick={() => deleteContext(ctx.id)}
                    className="text-slate-500 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
            {/* Add context row */}
            <div className="flex items-center gap-2 px-5 py-3.5">
              <Plus size={15} className="text-slate-500 flex-shrink-0" />
              <input
                value={newCtx}
                onChange={e => setNewCtx(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCtx.trim()) {
                    addContext(newCtx.trim())
                    setNewCtx('')
                  }
                }}
                placeholder="Add context (e.g. @phone)"
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
              />
              {newCtx.trim() && (
                <button
                  onClick={() => { addContext(newCtx.trim()); setNewCtx('') }}
                  className="text-xs text-primary font-bold hover:text-primary/80 transition-colors"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Data & Export ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
            Data & Export
          </h2>
          <div className="bg-card-dark rounded-2xl border border-white/8 p-5 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              All data is stored locally on your device using IndexedDB.
              Export a JSON snapshot anytime — free tier included.
            </p>
            <Button
              variant="secondary"
              fullWidth
              loading={exporting}
              onClick={handleExport}
            >
              <Download size={16} /> Export as JSON
            </Button>
          </div>
        </section>

        {/* ── Account ─────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
            Account
          </h2>
          <div className="bg-card-dark rounded-2xl border border-white/8 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  {settings?.tier === 'pro' ? '⭐ Pro' : '🆓 Free tier'}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {settings?.tier === 'free'
                    ? '5 projects · 3 custom contexts · local storage'
                    : 'Unlimited everything · cloud sync · AI capture'}
                </p>
              </div>
              {settings?.tier === 'free' && (
                <button className="text-xs text-primary font-bold hover:underline transition-colors flex-shrink-0 ml-4">
                  Upgrade →
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  )
}
