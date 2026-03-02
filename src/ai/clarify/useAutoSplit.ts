'use client';
import { useState, useCallback } from 'react';
import { autoSplitTask } from './AutoSplitter';
import type { SplitResult, SplitSubtask } from '../schemas/splitResult';
import type { AIContext } from '../types';

export function useAutoSplit(context: AIContext) {
  const [result, setResult] = useState<SplitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const split = useCallback(async (taskTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await autoSplitTask(taskTitle, context);
      setResult(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [context]);

  const clear = useCallback(() => { setResult(null); setError(null); }, []);

  return { result, loading, error, split, clear };
}
