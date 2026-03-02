// src/components/settings/NotificationPreferences.tsx
// Per-category notification toggles. Respects working hours.
// iCCW #6 D3B deliverable.
'use client'

import { Bell, BellOff } from 'lucide-react'
import { useGTDStore } from '@/store/gtdStore'

interface NotifRow {
  key: string
  label: string
  description: string
  settingsKey: keyof import('@/types').Settings | null
  alwaysOn?: boolean
}

const ROWS: NotifRow[] = [
  {
    key: 'review_reminder',
    label: 'Weekly review reminder',
    description: 'Nudge on your review day',
    settingsKey: 'notificationsEnabled',
  },
  {
    key: 'inbox_zero',
    label: 'Inbox zero celebration',
    description: 'Celebrate clearing your inbox',
    settingsKey: null,
    alwaysOn: true,
  },
]

export function NotificationPreferences() {
  const { settings, updateSettings } = useGTDStore()

  if (!settings) return null

  async function toggle(key: keyof import('@/types').Settings) {
    if (!settings) return
    const current = settings[key] as boolean
    if (!current) {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
    }
    await updateSettings({ [key]: !current } as Partial<import('@/types').Settings>)
  }

  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
        Notifications
      </h2>
      <div className="bg-surface-card rounded-2xl border border-border-default divide-y divide-border-subtle">
        {ROWS.map(row => {
          const isOn = row.alwaysOn
            ? true
            : row.settingsKey
              ? Boolean(settings[row.settingsKey])
              : false

          return (
            <div key={row.key} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-overlay-hover border border-border-default">
                  {isOn
                    ? <Bell size={15} className="text-primary-ink" />
                    : <BellOff size={15} className="text-content-muted" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-content-primary">{row.label}</p>
                  <p className="text-xs text-content-secondary mt-0.5">{row.description}</p>
                </div>
              </div>
              {row.alwaysOn ? (
                <span className="text-xs text-content-muted font-medium">Always on</span>
              ) : row.settingsKey ? (
                <button
                  onClick={() => toggle(row.settingsKey!)}
                  className={`relative w-11 h-6 rounded-full transition-colors active:scale-95
                    ${isOn ? 'bg-primary shadow-glow-accent' : 'bg-overlay-active'}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                      ${isOn ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-content-muted px-1">
        Notifications outside your working hours are held until the next working day.
      </p>
    </div>
  )
}
