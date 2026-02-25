'use client'
// StreakCalendar — compact dot-grid review streak visualisation.
// Shows the last N weeks as rows of 7 dots.
// Completed days filled with primary colour; today outlined.
// Single responsibility: visual representation of streak data.

import { cn } from '@/lib/utils'

interface StreakCalendarProps {
  /** ISO date strings for days a review was completed */
  completedDates: string[]
  /** Number of weeks to show (rows of 7). Default 6. */
  weeks?: number
  className?: string
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function buildGrid(completedSet: Set<string>, weeks: number): { date: string; state: 'done' | 'today' | 'empty' | 'future' }[][] {
  const grid: ReturnType<typeof buildGrid>[number][] = []
  const todayStr = toYMD(new Date())

  // Start from `weeks` weeks ago — on the most recent Sunday
  const start = new Date()
  start.setDate(start.getDate() - start.getDay() - (weeks - 1) * 7)
  start.setHours(0, 0, 0, 0)

  for (let w = 0; w < weeks; w++) {
    const row: ReturnType<typeof buildGrid>[number] = []
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start)
      cell.setDate(start.getDate() + w * 7 + d)
      const cellStr = toYMD(cell)
      const state =
        cellStr > todayStr  ? 'future'
        : cellStr === todayStr ? 'today'
        : completedSet.has(cellStr) ? 'done'
        : 'empty'
      row.push({ date: cellStr, state })
    }
    grid.push(row)
  }
  return grid
}

export function StreakCalendar({ completedDates, weeks = 6, className }: StreakCalendarProps) {
  const completedSet = new Set(completedDates.map(d => d.slice(0, 10)))
  const grid = buildGrid(completedSet, weeks)

  return (
    <div className={cn('select-none', className)}>
      {/* Day-of-week headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((d, i) => (
          <span
            key={i}
            className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-600"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Dot grid */}
      <div className="flex flex-col gap-1">
        {grid.map((row, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {row.map(({ date, state }) => (
              <div
                key={date}
                title={date}
                className={cn(
                  'aspect-square rounded-full transition-colors',
                  state === 'done'   && 'bg-primary shadow-glow-primary',
                  state === 'today'  && 'bg-transparent border-2 border-primary',
                  state === 'empty'  && 'bg-white/6',
                  state === 'future' && 'bg-white/3',
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
