'use client';

import { LeaderboardEntry as Entry } from '../../types/gamification';
import { motion } from 'framer-motion';

interface Props {
    entry: Entry;
    isCurrentUser: boolean;
}

export function LeaderboardEntryRow({ entry, isCurrentUser }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        flex items-center justify-between p-4 mb-2 rounded-2xl border 
        ${isCurrentUser
                    ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
                }
      `}
        >
            <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-8 font-bold text-zinc-400">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </div>

                {/* Avatar Placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt={entry.displayName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        entry.displayName.charAt(0).toUpperCase()
                    )}
                </div>

                {/* User Info */}
                <div className="flex flex-col">
                    <span className={`font-semibold ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {entry.displayName} {isCurrentUser && '(You)'}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                        Lvl {entry.level} • 🔥 {entry.currentStreak}d
                    </span>
                </div>
            </div>

            {/* Target Metric */}
            <div className="flex flex-col items-end">
                <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{entry.gtdHealthScore}</span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Health</span>
            </div>
        </motion.div>
    );
}
