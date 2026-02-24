'use client'
// CaptureBar — primary GTD capture entry point.
// Voice is the hero (large pulsing mic button). Text input as fallback.
// After a successful capture, optionally enters clarify mode (voice enrichment).
// Single responsibility: capture + optional one-shot clarification.

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, X, Zap } from 'lucide-react'
import { useVoiceCapture } from '@/hooks/useVoiceCapture'
import { VoiceWave } from './VoiceWave'
import { VoiceClarifyBar } from './VoiceClarifyBar'
import { db } from '@/lib/db'
import { cn } from '@/lib/utils'
import type { VoiceClarifyResult } from '@/types'

interface CaptureBarProps {
  /** Called when capture (+ optional clarify) is complete. */
  onCapture: (text: string, source: 'voice' | 'text', clarify?: VoiceClarifyResult) => void
  className?: string
}

export function CaptureBar({ onCapture, className }: CaptureBarProps) {
  const [textMode, setTextMode] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [clarifyMode, setClarifyMode] = useState(false)
  const [capturedText, setCapturedText] = useState('')
  const [capturedSource, setCapturedSource] = useState<'voice' | 'text'>('voice')
  const [projectNames, setProjectNames] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // Pre-load active project names for fuzzy matching in VoiceClarifyBar
  const loadProjectNames = useCallback(async () => {
    try {
      const projects = await db.projects.filter(p => p.status === 'active').toArray()
      const names: Record<string, string> = {}
      for (const p of projects) names[p.id] = p.name
      setProjectNames(names)
    } catch {
      // Non-fatal — clarify works without project matching
    }
  }, [])

  /** Enter voice-clarify mode after a successful initial capture. */
  function enterClarifyMode(text: string, source: 'voice' | 'text') {
    setCapturedText(text)
    setCapturedSource(source)
    setClarifyMode(true)
    setTextMode(false)
    setInputValue('')
    void loadProjectNames()
  }

  /** Reset all state after clarify completes or is skipped. */
  function exitClarifyMode() {
    setClarifyMode(false)
    setCapturedText('')
  }

  const handleClarifyConfirm = useCallback(
    (result: VoiceClarifyResult) => {
      onCapture(capturedText, capturedSource, result)
      exitClarifyMode()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capturedText, capturedSource, onCapture],
  )

  const handleClarifySkip = useCallback(() => {
    onCapture(capturedText, capturedSource)
    exitClarifyMode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedText, capturedSource, onCapture])

  // ── Voice capture hook ────────────────────────────────────────────────────
  const {
    status, transcript, isSupported, errorMessage, audioLevel,
    startListening, stopListening, cancelListening,
  } = useVoiceCapture({
    onCapture: (text) => enterClarifyMode(text, 'voice'),
  })

  const isListening = status === 'listening'
  const isProcessing = status === 'processing'

  useEffect(() => {
    if (status === 'idle' && transcript === '') setTextMode(false)
  }, [status, transcript])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleTextSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    enterClarifyMode(trimmed, 'text')
  }

  function handleMicClick() {
    if (isListening) { stopListening(); return }
    if (!isSupported) {
      setTextMode(true)
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }
    setTextMode(false)
    startListening()
  }

  function handleTextModeOpen() {
    if (isListening) cancelListening()
    setTextMode(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn('w-full flex flex-col items-center justify-center', className)}>

      {/* Voice Orb Area */}
      <AnimatePresence mode="wait">
        {!textMode ? (
          <motion.div
            key="voice-orb"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full flex flex-col items-center gap-6 my-10"
          >
            {/* Massive Mic Button */}
            <motion.div
              className="relative cursor-pointer select-none"
              onClick={handleMicClick}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer decorative ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-primary/10"
                animate={isListening ? { scale: [1.1, 1.4, 1.1], opacity: [0.5, 0.1, 0.5] } : { scale: 1.25 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Inner animated glow when listening */}
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Core Button Area */}
              <div className={cn(
                "relative flex size-36 md:size-40 items-center justify-center rounded-full transition-all duration-300",
                isListening
                  ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_40px_rgba(43,238,108,0.3)]"
                  : "bg-card-dark text-slate-500 border border-white/5 hover:border-primary/30 shadow-2xl"
              )}>

                {isListening ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <VoiceWave status={status} audioLevel={audioLevel} barCount={7} />
                  </div>
                ) : (
                  <Mic size={48} className="opacity-50" strokeWidth={1.5} />
                )}
              </div>
            </motion.div>

            {/* Transcript & Status */}
            <div className="text-center space-y-2 h-20 flex flex-col items-center justify-start">
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="listening-status"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-primary font-bold text-xs pos uppercase tracking-[0.2em] mb-2 animate-pulse">
                      Listening...
                    </p>
                    {transcript && (
                      <h3 className="text-slate-100 text-lg md:text-xl font-bold leading-tight px-8 font-display italic">
                        "{transcript}"
                      </h3>
                    )}
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div
                    key="processing-status"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="size-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-2" />
                    <p className="text-primary text-xs uppercase tracking-widest font-bold">Processing audio</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle-status"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <p className="text-slate-500 text-sm font-medium mb-2">Tap to voice capture</p>
                    <button
                      autoFocus
                      onClick={handleTextModeOpen}
                      className="text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors px-4 py-2"
                    >
                      or type
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 text-center mt-2 max-w-[80%]"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Text Input Mode */
          <motion.form
            key="text-input"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-[90%] flex flex-col gap-3 my-10"
            onSubmit={handleTextSubmit}
          >
            <div className="w-full flex items-center gap-2 bg-card-dark border border-white/10
                            rounded-2xl px-4 py-4 focus-within:border-primary/50 shadow-2xl transition-colors">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Capture anything on your mind…"
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-base outline-none"
                autoComplete="off"
                autoCorrect="on"
                autoFocus
              />
              {inputValue && (
                <button type="button" onClick={() => setInputValue('')} className="text-slate-500 hover:text-slate-300">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="flex justify-between items-center px-2">
              <button
                type="button"
                onClick={() => { setTextMode(false); setInputValue('') }}
                className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 px-2 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-6 py-2.5 rounded-full bg-primary text-background-dark font-bold text-sm
                           disabled:opacity-30 disabled:saturate-0 flex items-center gap-2 active:scale-95 transition-all shadow-glow-accent"
              >
                Capture <Zap size={18} />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Voice clarify bar — slides in after capture */}
      <AnimatePresence>
        {clarifyMode && (
          <VoiceClarifyBar
            key="clarify"
            projectNames={projectNames}
            onConfirm={handleClarifyConfirm}
            onSkip={handleClarifySkip}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
