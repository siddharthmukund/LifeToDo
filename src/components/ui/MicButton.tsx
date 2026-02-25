'use client'
// MicButton — standalone hero mic component.
// Renders the primary voice-capture CTA with pulse rings during recording.
// Single responsibility: visual state of mic (idle | listening | processing).
// Wiring to Web Speech API is the parent's concern.

import { motion } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MicStatus = 'idle' | 'listening' | 'processing'

interface MicButtonProps {
  status: MicStatus
  onClick: () => void
  /** Size variant — maps to diameter */
  size?: 'sm' | 'md' | 'lg'
  /** Override aria-label */
  label?: string
  className?: string
}

const SIZE_MAP = {
  sm: { button: 'size-14',  icon: 20, ring: 'size-20'  },
  md: { button: 'size-20',  icon: 28, ring: 'size-28'  },
  lg: { button: 'size-[5.5rem]', icon: 36, ring: 'size-[7.5rem]' },
}

export function MicButton({ status, onClick, size = 'md', label, className }: MicButtonProps) {
  const dim     = SIZE_MAP[size]
  const isActive = status === 'listening'
  const isBusy   = status === 'processing'

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* ── Pulse rings — only visible when listening ─────────────────────── */}
      {isActive && (
        <>
          <span
            className={cn(
              'absolute rounded-full bg-primary/20 animate-pulse-ring',
              dim.ring,
            )}
          />
          <span
            className={cn(
              'absolute rounded-full bg-primary/10 animate-pulse-ring-2',
              dim.ring,
            )}
          />
        </>
      )}

      {/* ── Core button ───────────────────────────────────────────────────── */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.93 }}
        disabled={isBusy}
        aria-label={label ?? (isActive ? 'Stop recording' : 'Start voice capture')}
        className={cn(
          'relative z-10 rounded-full flex items-center justify-center',
          'transition-all duration-250 select-none focus-visible:outline-none',
          'min-h-[44px] min-w-[44px]', // WCAG touch target floor
          dim.button,
          isActive
            ? 'bg-primary/15 border-2 border-primary text-primary shadow-glow-primary active-glow'
            : isBusy
            ? 'bg-card-dark border border-primary/30 text-primary/60 cursor-not-allowed'
            : 'bg-card-dark border border-white/8 text-slate-400 hover:border-primary/40 hover:text-primary shadow-card',
        )}
      >
        {/* Spinner when processing */}
        {isBusy ? (
          <span
            className="block rounded-full border-2 border-primary/30 border-t-primary animate-spin"
            style={{ width: dim.icon, height: dim.icon }}
          />
        ) : isActive ? (
          <MicOff size={dim.icon} strokeWidth={2} />
        ) : (
          <Mic size={dim.icon} strokeWidth={1.75} />
        )}
      </motion.button>
    </div>
  )
}
