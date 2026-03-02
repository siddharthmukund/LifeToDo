'use client';
import { useState, useCallback } from 'react';
import { processBrainDump } from './BrainDumpProcessor';
import type { BrainDumpTask, BrainDumpResult } from '../schemas/brainDumpResult';
import type { AIContext } from '../types';

export interface BrainDumpState {
  phase: 'idle' | 'processing' | 'results' | 'error';
  tasks: BrainDumpTask[];
  selectedIndices: Set<number>;
  error: string | null;
}

export function useBrainDump(context: AIContext) {
  const [state, setState] = useState<BrainDumpState>({
    phase: 'idle', tasks: [], selectedIndices: new Set(), error: null,
  });

  const process = useCallback(async (text: string) => {
    setState({ phase: 'processing', tasks: [], selectedIndices: new Set(), error: null });
    try {
      const result: BrainDumpResult = await processBrainDump(text, context);
      setState({
        phase: 'results',
        tasks: result.tasks,
        selectedIndices: new Set(result.tasks.map((_, i) => i)),
        error: null,
      });
    } catch (e) {
      setState({ phase: 'error', tasks: [], selectedIndices: new Set(), error: String(e) });
    }
  }, [context]);

  const toggleTask = useCallback((index: number) => {
    setState((s) => {
      const next = new Set(s.selectedIndices);
      if (next.has(index)) next.delete(index); else next.add(index);
      return { ...s, selectedIndices: next };
    });
  }, []);

  const selectAll = useCallback(() => {
    setState((s) => ({ ...s, selectedIndices: new Set(s.tasks.map((_, i) => i)) }));
  }, []);

  const deselectAll = useCallback(() => {
    setState((s) => ({ ...s, selectedIndices: new Set() }));
  }, []);

  const reset = useCallback(() => {
    setState({ phase: 'idle', tasks: [], selectedIndices: new Set(), error: null });
  }, []);

  const selectedTasks = state.tasks.filter((_, i) => state.selectedIndices.has(i));

  return { ...state, selectedTasks, process, toggleTask, selectAll, deselectAll, reset };
}
