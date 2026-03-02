'use client';
import { Target, RefreshCw, Loader2 } from 'lucide-react';
import { usePriorityPicker } from './usePriorityPicker';
import type { PickerTask } from './PriorityPicker';

interface Props {
  tasks: PickerTask[];
  currentEnergy: string;
  onStartTask: (taskIndex: number) => void;
  isADHDMode?: boolean;
}

export function PriorityPickerCard({ tasks, currentEnergy, onStartTask, isADHDMode = false }: Props) {
  const { result, loading, error, pick, repick, canRepick } = usePriorityPicker(tasks, currentEnergy);

  if (!result && !loading) {
    return (
      <button
        onClick={pick}
        className="flex items-center gap-2 px-4 py-2.5 border border-border-default rounded-xl text-sm text-content-secondary hover:border-primary/40 hover:text-primary transition-colors"
      >
        <Target className="w-4 h-4" />
        AI Pick for me
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Do this one</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-content-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          Finding your best next move…
        </div>
      )}

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {result && !loading && (
        <>
          <p className="text-base font-semibold text-content-primary">&ldquo;{result.taskTitle}&rdquo;</p>
          {!isADHDMode && (
            <p className="text-sm text-content-secondary italic">{result.reason}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onStartTask(result.pickedTaskIndex)}
              className="flex-1 py-2 bg-primary text-white rounded-xl font-semibold text-sm"
            >
              Start This Task
            </button>
            {canRepick && (
              <button
                onClick={repick}
                className="px-3 py-2 border border-border-default rounded-xl text-sm text-content-secondary hover:border-primary/40"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
