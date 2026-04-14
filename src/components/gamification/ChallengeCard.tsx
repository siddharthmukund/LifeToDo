'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';
import type { ActiveChallenge } from '@/types/gamification';
import type { ChallengeDefinition } from '@/types/gamification';

interface Props {
  challenge: ActiveChallenge & { def?: ChallengeDefinition };
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   'bg-status-ok/15 text-status-ok',
  medium: 'bg-status-warn/15 text-status-warning',
  hard:   'bg-status-error/15 text-status-error',
};

function timeUntilExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function ChallengeCard({ challenge }: Props) {
  const { def, progress, current, target, status } = challenge;
  if (!def) return null;

  const isCompleted = status === 'completed';
  const pct = Math.min(100, progress * 100);

  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 transition-all ${
        isCompleted
          ? 'bg-status-ok/5 border-status-ok/30'
          : 'bg-surface-card border-border-subtle'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{def.icon}</span>
          <div>
            <p className={`text-sm font-bold ${isCompleted ? 'text-status-ok' : 'text-content-primary'}`}>
              {def.name}
            </p>
            <p className="text-xs text-content-muted">{def.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isCompleted ? (
            <CheckCircle2 size={18} className="text-status-ok" />
          ) : (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[def.difficulty] ?? ''}`}>
              {def.difficulty}
            </span>
          )}
          <span className="text-xs font-bold text-primary">+{def.xpReward} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      {!isCompleted && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-content-muted">
            <span>{current} / {target}</span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {timeUntilExpiry(challenge.expiresAt)}
            </span>
          </div>
          <div className="h-2 bg-border-default rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
