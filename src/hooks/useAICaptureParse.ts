'use client'
// hooks/useAICaptureParse.ts
// Hook that parses a capture string into GTD metadata.
// Free tier → local keyword parser (captureParser.ts)
// Pro tier  → AICapturePlugin (local keyword parser + future LLM upgrade path)
//
// The returned parse result drives the Clarify flow's auto-fill behaviour.
// If confidence >= AUTO_FILL_CONFIDENCE, the UI can auto-populate fields.

import { useState, useCallback } from 'react'
import { useGTDStore }           from '@/store/gtdStore'
import { parseCapture }          from '@/lib/captureParser'
import { AUTO_FILL_CONFIDENCE }  from '@/lib/aiPromptTemplates'
import { usePlugin }             from '@/plugins/usePlugin'
import type { AICapturePluginInterface } from '@/plugins/types'
import type { ParsedCapture }    from '@/lib/captureParser'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseAICaptureParse {
  /** Parse a raw capture string — async to support future network calls */
  parse:       (text: string) => Promise<ParsedCapture>
  /** Most recent parse result */
  result:      ParsedCapture | null
  /** true while parsing (instant for local, async for Pro LLM) */
  parsing:     boolean
  /** Whether confidence exceeds the auto-fill threshold */
  canAutoFill: boolean
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAICaptureParse(): UseAICaptureParse {
  const tier    = useGTDStore(s => s.settings?.tier ?? 'free')
  const { plugin: aiPlugin, isReady: aiReady } =
    usePlugin<AICapturePluginInterface>('ai-capture')

  const [result,  setResult]  = useState<ParsedCapture | null>(null)
  const [parsing, setParsing] = useState(false)

  const parse = useCallback(async (text: string): Promise<ParsedCapture> => {
    if (!text.trim()) {
      const empty: ParsedCapture = { raw: text, confidence: 0 }
      setResult(empty)
      return empty
    }

    setParsing(true)
    try {
      let parsed: ParsedCapture

      if (tier === 'pro' && aiReady) {
        // Pro: use AI plugin (local keyword + future LLM upgrade)
        const aiResult = await aiPlugin.parse(text)
        parsed = {
          raw:           text,
          destination:   aiResult.destination  as ParsedCapture['destination'],
          energy:        aiResult.energy        as ParsedCapture['energy'],
          timeEstimate:  aiResult.timeEstimate  as ParsedCapture['timeEstimate'],
          projectName:   aiResult.projectName,
          confidence:    aiResult.confidence,
        }
      } else {
        // Free: local keyword parser
        parsed = parseCapture(text)
      }

      setResult(parsed)
      return parsed
    } finally {
      setParsing(false)
    }
  }, [tier, aiReady, aiPlugin])

  return {
    parse,
    result,
    parsing,
    canAutoFill: (result?.confidence ?? 0) >= AUTO_FILL_CONFIDENCE,
  }
}
