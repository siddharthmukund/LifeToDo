'use client';
import { getLevelDefinition } from '@/gamification/levelCalculator';
import { useXP } from '@/gamification/useXP';

interface Props {
  /** Override level (for display elsewhere); defaults to current user level */
  level?: number;
  /** 'compact' = icon + number only; 'full' = icon + number + title */
  variant?: 'compact' | 'full';
  className?: string;
}

export function LevelBadge({ level, variant = 'compact', className = '' }: Props) {
  const { currentLevel, isEnabled } = useXP();
  if (!isEnabled) return null;

  const displayLevel = level ?? currentLevel;
  const def = getLevelDefinition(displayLevel);

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span
          className="flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 text-lg"
          aria-label={`Level ${displayLevel}`}
        >
          {def.icon}
        </span>
        <div>
          <p className="text-xs font-bold text-primary leading-none">Level {displayLevel}</p>
          <p className="text-[11px] text-content-secondary leading-tight mt-0.5">{def.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 ${className}`}
      aria-label={`Level ${displayLevel} — ${def.title}`}
    >
      <span className="text-sm">{def.icon}</span>
      <span className="text-xs font-bold text-primary tabular-nums">{displayLevel}</span>
    </div>
  );
}
