import { useEffect, useState } from 'react';
import { useGamificationStore } from './gamificationStore';
import { rotateDailyChallenges } from './challengeEngine';
import { CHALLENGES } from './challenges';
import { useFeatureFlag } from '@/flags/useFeatureFlag';

export function useChallenges() {
    const activeChallenges = useGamificationStore((state) => state.activeChallenges);
    const preferences = useGamificationStore((state) => state.preferences);
    const [loading, setLoading] = useState(true);
    const isPro = useFeatureFlag('cloud_sync'); // use cloud_sync as a proxy for 'pro', or another pro flag 

    useEffect(() => {
        if (!preferences.enabled || !preferences.showChallenges) {
            setLoading(false);
            return;
        }

        const initChallenges = async () => {
            // Rotate and load challenges, default false for 'isPro'
            await rotateDailyChallenges(isPro);
            setLoading(false);
        };

        initChallenges();
    }, [preferences.enabled, preferences.showChallenges, isPro]); // eslint-disable-line react-hooks/exhaustive-deps

    const enrichedChallenges = activeChallenges.map(ac => {
        const def = CHALLENGES.find(c => c.id === ac.challengeId);
        return { ...ac, def };
    });

    return {
        challenges: enrichedChallenges,
        loading
    };
}
