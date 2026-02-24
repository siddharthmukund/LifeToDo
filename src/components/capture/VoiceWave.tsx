'use client'
// VoiceWave — animated waveform bars that react to audio level.
// When listening: bars animate with audioLevel driving amplitude.
// When idle: bars are flat.

import { motion } from 'framer-motion'
import type { VoiceCaptureStatus } from '@/hooks/useVoiceCapture'

interface VoiceWaveProps {
  status: VoiceCaptureStatus
  audioLevel: number   // 0–1
  barCount?: number
}

export function VoiceWave({ status, audioLevel, barCount = 5 }: VoiceWaveProps) {
  const isListening = status === 'listening'

  return (
    <div className="flex items-center justify-center gap-1 h-8" aria-hidden>
      {Array.from({ length: barCount }).map((_, i) => {
        // Each bar gets a phase offset so they move independently
        const delay  = (i / barCount) * 0.3
        const height = isListening
          ? Math.max(4, 28 * audioLevel * (0.6 + Math.random() * 0.4))
          : 4

        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-gtd-accent"
            animate={{ height }}
            transition={
              isListening
                ? { duration: 0.15, delay, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }
                : { duration: 0.3, ease: 'easeOut' }
            }
            style={{ minHeight: 4 }}
          />
        )
      })}
    </div>
  )
}
