'use client';
import { useState, useCallback } from 'react';
import { autoCategorize } from './AutoCategorizer';
import type { CategorizeResult } from '../schemas/categorizeResult';
import type { AIContext } from '../types';

export function useAutoCategorize(context: AIContext) {
  const [result, setResult] = useState<CategorizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categorize = useCallback(async (taskTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await autoCategorize(taskTitle, context);
      setResult(r);
      return r;
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, [context]);

  const clear = useCallback(() => { setResult(null); setError(null); }, []);

  return { result, loading, error, categorize, clear };
}
