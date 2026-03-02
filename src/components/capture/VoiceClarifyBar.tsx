'use client'
// VoiceClarifyBar — post-capture continuation for voice clarification.
// Single responsibility: listen to clarification speech, parse it, show chips.
// Activated by CaptureBar after initial capture. Emits onConfirm with result.

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Mic } from 'lucide-react'
import { useVoiceCapture } from '@/hooks/useVoiceCapture'
import { parseVoiceClarify } from '@/lib/parseVoiceClarify'
import { VoiceWave } from './VoiceWave'
import { ENERGY_CONFIG, TIME_CONFIG } from '@/constants/gtd'
import type { VoiceClarifyResult } from '@/types'

interface VoiceClarifyBarProps {
  projectNames: Record<string, string>
  onConfirm: (result: VoiceClarifyResult) => void
  onSkip: () => void
}

export function VoiceClarifyBar({ projectNames, onConfirm, onSkip }: VoiceClarifyBarProps) {
  const [result, setResult] = useState<VoiceClarifyResult | null>(null)

  const handleClarifyCapture = useCallback((text: string) => {
    const parsed = parseVoiceClarify(text, projectNames)
    setResult(parsed)
  }, [projectNames])

  const {
    status, transcript, audioLevel,
    startListening, stopListening,
  } = useVoiceCapture({ onCapture: handleClarifyCapture })

  const isListening = status === 'listening'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mt-3 rounded-2xl border border-gtd-accent/20 bg-gtd-accent/5 p-4"
    >
      {/* Prompt */}
      {!result && (
        <p className="text-xs text-primary-ink-ink mb-3 text-center">
          Keep talking to clarify — project, context, energy, time estimate
        </p>
      )}

      {/* Live transcript */}
      {isListening && transcript && (
        <p className="text-xs text-content-secondary italic mb-3 text-center">"{transcript}"</p>
      )}

      {/* Parsed result chips */}
      {result && (
        <div className="flex flex-wrap gap-2 mb-3">
          {result.destination && (
            <Chip color="accent">📋 {result.destination.replace('_', ' ')}</Chip>
          )}
          {result.contextId && (
            <Chip color="muted">📍 {result.contextId.replace('ctx-', '@')}</Chip>
          )}
          {result.energy && (
            <Chip color="energy">{ENERGY_CONFIG[result.energy].icon} {ENERGY_CONFIG[result.energy].label}</Chip>
          )}
          {result.timeEstimate && (
            <Chip color="muted">⏱ {TIME_CONFIG[result.timeEstimate].label}</Chip>
          )}
          {result.projectName && (
            <Chip color="accent">📁 {result.projectName}</Chip>
          )}
          {result.confidence < 0.4 && (
            <Chip color="warning">⚠ Low confidence — check fields</Chip>
          )}
        </div>
      )}

      {/* Waveform + mic row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center">
          {isListening
            ? <VoiceWave status={status} audioLevel={audioLevel} barCount={7} />
            : !result
            ? <p className="text-xs text-content-secondary">Tap mic to speak clarification</p>
            : null}
        </div>

        <div className="flex items-center gap-2">
          {/* Mic */}
          {!result && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${isListening
                  ? 'bg-status-error/15 text-content-primary'
                  : 'bg-gtd-accent/20 text-primary-ink-ink hover:bg-gtd-accent/30'}`}
            >
              <Mic size={18} />
            </button>
          )}

          {/* Confirm */}
          {result && (
            <button
              onClick={() => onConfirm(result)}
              className="flex items-center gap-1.5 px-3 py-2 bg-status-success/15/20 text-status-success
                         rounded-xl text-xs font-medium border border-gtd-success/30"
            >
              <Check size={14} /> Apply
            </button>
          )}

          {/* Skip */}
          <button
            onClick={onSkip}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-content-secondary hover:text-content-primary hover:bg-overlay-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Internal chip ─────────────────────────────────────────────────────────────
type ChipColor = 'accent' | 'muted' | 'energy' | 'warning'

const CHIP_STYLES: Record<ChipColor, string> = {
  accent:  'bg-gtd-accent/20 text-primary-ink-ink-light border-gtd-accent/30',
  muted:   'bg-overlay-hover text-content-primary border-border-default',
  energy:  'bg-status-warning/10/20 text-status-warning border-gtd-warning/30',
  warning: 'bg-status-error/15/10 text-status-error border-gtd-danger/20',
}

function Chip({ children, color }: { children: React.ReactNode; color: ChipColor }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                      font-medium border ${CHIP_STYLES[color]}`}>
      {children}
    </span>
  )
}
