'use client';
import { useState } from 'react';
import { Medal, Globe, UserCheck, Loader2 } from 'lucide-react';
import { useLeaderboard } from '@/gamification/useLeaderboard';
import { useGTDStore } from '@/store/gtdStore';
import type { LeaderboardEntry } from '@/types/gamification';

interface Props {
  className?: string;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Medal size={16} className="text-status-warning" />;
  if (rank === 2) return <Medal size={16} className="text-content-muted" />;
  if (rank === 3) return <Medal size={16} className="text-status-warning/70" />;
  return <span className="text-xs font-bold text-content-muted tabular-nums w-4 text-center">{rank}</span>;
}

function EntryRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
      isCurrentUser ? 'bg-primary/8 border border-primary/20' : 'hover:bg-border-default/40'
    }`}>
      <div className="w-5 flex items-center justify-center shrink-0">
        <RankBadge rank={entry.rank} />
      </div>
      {entry.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.avatarUrl} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">
            {entry.displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-primary' : 'text-content-primary'}`}>
          {entry.displayName} {isCurrentUser && '(you)'}
        </p>
        <p className="text-[10px] text-content-muted">
          Lvl {entry.level} · {entry.currentStreak}🔥 · Score {entry.gtdHealthScore}
        </p>
      </div>
      <span className="text-xs font-bold text-content-secondary tabular-nums shrink-0">
        {entry.weeklyXP} XP
      </span>
    </div>
  );
}

export function LeaderboardTable({ className = '' }: Props) {
  const uid = useGTDStore(s => s.settings?.firebaseUid ?? s.settings?.userId);
  const displayName = 'Me'; // placeholder — real impl reads from profile
  const { entries, loading, isOptedIn, join, leave } = useLeaderboard(uid);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try { await join(displayName, null, 80); } finally { setJoining(false); }
  };

  return (
    <section className={`space-y-4 ${className}`}>
      <header className="flex items-center gap-2">
        <Globe size={15} className="text-primary" />
        <h2 className="text-sm font-bold text-content-primary">Global Leaderboard</h2>
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">PRO</span>
      </header>

      {!isOptedIn ? (
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 text-center space-y-3">
          <UserCheck size={28} className="text-primary mx-auto" />
          <div>
            <p className="text-sm font-bold text-content-primary">Join the Leaderboard</p>
            <p className="text-xs text-content-muted mt-1">
              Compete on GTD health score — no task content is ever shared.
            </p>
          </div>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="px-5 py-2 bg-primary text-on-brand rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {joining ? 'Joining…' : 'Join (anonymous ranking)'}
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 py-6 text-content-muted text-sm justify-center">
          <Loader2 size={14} className="animate-spin" />
          Loading rankings…
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-content-muted text-center py-4">No rankings yet. You could be #1!</p>
      ) : (
        <>
          <div className="space-y-1">
            {entries.map(entry => (
              <EntryRow key={entry.uid} entry={entry} isCurrentUser={entry.uid === uid} />
            ))}
          </div>
          <button
            onClick={leave}
            className="text-xs text-content-muted underline underline-offset-2 w-full text-center"
          >
            Leave leaderboard
          </button>
        </>
      )}
    </section>
  );
}
