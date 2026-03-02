'use client';
import { useState, useCallback, useRef } from 'react';
import { useAI } from '../useAI';
import { parseCaptureSmart } from './SmartCaptureParser';
import { parseCaptureFree } from './FreeCaptureParser';
import type { CaptureResult } from '../schemas/captureResult';
import type { AIContext } from '../types';
import type { AIError } from '../types';

const DEBOUNCE_MS = 500;
const MIN_LENGTH = 5;

export interface SmartCaptureState {
  result: CaptureResult | null;
  loading: boolean;
  error: AIError | null;
  isFallback: boolean; // true = using free-tier regex
}

export function useSmartCapture(context: AIContext) {
  const { isAvailable } = useAI();
  const [state, setState] = useState<SmartCaptureState>({
    result: null, loading: false, error: null, isFallback: false,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastText = useRef('');

  const parse = useCallback((text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < MIN_LENGTH) {
      setState({ result: null, loading: false, error: null, isFallback: false });
      return;
    }
    lastText.current = text;

    debounceRef.current = setTimeout(async () => {
      if (text !== lastText.current) return;

      if (!isAvailable) {
        // Free-tier fallback
        const result = parseCaptureFree(text, context.existingContexts ?? []);
        setState({
          result: { ...result, confidence: { dueDate: 0.9, context: 0.9, project: 0.9, energyLevel: 0 } },
          loading: false, error: null, isFallback: true,
        });
        return;
      }

      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await parseCaptureSmart(text, context);
        setState({ result, loading: false, error: null, isFallback: false });
      } catch (e) {
        // Fallback to regex on error
        const fallback = parseCaptureFree(text, context.existingContexts ?? []);
        setState({
          result: { ...fallback, confidence: { dueDate: 0.7, context: 0.7, project: 0.7, energyLevel: 0 } },
          loading: false, error: e as AIError, isFallback: true,
        });
      }
    }, DEBOUNCE_MS);
  }, [isAvailable, context]);

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setState({ result: null, loading: false, error: null, isFallback: false });
  }, []);

  return { ...state, parse, clear };
}
