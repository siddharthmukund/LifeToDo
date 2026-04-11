'use client'
/**
 * useNativeSpeech — wraps @capacitor-community/speech-recognition for Android.
 *
 * Provides the same interface contract as useVoiceCapture so CaptureBar
 * can swap them in without any UI changes.
 *
 * Flow:
 *  1. requestPermissions() on first use — shows Android system dialog.
 *  2. start() with partialResults:true — streams interim text via 'partialResults' event.
 *  3. stop() — fires onCapture with the final accumulated transcript.
 *  4. Any permission denial or device unavailability sets isSupported=false.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import type { PluginListenerHandle } from '@capacitor/core'

export type VoiceCaptureStatus = 'idle' | 'listening' | 'processing' | 'error'

interface UseNativeSpeechOptions {
  onCapture: (text: string) => void
  onError?: (msg: string) => void
}

interface UseNativeSpeechResult {
  status: VoiceCaptureStatus
  transcript: string
  isSupported: boolean
  errorMessage: string | null
  audioLevel: number       // always 0 — native plugin has no level meter
  startListening: () => void
  stopListening: () => void
  cancelListening: () => void
}

export function useNativeSpeech({
  onCapture,
  onError,
}: UseNativeSpeechOptions): UseNativeSpeechResult {
  const [status, setStatus] = useState<VoiceCaptureStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)  // optimistic until checked
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onCaptureRef = useRef(onCapture)
  const onErrorRef   = useRef(onError)
  const latestTranscript = useRef('')
  const partialHandle = useRef<PluginListenerHandle | null>(null)
  const stateHandle   = useRef<PluginListenerHandle | null>(null)
  const cancelled     = useRef(false)

  useEffect(() => { onCaptureRef.current = onCapture }, [onCapture])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      partialHandle.current?.remove()
      stateHandle.current?.remove()
      import('@capacitor-community/speech-recognition').then(({ SpeechRecognition }) => {
        SpeechRecognition.stop().catch(() => {})
      })
    }
  }, [])

  const setError = useCallback((msg: string) => {
    setErrorMessage(msg)
    setStatus('error')
    onErrorRef.current?.(msg)
  }, [])

  const startListening = useCallback(async () => {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')

      // 1. Check hardware availability
      const { available } = await SpeechRecognition.available()
      if (!available) {
        setIsSupported(false)
        setError('Speech recognition is not available on this device.')
        return
      }

      // 2. Request / check permissions
      const perm = await SpeechRecognition.requestPermissions()
      if (perm.speechRecognition !== 'granted') {
        setError('Microphone permission denied. Please allow it in Android Settings → Apps → Life To Do → Permissions.')
        return
      }

      // 3. Reset state
      cancelled.current = false
      latestTranscript.current = ''
      setTranscript('')
      setErrorMessage(null)
      setStatus('listening')

      // 4. Subscribe to partial results (streaming interim transcript)
      partialHandle.current?.remove()
      partialHandle.current = await SpeechRecognition.addListener('partialResults', (data) => {
        const text = data.matches?.[0] ?? ''
        latestTranscript.current = text
        setTranscript(text)
      })

      // 5. Subscribe to listening state changes
      stateHandle.current?.remove()
      stateHandle.current = await SpeechRecognition.addListener('listeningState', (data) => {
        if (data.status === 'stopped') {
          setStatus('idle')
          const captured = latestTranscript.current.trim()
          if (captured && !cancelled.current) {
            onCaptureRef.current(captured)
            setTranscript('')
            latestTranscript.current = ''
          }
        }
      })

      // 6. Start recognition — popup:false keeps it in-app, partialResults streams live
      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 1,
        partialResults: true,
        popup: false,
      })

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // "No speech input" is not a real error — just silence
      if (msg.includes('No speech input') || msg.includes('no speech')) {
        setStatus('idle')
        return
      }
      setError(`Voice error: ${msg}`)
    }
  }, [setError])

  const stopListening = useCallback(async () => {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
      await SpeechRecognition.stop()
    } catch {
      // ignore
    }
    setStatus('idle')
  }, [])

  const cancelListening = useCallback(async () => {
    cancelled.current = true
    latestTranscript.current = ''
    setTranscript('')
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')
      await SpeechRecognition.stop()
    } catch {
      // ignore
    }
    setStatus('idle')
  }, [])

  // Wrap async callbacks for the sync interface expected by CaptureBar
  const startSync  = useCallback(() => { void startListening() },  [startListening])
  const stopSync   = useCallback(() => { void stopListening() },   [stopListening])
  const cancelSync = useCallback(() => { void cancelListening() }, [cancelListening])

  return {
    status,
    transcript,
    isSupported,
    errorMessage,
    audioLevel: 0,
    startListening: startSync,
    stopListening:  stopSync,
    cancelListening: cancelSync,
  }
}
