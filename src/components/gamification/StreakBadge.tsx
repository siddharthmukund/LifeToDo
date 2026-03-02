'use client';
import { Flame } from 'lucide-react';
import { useStreak } from '@/gamification/useStreak';
import { useGamificationStore } from '@/gamification/gamificationStore';

interface Props {
  /** Show multiplier pill beside streak count */
  showMultiplier?: boolean;
  className?: string;
}

const STREAK_COLORS: Record<number, string> = {
  0: 'text-content-muted',
  1: 'text-orange-400',
  4: 'text-orange-500',
  7: 'text-amber-500',
  14: 'text-yellow-500',
  28: 'text-red-500',
};

function getStreakColor(days: number): string {
  let color = STREAK_COLORS[0];
  for (const [threshold, cls] of Object.entries(STREAK_COLORS)) {
    if (days >= Number(threshold)) color = cls;
  }
  return color;
}

export function StreakBadge({ showMultiplier = false, className = '' }: Props) {
  const { currentStreak } = useStreak();
  const enabled = useGamificationStore(s => s.preferences.enabled);
  if (!enabled) return null;

  const { days, multiplier } = currentStreak;
  const color = getStreakColor(days);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Flame
        size={16}
        className={`${color} ${days >= 3 ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}
        fill={days >= 1 ? 'currentColor' : 'none'}
      />
      <span className={`text-sm font-bold tabular-nums ${days >= 1 ? color : 'text-content-muted'}`}>
        {days}
      </span>
      {showMultiplier && multiplier > 1.0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          {multiplier.toFixed(1)}×
        </span>
      )}
    </div>
  );
}
