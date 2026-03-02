'use client';
import { useState, useCallback } from 'react';
import { generateWeeklyReport } from './WeeklyReportGenerator';
import type { WeeklyReportData } from './WeeklyReportGenerator';
import { useAI } from '../useAI';

export function useWeeklyReport() {
  const { isAvailable } = useAI();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (data: WeeklyReportData) => {
    if (!isAvailable) return;
    setLoading(true);
    setError(null);
    try {
      const r = await generateWeeklyReport(data);
      setReport(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [isAvailable]);

  const clear = useCallback(() => { setReport(null); setError(null); }, []);
  return { report, loading, error, generate, clear };
}
