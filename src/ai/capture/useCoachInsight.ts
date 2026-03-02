'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAI } from '../useAI';
import { getLLMCoachInsight } from './CoachInsightLLM';
import { CoachBrain } from '../CoachBrain';
import { db } from '@/lib/db';

interface CoachInsightState {
  message: string | null;
  loading: boolean;
  isAI: boolean;
}

export function useCoachInsight(daysToNextReview = 7, userRole?: string) {
  const { isAvailable } = useAI();
  const [state, setState] = useState<CoachInsightState>({ message: null, loading: false, isAI: false });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const inboxItems = await db.inbox_items.filter((i: { status: string }) => i.status === 'raw').toArray();
      const now = new Date();
      const staleCount = inboxItems.filter((i: { capturedAt: Date | string }) => {
        const d = new Date(i.capturedAt);
        return (now.getTime() - d.getTime()) > 3 * 24 * 60 * 60 * 1000;
      }).length;

      // Health score estimate (rough)
      const healthScore = Math.max(0, 100 - inboxItems.length * 3);

      if (isAvailable) {
        const msg = await getLLMCoachInsight(inboxItems.length, staleCount, healthScore, daysToNextReview, userRole);
        setState({ message: msg, loading: false, isAI: true });
      } else {
        // Fallback to local heuristic insights
        const insights = await CoachBrain.generateInsights();
        const msg = insights[0]?.description ?? null;
        setState({ message: msg, loading: false, isAI: false });
      }
    } catch {
      setState({ message: null, loading: false, isAI: false });
    }
  }, [isAvailable, daysToNextReview, userRole]);

  useEffect(() => { void load(); }, [load]);

  return { ...state, refresh: load };
}
