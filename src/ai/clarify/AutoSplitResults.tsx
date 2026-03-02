'use client';
import { Plus, X, Loader2, FolderPlus } from 'lucide-react';
import type { SplitResult, SplitSubtask } from '../schemas/splitResult';

interface Props {
  result: SplitResult | null;
  loading: boolean;
  error: string | null;
  onAddAll: (subtasks: SplitSubtask[], projectName?: string) => void;
  onDismiss: () => void;
}

export function AutoSplitResults({ result, loading, error, onAddAll, onDismiss }: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-content-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Splitting into sub-tasks…
      </div>
    );
  }

  if (error || !result) return null;

  const sorted = [...result.subtasks].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-3 mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-content-muted">🔀 Split into {sorted.length} sub-tasks:</p>
        <button onClick={onDismiss}><X className="w-3.5 h-3.5 text-content-muted" /></button>
      </div>

      <div className="space-y-2">
        {sorted.map((t, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs text-content-muted w-4 mt-0.5 flex-shrink-0">{t.order}.</span>
            <div className="flex-1">
              <p className="text-sm text-content-primary">{t.title}</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {t.context && <span className="text-[10px] text-content-muted">{t.context}</span>}
                {t.energyLevel && <span className="text-[10px] text-content-muted">⚡ {t.energyLevel}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {result.suggestProject && result.projectName && (
        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 rounded-lg px-2 py-1.5">
          <FolderPlus className="w-3.5 h-3.5" />
          Create project &ldquo;{result.projectName}&rdquo;?
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onAddAll(sorted, result.suggestProject ? result.projectName ?? undefined : undefined)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
        >
          <Plus className="w-3 h-3" /> Add all to inbox
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 border border-border-default rounded-lg text-xs text-content-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
