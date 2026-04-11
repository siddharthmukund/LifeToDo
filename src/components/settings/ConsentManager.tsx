// src/components/settings/ConsentManager.tsx
// GDPR/DPDP consent toggles — reads/writes to Dexie consent_log.
// iCCW #6 D6C deliverable.
'use client'

import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import type { ConsentType } from '@/types'

interface ConsentItem {
  type: ConsentType
  label: string
  description: string
  required: boolean
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    type: 'core_processing',
    label: 'Core data processing',
    description: 'Required for GTD functionality — cannot be disabled',
    required: true,
  },
  {
    type: 'analytics',
    label: 'Usage analytics',
    description: 'Anonymous GTD behaviour events (no PII)',
    required: false,
  },
  {
    type: 'sync',
    label: 'Cloud sync',
    description: 'Sync data to Firestore for multi-device access',
    required: false,
  },
  {
    type: 'notifications',
    label: 'Push notifications',
    description: 'Review reminders and stale item nudges',
    required: false,
  },
  {
    type: 'crash_reporting',
    label: 'Crash reporting',
    description: 'Send anonymised error logs to improve the app',
    required: false,
  },
]

export function ConsentManager() {
  const [granted, setGranted] = useState<Record<ConsentType, boolean>>({
    core_processing: true,
    analytics: true,
    sync: true,
    notifications: false,
    crash_reporting: true,
  })

  useEffect(() => {
    async function load() {
      // For each type, find the most recent consent record
      const state = { ...granted }
      for (const { type } of CONSENT_ITEMS) {
        const records = await db.consent_log
          .where('type').equals(type)
          .reverse()
          .sortBy('timestamp')
        if (records.length > 0) {
          state[type] = records[0].granted
        }
      }
      setGranted(state)
    }
    void load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle(type: ConsentType) {
    const next = !granted[type]
    setGranted(prev => ({ ...prev, [type]: next }))
    await db.consent_log.add({
      id: uuidv4(),
      type,
      granted: next,
      timestamp: new Date().toISOString(),
      method: 'settings',
      appVersion: '1.0.0',
    })
  }

  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
        Privacy & Consent
      </h2>
      <div className="bg-surface-card rounded-2xl border border-border-default divide-y divide-border-subtle">
        {CONSENT_ITEMS.map(item => (
          <div key={item.type} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
              <Shield size={15} className="text-content-secondary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-content-primary">{item.label}</p>
                <p className="text-xs text-content-secondary mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
            {item.required ? (
              <span className="text-xs text-content-muted font-medium flex-shrink-0">Required</span>
            ) : (
              <button
                type="button"
                role="switch"
                aria-checked={granted[item.type]}
                onClick={() => void toggle(item.type)}
                style={{ backgroundColor: granted[item.type] ? '#37f6dd' : '#2b2a3c' }}
                className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 active:scale-95
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37f6dd]/50"
              >
                <span
                  className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
                  style={{ transform: granted[item.type] ? 'translateX(22px)' : 'translateX(3px)' }}
                />
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-content-muted px-1">
        Consent records are stored locally. You can withdraw consent at any time.
        Deleting your account removes all consent records.
      </p>
    </div>
  )
}
