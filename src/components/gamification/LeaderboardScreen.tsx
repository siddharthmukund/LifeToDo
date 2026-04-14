'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/gamification/useLeaderboard';
import { LeaderboardEntryRow } from '@/components/gamification/LeaderboardEntry';
import { useFeatureFlag } from '@/flags/useFeatureFlag';

export default function LeaderboardScreen({ uid }: { uid?: string }) {
    const isPro = useFeatureFlag('cloud_sync');
    const { entries, loading, isOptedIn, join, leave } = useLeaderboard(uid);
    const [isJoining, setIsJoining] = useState(false);

    if (!isPro) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary-ink rounded-full flex items-center justify-center text-2xl mb-4">
                    👑
                </div>
                <h2 className="text-xl font-bold mb-2">Pro Leaderboards</h2>
                <p className="text-content-secondary max-w-sm mb-6">Compare your GTD discipline with friends and the global community. Available on Life To Do Pro.</p>
                <button className="bg-primary text-on-brand px-6 py-2 rounded-xl font-medium">Upgrade to Pro</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isOptedIn) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Join the Leaderboard</h1>
                <p className="text-content-secondary text-sm mb-6 text-left">
                    Leaderboards show your display name, avatar, level, GTD Health Score, and streak.
                    <br /><br />
                    <strong>Your task details, projects, and inbox contents are NEVER shared.</strong>
                    <br /><br />
                    You can leave anytime — your data is removed instantly.
                </p>

                <button
                    onClick={async () => {
                        setIsJoining(true);
                        await join('Anonymous GTDer', null, 50); // Mocks for now, real implementation pulls from auth context
                        setIsJoining(false);
                    }}
                    disabled={isJoining}
                    className="w-full bg-primary text-on-brand py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                    {isJoining ? 'Joining...' : 'Opt-in to Leaderboards'}
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary mb-1">Leaderboards</h1>
                    <p className="text-content-secondary text-sm">Ranked by GTD Health Score</p>
                </div>
                <button
                    onClick={leave}
                    className="text-sm font-medium text-status-error hover:text-status-error/80 bg-status-error/10 px-3 py-1.5 rounded-lg"
                >
                    Opt Out
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {entries.map(entry => (
                    <LeaderboardEntryRow key={entry.uid} entry={entry} isCurrentUser={entry.uid === uid} />
                ))}

                {entries.length === 0 && (
                    <div className="text-center p-10 text-content-muted">
                        No entries yet. Be the first!
                    </div>
                )}
            </div>
        </div>
    );
}
