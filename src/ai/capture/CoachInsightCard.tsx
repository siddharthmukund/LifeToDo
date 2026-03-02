'use client';
import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useCoachInsight } from './useCoachInsight';

interface Props {
  daysToNextReview?: number;
  userRole?: string;
  isADHDMode?: boolean;
}

export function CoachInsightCard({ daysToNextReview = 7, userRole, isADHDMode = false }: Props) {
  const { message, loading, isAI } = useCoachInsight(daysToNextReview, userRole);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(isADHDMode);

  if (dismissed || (!loading && !message)) return null;

  return (
    <div className="mx-4 mb-3 rounded-xl border border-border-subtle bg-surface-card overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
        onClick={() => setCollapsed((c) => !c)}
      >
        <Brain className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-xs font-medium text-content-secondary flex-1">
          {isAI ? 'AI Coach' : 'Coach'}{isADHDMode && collapsed ? ' — tap for insight' : ''}
        </span>
        <div className="flex items-center gap-1">
          {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-content-muted" /> : <ChevronUp className="w-3.5 h-3.5 text-content-muted" />}
          <X
            className="w-3.5 h-3.5 text-content-muted hover:text-content-primary"
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          />
        </div>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3">
          {loading ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-primary leading-relaxed">&ldquo;{message}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
