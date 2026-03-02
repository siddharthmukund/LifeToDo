'use client';
import { useState, useCallback } from 'react';
import { draftContent } from './ContentDrafter';
import type { DraftResult } from '../schemas/draftResult';
import { useAI } from '../useAI';

export function useContentDrafter(userRole = 'professional') {
  const { isAvailable } = useAI();
  const [result, setResult] = useState<DraftResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const draft = useCallback(async (taskTitle: string) => {
    if (!isAvailable) return;
    setLoading(true);
    setError(null);
    try {
      const r = await draftContent(taskTitle, userRole);
      setResult(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [isAvailable, userRole]);

  const copy = useCallback(async () => {
    if (!result?.draft) return;
    await navigator.clipboard.writeText(result.draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const clear = useCallback(() => { setResult(null); setError(null); setCopied(false); }, []);

  return { result, loading, error, copied, draft, copy, clear };
}
