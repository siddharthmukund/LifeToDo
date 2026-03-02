'use client';
import { useState, useCallback } from 'react';
import { pickPriorityTask } from './PriorityPicker';
import type { PriorityResult } from '../schemas/priorityResult';
import type { PickerTask } from './PriorityPicker';
import { useAI } from '../useAI';

const MAX_REPICKS = 3;

export function usePriorityPicker(tasks: PickerTask[], currentEnergy: string) {
  const { isAvailable } = useAI();
  const [result, setResult] = useState<PriorityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excludeIndices, setExcludeIndices] = useState<number[]>([]);
  const [pickCount, setPickCount] = useState(0);

  const pick = useCallback(async () => {
    if (!isAvailable || loading || tasks.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const r = await pickPriorityTask(tasks, currentEnergy, excludeIndices);
      setResult(r);
      setPickCount((c) => c + 1);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [isAvailable, loading, tasks, currentEnergy, excludeIndices]);

  const repick = useCallback(async () => {
    if (!result || pickCount >= MAX_REPICKS) return;
    setExcludeIndices((prev) => [...prev, result.pickedTaskIndex]);
    setLoading(true);
    setError(null);
    try {
      const r = await pickPriorityTask(tasks, currentEnergy, [...excludeIndices, result.pickedTaskIndex]);
      setResult(r);
      setPickCount((c) => c + 1);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [result, pickCount, tasks, currentEnergy, excludeIndices]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setExcludeIndices([]);
    setPickCount(0);
  }, []);

  const canRepick = pickCount < MAX_REPICKS && (tasks.length - excludeIndices.length) > 1;

  return { result, loading, error, pick, repick, reset, canRepick, pickCount };
}
