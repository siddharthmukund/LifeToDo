'use client';
import { useState, useCallback } from 'react';
import { getSocraticSuggestions } from './SocraticClarifier';
import type { ClarifySuggestion } from '../schemas/clarifyResult';
import type { AIContext } from '../types';

export function useSocraticClarify(context: AIContext, isADHDMode = false) {
  const [suggestions, setSuggestions] = useState<ClarifySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_SUGGESTIONS = isADHDMode ? 2 : 3;

  const clarify = useCallback(async (taskTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSocraticSuggestions(taskTitle, context);
      setSuggestions(result.suggestions.slice(0, MAX_SUGGESTIONS));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [context, MAX_SUGGESTIONS]);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, error, clarify, clear };
}
