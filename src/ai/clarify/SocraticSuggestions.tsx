'use client';
import { Plus, SkipForward, Loader2 } from 'lucide-react';
import type { ClarifySuggestion } from '../schemas/clarifyResult';

interface Props {
  suggestions: ClarifySuggestion[];
  loading: boolean;
  error: string | null;
  onAdd: (suggestion: ClarifySuggestion) => void;
  onSkip: (index: number) => void;
}

export function SocraticSuggestions({ suggestions, loading, error, onAdd, onSkip }: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-content-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Finding concrete next actions…
      </div>
    );
  }

  if (error) return null;
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium text-content-muted px-1">🤖 Suggested next actions:</p>
      {suggestions.map((s, i) => (
        <div key={i} className="rounded-xl border border-border-subtle bg-surface-card p-3 space-y-2">
          <p className="text-sm font-medium text-content-primary">{s.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {s.context && (
              <span className="text-[10px] bg-surface-base border border-border-subtle rounded-full px-1.5 py-0.5 text-content-muted">
                {s.context}
              </span>
            )}
            {s.energyLevel && (
              <span className="text-[10px] bg-surface-base border border-border-subtle rounded-full px-1.5 py-0.5 text-content-muted">
                ⚡ {s.energyLevel}
              </span>
            )}
          </div>
          <p className="text-xs text-content-muted italic">{s.reasoning}</p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onAdd(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
            >
              <Plus className="w-3 h-3" /> Add to inbox
            </button>
            <button
              onClick={() => onSkip(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default rounded-lg text-xs text-content-secondary"
            >
              <SkipForward className="w-3 h-3" /> Skip
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
