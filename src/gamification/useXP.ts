import { useGamificationStore } from './gamificationStore';

export function useXP() {
    const totalXP = useGamificationStore((state) => state.totalXP);
    const currentLevel = useGamificationStore((state) => state.currentLevel);
    const xpToNextLevel = useGamificationStore((state) => state.xpToNextLevel);
    const preferences = useGamificationStore((state) => state.preferences);

    // Expose manual increment method if needed for testing or direct hooks
    const addXP = (amount: number) => {
        useGamificationStore.getState().addXP(amount);
    };

    return {
        totalXP,
        currentLevel,
        xpToNextLevel,
        addXP,
        isEnabled: preferences.enabled,
        showXPBar: preferences.showXPBar
    };
}
