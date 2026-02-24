'use client'
// hooks/useVoiceCapture.ts
// Web Speech API integration with:
// - Live interim transcription
// - Ref-based callback to avoid stale closures
// - Graceful fallback message when API is unavailable
// - Audio level estimation for the VoiceWave visualizer

import { useState, useRef, useCallback, useEffect } from 'react'

export type VoiceCaptureStatus = 'idle' | 'listening' | 'processing' | 'error'

interface UseVoiceCaptureOptions {
  onCapture: (text: string) => void
  onError?: (msg: string) => void
}

interface UseVoiceCaptureResult {
  status: VoiceCaptureStatus
  transcript: string          // live interim text
  isSupported: boolean
  errorMessage: string | null
  startListening: () => void
  stopListening: () => void
  cancelListening: () => void
  audioLevel: number          // 0–1 for waveform visualisation
}

// Browser type extension for webkit prefix
// (SpeechRecognition global type comes from src/types/speech.d.ts)
declare global {
  interface Window {
    SpeechRecognition: new() => SpeechRecognition
    webkitSpeechRecognition: new() => SpeechRecognition
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed':    'Microphone permission denied — tap the lock icon in your browser to allow it.',
  'no-speech':      'No speech detected. Try again in a quieter environment.',
  'network':        'Network error during voice recognition. Check your connection.',
  'audio-capture':  'No microphone found on this device.',
  'aborted':        'Voice capture was cancelled.',
  'service-not-allowed': 'Voice input is blocked on this page. Try HTTPS.',
}

export function useVoiceCapture({
  onCapture,
  onError,
}: UseVoiceCaptureOptions): UseVoiceCaptureResult {
  const [status, setStatus] = useState<VoiceCaptureStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)

  // Refs avoid stale closures in event handlers
  const recognitionRef  = useRef<SpeechRecognition | null>(null)
  const onCaptureRef    = useRef(onCapture)
  const onErrorRef      = useRef(onError)
  const latestTranscript = useRef('')
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef     = useRef<AnalyserNode | null>(null)
  const streamRef       = useRef<MediaStream | null>(null)
  const levelTimerRef   = useRef<number | null>(null)

  // Keep callback refs current without re-creating the hook
  useEffect(() => { onCaptureRef.current = onCapture }, [onCapture])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Build a Web Audio analyser for real-time level metering
  const startLevelMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setAudioLevel(Math.min(avg / 80, 1)) // normalise to 0–1
        levelTimerRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      // Silently ignore — level meter is cosmetic, not critical
    }
  }, [])

  const stopLevelMeter = useCallback(() => {
    if (levelTimerRef.current) cancelAnimationFrame(levelTimerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioContextRef.current?.close()
    audioContextRef.current = null
    analyserRef.current = null
    setAudioLevel(0)
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'Voice input is not supported in this browser. Use text input instead.'
      setErrorMessage(msg)
      setStatus('error')
      onErrorRef.current?.(msg)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous     = false   // stop after user pauses
    recognition.interimResults = true    // stream partial results live
    recognition.lang           = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setStatus('listening')
      setErrorMessage(null)
      setTranscript('')
      latestTranscript.current = ''
      startLevelMeter()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Collect all result segments (interim + final)
      const full = Array.from(event.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('')
      setTranscript(full)
      latestTranscript.current = full
    }

    recognition.onend = () => {
      stopLevelMeter()
      setStatus('idle')
      const captured = latestTranscript.current.trim()
      if (captured) {
        onCaptureRef.current(captured)
        setTranscript('')
        latestTranscript.current = ''
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      stopLevelMeter()
      // 'aborted' fires when we call stop() ourselves — treat as normal
      if (event.error === 'aborted') {
        setStatus('idle')
        return
      }
      const msg = ERROR_MESSAGES[event.error] ?? `Voice error: ${event.error}`
      setErrorMessage(msg)
      setStatus('error')
      onErrorRef.current?.(msg)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, startLevelMeter, stopLevelMeter])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    stopLevelMeter()
    setStatus('idle')
  }, [stopLevelMeter])

  const cancelListening = useCallback(() => {
    latestTranscript.current = '' // discard transcript
    recognitionRef.current?.abort()
    stopLevelMeter()
    setStatus('idle')
    setTranscript('')
  }, [stopLevelMeter])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      stopLevelMeter()
    }
  }, [stopLevelMeter])

  return {
    status,
    transcript,
    isSupported,
    errorMessage,
    audioLevel,
    startListening,
    stopListening,
    cancelListening,
  }
}
