'use client';
import { useState, useEffect, useCallback } from 'react';
import { hasAIConsent, getProviderDisplayName } from './aiConsent';
import { AI_CONFIG } from './aiConfig';
import type { AIError, AIResponse } from './types';

export interface AIAvailability {
  isAvailable: boolean;
  hasConsent: boolean;
  isOnline: boolean;
  providerName: string;
  isLoading: boolean;
  callAI: (systemPrompt: string, userMessage: string, schema?: any, context?: any) => Promise<AIResponse>;
}

export function useAI(feature?: import('./types').AIFeature): AIAvailability {
  const [consent, setConsent] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    hasAIConsent().then((g) => { setConsent(g); setIsLoading(false); });
    setIsOnline(navigator.onLine);
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  const callAI = useCallback(async (systemPrompt: string, userMessage: string, schema?: any, context?: any) => {
    if (!consent) throw new Error('AI features are disabled or consent not granted.');
    const { callAIProxy } = await import('./aiProxy');
    return callAIProxy({ feature: feature as import('./types').AIFeature, systemPrompt, userMessage, schema, context });
  }, [consent, feature]);

  return {
    isAvailable: consent && isOnline,
    hasConsent: consent,
    isOnline,
    providerName: getProviderDisplayName(AI_CONFIG.provider),
    isLoading,
    callAI,
  };
}

export function useAICall<T>(fn: (...args: unknown[]) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AIError | null>(null);

  const call = useCallback(async (...args: unknown[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      setData(result);
      return result;
    } catch (e) {
      setError(e as AIError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  const reset = useCallback(() => { setData(null); setError(null); setLoading(false); }, []);
  return { data, loading, error, call, reset };
}
