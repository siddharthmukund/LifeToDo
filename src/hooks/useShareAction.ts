'use client'
// hooks/useShareAction.ts
// Hook that shares a GTD action via the Web Share API (or clipboard fallback).
// Pro feature: sharing generates a clean card with delegation metadata.
// Free users get a basic text share (no delegation context).

import { useState, useCallback } from 'react'
import type { Action }           from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ShareMethod = 'web-share' | 'clipboard' | 'unsupported'

interface UseShareActionResult {
  share:        (action: Action, delegateTo?: string) => Promise<boolean>
  lastMethod:   ShareMethod | null
  sharing:      boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildShareText(action: Action, delegateTo?: string): string {
  const lines: string[] = [action.text]
  if (delegateTo)          lines.push(`→ Delegated to: ${delegateTo}`)
  if (action.timeEstimate) lines.push(`⏱ Est. ${action.timeEstimate} min`)
  if (action.energy)       lines.push(`⚡ Energy: ${action.energy}`)
  return lines.join('\n')
}

function buildShareUrl(action: Action): string {
  // Deep link to the app — links to the Today page since action IDs are local-only
  return typeof window !== 'undefined'
    ? `${window.location.origin}/?highlight=${action.id}`
    : '/'
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useShareAction(): UseShareActionResult {
  const [sharing,    setSharing]    = useState(false)
  const [lastMethod, setLastMethod] = useState<ShareMethod | null>(null)

  const share = useCallback(async (action: Action, delegateTo?: string): Promise<boolean> => {
    setSharing(true)
    try {
      const text  = buildShareText(action, delegateTo)
      const url   = buildShareUrl(action)
      const title = action.text

      // Try Web Share API first
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url })
        setLastMethod('web-share')
        return true
      }

      // Fallback: clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setLastMethod('clipboard')
        return true
      }

      setLastMethod('unsupported')
      return false
    } catch (err) {
      // User dismissed the share sheet — not an error
      if (err instanceof Error && err.name === 'AbortError') return false
      return false
    } finally {
      setSharing(false)
    }
  }, [])

  return { share, lastMethod, sharing }
}
