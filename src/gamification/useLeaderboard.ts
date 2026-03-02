import { useEffect, useState } from 'react';
import { fetchGlobalLeaderboard, syncLeaderboardScore, optOutLeaderboard } from './leaderboardService';
import { LeaderboardEntry } from '../types/gamification';
import { useGamificationStore } from './gamificationStore';
import { useFeatureFlag } from '@/flags/useFeatureFlag';

export function useLeaderboard(uid?: string) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const preferences = useGamificationStore((state) => state.preferences);
    const isPro = useFeatureFlag('cloud_sync'); // Proxy for pro status

    useEffect(() => {
        if (!isPro || !preferences.leaderboardOptIn) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                const top50 = await fetchGlobalLeaderboard(50);
                setEntries(top50.map((entry, index) => ({ ...entry, rank: index + 1 })));
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [isPro, preferences.leaderboardOptIn]);

    const join = async (displayName: string, avatarUrl: string | null, healthScore: number) => {
        if (!uid) return;
        useGamificationStore.getState().updatePreferences({ leaderboardOptIn: true });
        await syncLeaderboardScore(uid, displayName, avatarUrl, healthScore);
    };

    const leave = async () => {
        if (!uid) return;
        await optOutLeaderboard(uid);
        setEntries([]);
    };

    return {
        entries,
        loading,
        isOptedIn: preferences.leaderboardOptIn,
        join,
        leave
    };
}
