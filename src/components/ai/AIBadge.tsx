// AIBadge — inline tag indicating AI-generated content with optional confidence level.
// iCCW #13: confidence is now conveyed via icon + sr-only text, not color alone (WCAG 1.4.1).

import { Sparkles, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';

interface Props {
  className?: string;
  size?: 'xs' | 'sm';
  /** 0–1 confidence score. When omitted, renders a generic AI badge. */
  confidence?: number;
}

/**
 * Maps a confidence score to a visual + accessible representation.
 * Each level has a distinct icon AND distinct color so confidence is never
 * conveyed by color alone (satisfies WCAG 1.4.1 Use of Color).
 */
function resolveConfidence(confidence: number | undefined): {
  colorClass: string;
  icon: React.ElementType;
  label: string;
} {
  if (confidence === undefined) {
    return {
      colorClass: 'bg-primary/10 border-primary/20 text-primary-ink',
      icon: Sparkles,
      label: 'AI',
    };
  }
  if (confidence >= 0.8) {
    return {
      colorClass: 'bg-status-ok/10 border-status-ok/20 text-status-ok',
      icon: CheckCircle2,
      label: 'High confidence',
    };
  }
  if (confidence >= 0.5) {
    return {
      colorClass: 'bg-status-warn/10 border-status-warn/20 text-status-warning',
      icon: AlertCircle,
      label: 'Medium confidence',
    };
  }
  return {
    colorClass: 'bg-overlay-hover border-border-default text-content-muted',
    icon: MinusCircle,
    label: 'Low confidence',
  };
}

export function AIBadge({ className = '', size = 'xs', confidence }: Props) {
  const { colorClass, icon: Icon, label } = resolveConfidence(confidence);
  const iconSize = size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const textSize = size === 'xs' ? 'text-[9px]' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border font-medium ${colorClass} ${textSize} ${className}`}
      aria-label={confidence !== undefined ? `AI — ${label}` : 'AI generated'}
    >
      {/* Icon conveys confidence level beyond color alone (WCAG 1.4.1) */}
      <Icon className={iconSize} aria-hidden="true" />

      {/* Visible abbreviation */}
      <span aria-hidden="true">AI</span>

      {/* Screen-reader-only full label */}
      <span className="sr-only">{label}</span>
    </span>
  );
}
