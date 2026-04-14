'use client'
// CaptureBar — primary GTD capture entry point.
// On Android native: uses @capacitor-community/speech-recognition (real native mic).
// On web: uses Web Speech API (useVoiceCapture).
// After a successful capture, optionally enters clarify mode (voice enrichment).
// iCCW #13: mic area converted to <button>, aria-live status region, keyboard-accessible.

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Keyboard } from 'lucide-react'
import { useVoiceCapture } from '@/hooks/useVoiceCapture'
import { useNativeSpeech } from '@/native/speech/useNativeSpeech'
import { VoiceWave } from './VoiceWave'
import { VoiceClarifyBar } from './VoiceClarifyBar'
import { db } from '@/lib/db'
import { cn } from '@/lib/utils'
import type { VoiceClarifyResult } from '@/types'
import { SmartInputBar } from '../ai/SmartInputBar'
import { useTranslations } from 'next-intl'
import { platform } from '@/native/platform'

interface CaptureBarProps {
  /** Called when capture (+ optional clarify) is complete. */
  onCapture: (text: string, source: 'voice' | 'text', clarify?: VoiceClarifyResult, nlpMetadata?: { dueDate: Date | null, projects: string[], contexts: string[] }) => void
  className?: string
}

export function CaptureBar({ onCapture, className }: CaptureBarProps) {
  const tInbox = useTranslations('inbox.capture')
  const tCommon = useTranslations('common.actions')
  // Start in voice orb mode on all platforms (mic or text toggled by user)
  const [textMode, setTextMode] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [clarifyMode, setClarifyMode] = useState(false)
  const [capturedText, setCapturedText] = useState('')
  const [capturedSource, setCapturedSource] = useState<'voice' | 'text'>('voice')
  const [projectNames, setProjectNames] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  // Wrapper ref used to querySelector the actual <input> inside SmartInputBar
  // and programmatically open the Android software keyboard
  const textContainerRef = useRef<HTMLDivElement>(null)

  // Pre-load active project names for fuzzy matching in VoiceClarifyBar
  const loadProjectNames = useCallback(async () => {
    try {
      const projects = await db.projects.filter((p: any) => p.status === 'active').toArray()
      const names: Record<string, string> = {}
      for (const p of projects) names[p.id] = p.name
      setProjectNames(names)
    } catch {
      // Non-fatal — clarify works without project matching
    }
  }, [])

  const [nlpMeta, setNlpMeta] = useState<{ dueDate: Date | null, projects: string[], contexts: string[] } | undefined>()

  const [captureFlash, setCaptureFlash] = useState(false)

  /** Enter voice-clarify mode after a successful initial capture. */
  function enterClarifyMode(text: string, source: 'voice' | 'text', meta?: { dueDate: Date | null, projects: string[], contexts: string[] }) {
    setCapturedText(text)
    setCapturedSource(source)
    setNlpMeta(meta)
    if (source === 'voice') {
      setClarifyMode(true)
      setTextMode(false)
    } else {
      // Text capture: flash success, keep text mode open for sequential entry
      setCaptureFlash(true)
      setTimeout(() => setCaptureFlash(false), 1200)
    }
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
      onCapture(capturedText, capturedSource, result, nlpMeta)
      exitClarifyMode()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capturedText, capturedSource, nlpMeta, onCapture],
  )

  const handleClarifySkip = useCallback(() => {
    onCapture(capturedText, capturedSource, undefined, nlpMeta)
    exitClarifyMode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedText, capturedSource, nlpMeta, onCapture])

  // ── Voice capture hooks ───────────────────────────────────────────────────
  // Always call both hooks (Rules of Hooks — no conditional calls).
  // Only one is used at runtime based on platform.
  const webVoice = useVoiceCapture({
    onCapture: (text) => enterClarifyMode(text, 'voice'),
  })
  const nativeVoice = useNativeSpeech({
    onCapture: (text) => enterClarifyMode(text, 'voice'),
  })

  // Select the correct implementation
  const {
    status, transcript, isSupported, errorMessage, audioLevel,
    startListening, stopListening, cancelListening,
  } = platform.isAndroid() ? nativeVoice : webVoice

  const isListening = status === 'listening'
  const isProcessing = status === 'processing'

  useEffect(() => {
    if (status === 'idle' && transcript === '') setTextMode(false)
  }, [status, transcript])

  function handleTextSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    enterClarifyMode(trimmed, 'text')
    setTimeout(() => { onCapture(trimmed, 'text') }, 10)
  }

  // Focus the real <input> inside SmartInputBar to open the Android keyboard.
  // querySelector is needed because SmartInputBar manages its own internal ref.
  function focusTextInput() {
    setTimeout(() => {
      const el = textContainerRef.current?.querySelector('input')
      el?.focus()
    }, 100)
  }

  function handleMicClick() {
    if (isListening) { stopListening(); return }
    if (!isSupported) {
      setTextMode(true)
      focusTextInput()
      return
    }
    setTextMode(false)
    startListening()
  }

  function handleTextModeOpen() {
    if (isListening) cancelListening()
    setTextMode(true)
    focusTextInput()
  }

  // Derive descriptive aria-label for the mic button based on current state
  const micAriaLabel = isListening
    ? tInbox('voiceButton.stop')
    : isProcessing
      ? tInbox('voiceButton.processing')
      : isSupported
        ? tInbox('voiceButton.start')
        : tInbox('voiceButton.unavailable')

  // Status text announced to screen readers via the aria-live region
  const statusText = isListening
    ? transcript ? tInbox('voiceStatus.listeningTranscript', { transcript }) : tInbox('voiceStatus.listening')
    : isProcessing
      ? tInbox('voiceStatus.processing')
      : errorMessage ?? ''

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn('w-full flex flex-col items-center justify-center', className)}>

      {/*
        aria-live="polite" status region — announces voice state to screen readers.
        Visually hidden but always present so AT picks up state changes.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusText}
      </div>

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
            {/* Massive Mic Button — semantic <button> for keyboard + AT */}
            <div className="relative select-none">
              {/* Outer decorative ring */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-primary/10"
                animate={isListening ? { scale: [1.1, 1.4, 1.1], opacity: [0.5, 0.1, 0.5] } : { scale: 1.25 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Inner glow when listening */}
              {isListening && (
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Core interactive button — replaces the non-interactive <motion.div> */}
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isProcessing}
                aria-label={micAriaLabel}
                aria-pressed={isListening}
                className={cn(
                  'relative flex size-36 md:size-40 items-center justify-center rounded-full',
                  'transition-all duration-300 cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
                  isListening
                    ? 'bg-primary/20 text-primary-ink border border-primary/50 shadow-[0_0_40px_rgba(43,238,108,0.3)]'
                    : 'bg-surface-card text-content-secondary border border-border-default hover:border-brand shadow-card',
                  isProcessing && 'opacity-60 cursor-not-allowed',
                )}
              >
                {isListening ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                    <VoiceWave status={status} audioLevel={audioLevel} barCount={7} />
                  </div>
                ) : (
                  <Mic size={48} className="opacity-50" strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Transcript & Status (visual only — aria-live region handles AT) */}
            <div
              className="text-center space-y-2 h-20 flex flex-col items-center justify-start"
              aria-hidden="true"
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="listening-status"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-primary-ink font-bold text-xs uppercase tracking-[0.2em] mb-2 animate-pulse">
                      {tInbox('voiceStatus.listening')}
                    </p>
                    {transcript && (
                      <h3 className="text-content-primary text-lg md:text-xl font-bold leading-tight px-8 font-display italic">
                        &ldquo;{transcript}&rdquo;
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
                    <p className="text-primary-ink text-xs uppercase tracking-widest font-bold">{tInbox('voiceStatus.processing')}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle-status"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <p className="text-content-secondary text-sm font-medium mb-2">{tInbox('voiceButton.start')}</p>
                    <button
                      autoFocus
                      type="button"
                      onClick={handleTextModeOpen}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-ink/70 hover:text-primary-ink transition-colors px-4 py-2 min-h-[44px]"
                    >
                      <Keyboard size={14} />
                      Type instead
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error — role="alert" triggers immediate assertive announcement */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  role="alert"
                  className="px-4 py-2 bg-status-error/10 border border-status-danger rounded-xl text-xs text-status-error text-center mt-2 max-w-[80%]"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Text Input Mode */
          <motion.div
            key="text-input"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="w-full flex flex-col gap-3 my-6"
          >
            {/* Success flash */}
            <AnimatePresence>
              {captureFlash && (
                <motion.div
                  key="flash"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold"
                >
                  <span>✓</span> Task captured!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wrapper ref lets us querySelector the real <input> for Android focus */}
            <div ref={textContainerRef}>
              <SmartInputBar
                placeholder={tInbox('placeholder')}
                autoFocus={!platform.isNative()} // autoFocus unreliable on Android; we use focusTextInput()
                onCapture={async (cleanText, meta) => {
                  enterClarifyMode(cleanText, 'text', meta);
                  onCapture(cleanText, 'text', undefined, meta);
                }}
              />
            </div>

            {/* Only show mic-switch button when voice is actually available */}
            {isSupported && (
              <div className="flex justify-between items-center px-2">
                <button
                  type="button"
                  onClick={() => { setTextMode(false); setInputValue('') }}
                  aria-label="Switch to voice input"
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-content-secondary hover:text-content-primary px-2 py-2 min-h-[44px]"
                >
                  <Mic size={14} />
                  Voice
                </button>
              </div>
            )}
          </motion.div>
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
