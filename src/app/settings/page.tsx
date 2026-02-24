'use client'
import { useState } from 'react'
import { Settings, Plus, Trash2, Download, Bell } from 'lucide-react'
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
      <div className="sticky top-0 z-10 bg-gtd-bg/95 backdrop-blur-xl border-b border-white/5 px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gtd-text flex items-center gap-2">
          <Settings size={22} className="text-gtd-accent" />
          Settings
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-8">

        {/* Weekly Review Schedule */}
        <section>
          <h2 className="text-xs text-gtd-muted uppercase tracking-wider mb-3">Weekly Review</h2>
          <div className="bg-gtd-surface rounded-2xl border border-white/8 p-4 space-y-4">
            <div>
              <p className="text-sm text-gtd-text mb-2">Review day</p>
              <div className="flex gap-1.5">
                {DAYS.map(d => (
                  <button
                    key={d}
                    onClick={() => updateSettings({ reviewDay: d })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors
                      ${settings?.reviewDay === d
                        ? 'bg-gtd-accent text-white'
                        : 'bg-white/5 text-gtd-muted hover:bg-white/10'}`}
                  >
                    {dayLabel(d)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gtd-text mb-2">
                Review time
                {settings?.reviewTime && (
                  <span className="ml-2 text-gtd-accent text-xs">
                    {formatTime12h(settings.reviewTime)}
                  </span>
                )}
              </p>
              <input
                type="time"
                value={settings?.reviewTime ?? '17:00'}
                onChange={e => updateSettings({ reviewTime: e.target.value })}
                className="w-full bg-gtd-bg border border-white/10 rounded-xl px-4 py-3
                           text-sm text-gtd-text focus:outline-none focus:border-gtd-accent/50"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xs text-gtd-muted uppercase tracking-wider mb-3">Notifications</h2>
          <div className="bg-gtd-surface rounded-2xl border border-white/8 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gtd-muted" />
                <div>
                  <p className="text-sm text-gtd-text">Review reminders</p>
                  <p className="text-xs text-gtd-muted">Get nudged on your review day</p>
                </div>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`relative w-12 h-6 rounded-full transition-colors
                  ${settings?.notificationsEnabled ? 'bg-gtd-accent' : 'bg-white/20'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow
                              transition-transform
                              ${settings?.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Accessibility / ADHD Mode */}
        <section>
          <h2 className="text-xs text-gtd-muted uppercase tracking-wider mb-3">Accessibility</h2>
          <div className="bg-gtd-surface rounded-2xl border border-white/8 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gtd-accent/20 text-gtd-accent font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm text-gtd-text">ADHD Mode</p>
                  <p className="text-xs text-gtd-muted">Limits lists to 7 items, 1.5x larger font</p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ adhdMode: !settings?.adhdMode })}
                className={`relative w-12 h-6 rounded-full transition-colors
                  ${settings?.adhdMode ? 'bg-gtd-accent' : 'bg-white/20'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow
                              transition-transform
                              ${settings?.adhdMode ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Contexts */}
        <section>
          <h2 className="text-xs text-gtd-muted uppercase tracking-wider mb-3">Contexts</h2>
          <div className="bg-gtd-surface rounded-2xl border border-white/8 divide-y divide-white/5">
            {contexts.map(ctx => (
              <div key={ctx.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-base">{ctx.emoji}</span>
                <p className="flex-1 text-sm text-gtd-text">{ctx.name}</p>
                {!ctx.isDefault && (
                  <button
                    onClick={() => deleteContext(ctx.id)}
                    className="text-gtd-muted hover:text-gtd-danger transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}

            {/* Add context */}
            <div className="flex items-center gap-2 px-4 py-3">
              <Plus size={15} className="text-gtd-muted flex-shrink-0" />
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
                className="flex-1 bg-transparent text-sm text-gtd-text placeholder-gtd-muted outline-none"
              />
              {newCtx.trim() && (
                <button
                  onClick={() => { addContext(newCtx.trim()); setNewCtx('') }}
                  className="text-xs text-gtd-accent"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Data */}
        <section>
          <h2 className="text-xs text-gtd-muted uppercase tracking-wider mb-3">Data & Export</h2>
          <div className="bg-gtd-surface rounded-2xl border border-white/8 p-4 space-y-3">
            <p className="text-xs text-gtd-muted">
              All data is stored locally on your device. Export anytime — free tier included.
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

        {/* Account */}
        <section>
          <h2 className="text-xs text-gtd-muted uppercase tracking-wider mb-3">Account</h2>
          <div className="bg-gtd-surface rounded-2xl border border-white/8 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gtd-text">
                  {settings?.tier === 'pro' ? '⭐ Pro' : '🆓 Free tier'}
                </p>
                <p className="text-xs text-gtd-muted mt-0.5">
                  {settings?.tier === 'free'
                    ? '5 projects · 3 custom contexts · local storage'
                    : 'Unlimited everything · cloud sync · AI capture'}
                </p>
              </div>
              {settings?.tier === 'free' && (
                <button className="text-xs text-gtd-accent font-medium hover:underline">
                  Upgrade →
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="h-4" />
      </div>
    </div>
  )
}
