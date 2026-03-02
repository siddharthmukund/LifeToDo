'use client';
import { Lock } from 'lucide-react';
import type { AchievementDefinition } from '@/types/gamification';

interface Props {
  achievement: AchievementDefinition & { isUnlocked: boolean; unlockedAt?: string };
}

const TIER_STYLES: Record<string, { ring: string; bg: string; label: string }> = {
  bronze: {
    ring: 'ring-amber-400/60',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    label: 'text-amber-600 dark:text-amber-400',
  },
  silver: {
    ring: 'ring-slate-400/60',
    bg: 'bg-slate-50 dark:bg-slate-800/30',
    label: 'text-slate-500 dark:text-slate-400',
  },
  gold: {
    ring: 'ring-yellow-400/60',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: 'text-yellow-600 dark:text-yellow-400',
  },
  platinum: {
    ring: 'ring-violet-400/60',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    label: 'text-violet-600 dark:text-violet-400',
  },
};

export function AchievementCard({ achievement }: Props) {
  const { isUnlocked, unlockedAt, hidden, icon, name, description, tier } = achievement;
  const style = TIER_STYLES[tier] ?? TIER_STYLES.bronze;
  const isHidden = hidden && !isUnlocked;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
        isUnlocked
          ? `${style.bg} border-transparent ring-2 ${style.ring}`
          : 'bg-surface-card border-border-subtle opacity-50'
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
        isUnlocked ? style.bg : 'bg-border-default'
      }`}>
        {isHidden ? (
          <Lock size={16} className="text-content-muted" />
        ) : (
          <span>{icon}</span>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold truncate ${isUnlocked ? 'text-content-primary' : 'text-content-muted'}`}>
          {isHidden ? '???' : name}
        </p>
        <p className="text-xs text-content-muted line-clamp-1">
          {isHidden ? 'Hidden achievement' : description}
        </p>
        {isUnlocked && unlockedAt && (
          <p className={`text-[10px] font-bold mt-0.5 ${style.label}`}>
            {tier.toUpperCase()} · {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
