'use client'
// TwoMinuteTimer — circular SVG countdown for the GTD 2-minute rule.
// When time runs out, calls onExpire so the flow can move to the next step.

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface TwoMinuteTimerProps {
  onDone:    () => void   // user completed the task
  onExpire:  () => void   // time ran out — route to normal flow
  actionText: string
}

const TOTAL = 120 // seconds

export function TwoMinuteTimer({ onDone, onExpire, actionText }: TwoMinuteTimerProps) {
  const [remaining, setRemaining] = useState(TOTAL)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [onExpire])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const progress = remaining / TOTAL

  // SVG circle math
  const r = 44
  const circumference = 2 * Math.PI * r
  const dash = circumference * progress

  const urgent = remaining <= 30

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Action text */}
      <div className="bg-surface-card rounded-xl px-4 py-3 w-full border border-border-default">
        <p className="text-xs text-content-secondary mb-1">Do it now:</p>
        <p className="text-sm font-medium text-content-primary">{actionText}</p>
      </div>

      {/* Circular timer */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          {/* Progress */}
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={urgent ? 'var(--status-danger-fg)' : 'var(--primary)'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Countdown text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-2xl font-bold font-mono tabular-nums
              ${urgent ? 'text-status-error' : 'text-content-primary'}`}
          >
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>
          {urgent && (
            <span className="text-xs text-status-error mt-0.5">hurry!</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onDone}
          className="w-full py-3.5 rounded-xl bg-status-success/15/20 text-status-success
                     border border-gtd-success/30 font-semibold text-sm
                     active:scale-95 transition-transform"
        >
          ✓ Done — it's complete!
        </button>
        <button
          onClick={onExpire}
          className="w-full py-3 rounded-xl bg-overlay-hover text-content-secondary
                     border border-border-default text-sm
                     active:scale-95 transition-transform"
        >
          Needs more time →
        </button>
      </div>
    </div>
  )
}
