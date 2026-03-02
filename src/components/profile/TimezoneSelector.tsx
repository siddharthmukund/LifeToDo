// src/components/profile/TimezoneSelector.tsx
// Searchable dropdown for IANA timezone selection.
// iCCW #6 D2B deliverable.
'use client'

import { useState, useMemo } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'

// Curated list of common timezones — avoids relying on Intl.supportedValuesOf (not in all browsers)
const TIMEZONES = [
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
  'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/New_York',
  'America/Phoenix', 'America/Sao_Paulo', 'America/Toronto', 'America/Vancouver',
  'Asia/Bangkok', 'Asia/Dhaka', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Jakarta',
  'Asia/Karachi', 'Asia/Kolkata', 'Asia/Kuala_Lumpur', 'Asia/Manila',
  'Asia/Riyadh', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore',
  'Asia/Taipei', 'Asia/Tehran', 'Asia/Tokyo',
  'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney',
  'Europe/Amsterdam', 'Europe/Berlin', 'Europe/Dublin', 'Europe/Istanbul',
  'Europe/London', 'Europe/Madrid', 'Europe/Moscow', 'Europe/Paris',
  'Europe/Rome', 'Europe/Zurich',
  'Pacific/Auckland', 'Pacific/Honolulu',
  'UTC',
]

interface Props {
  value: string
  onChange: (tz: string) => void
}

export function TimezoneSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return q
      ? TIMEZONES.filter(tz => tz.toLowerCase().includes(q))
      : TIMEZONES
  }, [query])

  const display = value.replace(/_/g, ' ')

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2
                   bg-surface-base border border-border-default rounded-xl px-4 py-3
                   text-sm text-content-primary hover:border-primary/40 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-content-secondary flex-shrink-0" />
          <span>{display}</span>
        </div>
        <ChevronDown size={14} className={`text-content-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0
                        bg-surface-card border border-border-default rounded-2xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border-subtle">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search timezone…"
              className="w-full bg-surface-base border border-border-default rounded-xl
                         px-3 py-2 text-sm text-content-primary placeholder-content-muted
                         focus:outline-none focus:border-primary/40"
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-content-muted">No results</p>
            ) : (
              filtered.map(tz => (
                <button
                  key={tz}
                  type="button"
                  onClick={() => { onChange(tz); setOpen(false); setQuery('') }}
                  className="w-full flex items-center justify-between px-4 py-2.5
                             text-sm text-content-primary hover:bg-overlay-hover transition-colors"
                >
                  <span>{tz.replace(/_/g, ' ')}</span>
                  {tz === value && <Check size={14} className="text-primary-ink" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
