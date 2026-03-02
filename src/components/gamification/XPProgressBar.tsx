'use client';
import { motion } from 'framer-motion';
import { getLevelDefinition } from '@/gamification/levelCalculator';
import { useXP } from '@/gamification/useXP';
import { LEVEL_DEFINITIONS } from '@/gamification/levels';

interface Props {
  /** Compact variant for nav bar — no labels, thinner bar */
  compact?: boolean;
  className?: string;
}

export function XPProgressBar({ compact = false, className = '' }: Props) {
  const { totalXP, currentLevel, isEnabled, showXPBar } = useXP();

  if (!isEnabled || !showXPBar) return null;

  const currentDef = getLevelDefinition(currentLevel);
  const nextDef = LEVEL_DEFINITIONS.find(d => d.level === currentLevel + 1);

  const currentFloor = currentDef.xpRequired;
  const nextCeiling = nextDef?.xpRequired ?? currentDef.xpRequired;
  const span = nextCeiling - currentFloor;
  const earned = totalXP - currentFloor;
  const pct = span > 0 ? Math.min(100, Math.max(0, (earned / span) * 100)) : 100;
  const isMaxLevel = currentLevel >= 30;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs font-bold text-primary tabular-nums">
          {currentDef.icon} {currentLevel}
        </span>
        <div className="flex-1 h-1.5 bg-border-default rounded-full overflow-hidden min-w-[48px]">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-content-primary">
          {currentDef.icon} Level {currentLevel} · {currentDef.title}
        </span>
        {isMaxLevel ? (
          <span className="text-primary font-bold">MAX</span>
        ) : (
          <span className="text-content-muted tabular-nums">
            {earned.toLocaleString()} / {span.toLocaleString()} XP
          </span>
        )}
      </div>
      <div className="h-2.5 bg-border-default rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${isMaxLevel ? 100 : pct}%` }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
      {!isMaxLevel && nextDef && (
        <p className="text-[10px] text-content-muted text-right">
          Next: {nextDef.icon} {nextDef.title}
        </p>
      )}
    </div>
  );
}
