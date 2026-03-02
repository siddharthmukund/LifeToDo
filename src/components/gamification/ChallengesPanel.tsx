'use client';
import { Loader2, Zap } from 'lucide-react';
import { useChallenges } from '@/gamification/useChallenges';
import { ChallengeCard } from './ChallengeCard';
import { useGamificationStore } from '@/gamification/gamificationStore';

interface Props {
  className?: string;
}

export function ChallengesPanel({ className = '' }: Props) {
  const { challenges, loading } = useChallenges();
  const enabled = useGamificationStore(s => s.preferences.enabled);
  const showChallenges = useGamificationStore(s => s.preferences.showChallenges);

  if (!enabled || !showChallenges) return null;

  return (
    <section className={`space-y-3 ${className}`}>
      <header className="flex items-center gap-2">
        <Zap size={15} className="text-primary" />
        <h2 className="text-sm font-bold text-content-primary">Daily Challenges</h2>
        {challenges.length > 0 && (
          <span className="ml-auto text-[11px] text-content-muted">
            {challenges.filter(c => c.status === 'completed').length}/{challenges.length} done
          </span>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-content-muted text-sm">
          <Loader2 size={14} className="animate-spin" />
          Loading challenges…
        </div>
      ) : challenges.length === 0 ? (
        <p className="text-sm text-content-muted py-3">
          No active challenges — check back tomorrow!
        </p>
      ) : (
        <div className="space-y-2">
          {challenges.map(c => (
            <ChallengeCard key={c.challengeId} challenge={c} />
          ))}
        </div>
      )}
    </section>
  );
}
