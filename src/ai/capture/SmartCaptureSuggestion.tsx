'use client';
import { useState } from 'react';
import { Check, X, Calendar, Folder, Zap, MapPin } from 'lucide-react';
import type { CaptureResult } from '../schemas/captureResult';

// Confidence thresholds
const AUTO_ACCEPT = 0.8;   // Green — auto-filled
const SUGGEST = 0.5;        // Amber — tap to accept
// < 0.5 = not shown

interface Chip {
  field: keyof Pick<CaptureResult, 'dueDate' | 'context' | 'project' | 'energyLevel'>;
  label: string;
  icon: React.ReactNode;
  value: string | null;
  confidence: number;
}

interface Props {
  result: CaptureResult | null;
  loading: boolean;
  isFallback: boolean;
  onAccept: (field: string, value: string | null) => void;
  onDismiss: (field: string) => void;
}

export function SmartCaptureSuggestion({ result, loading, isFallback, onAccept, onDismiss }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-1 py-1 text-content-muted text-xs">
        <span className="animate-pulse">✨ Parsing…</span>
      </div>
    );
  }

  if (!result) return null;

  const rawChips: Chip[] = [
    { field: 'dueDate', label: result.dueDate ? formatDate(result.dueDate) : '', icon: <Calendar className="w-3 h-3" />, value: result.dueDate, confidence: result.confidence.dueDate },
    { field: 'context', label: result.context ?? '', icon: <MapPin className="w-3 h-3" />, value: result.context, confidence: result.confidence.context },
    { field: 'project', label: result.project ?? '', icon: <Folder className="w-3 h-3" />, value: result.project, confidence: result.confidence.project },
    { field: 'energyLevel', label: result.energyLevel ? `${result.energyLevel} ⚡` : '', icon: <Zap className="w-3 h-3" />, value: result.energyLevel, confidence: result.confidence.energyLevel },
  ];

  const chips = rawChips.filter((c) => c.value && c.confidence >= SUGGEST && !dismissed.has(c.field));

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-1 pt-1.5">
      {isFallback && (
        <span className="text-[10px] text-content-muted self-center">📝</span>
      )}
      {chips.map((chip) => {
        const isAutoAccepted = chip.confidence >= AUTO_ACCEPT;
        return (
          <button
            key={chip.field}
            onClick={() => onAccept(chip.field, chip.value)}
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors
              ${isAutoAccepted
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-surface-card border-border-default text-content-secondary hover:border-primary/50'}
            `}
          >
            {chip.icon}
            <span>{chip.label}</span>
            {isAutoAccepted && <Check className="w-2.5 h-2.5" />}
            <X
              className="w-2.5 h-2.5 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setDismissed((prev) => new Set([...prev, chip.field]));
                onDismiss(chip.field);
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  } catch { return iso; }
}
