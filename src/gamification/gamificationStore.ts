import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserGamificationState, GamificationPreferences, UnlockedAchievement, ActiveChallenge } from '../types/gamification';

interface GamificationStore extends UserGamificationState {
    setTotalXP: (xp: number) => void;
    setLevel: (level: number) => void;
    setXPToNextLevel: (xp: number) => void;
    updateStreak: (streak: UserGamificationState['currentStreak']) => void;
    addAchievement: (achievement: UnlockedAchievement) => void;
    updateChallenges: (challenges: ActiveChallenge[]) => void;
    updatePreferences: (prefs: Partial<GamificationPreferences>) => void;
    addXP: (amount: number) => void;
    reset: () => void;
}

const DEFAULT_PREFERENCES: GamificationPreferences = {
    enabled: true,
    showXPBar: true,
    showCelebrations: true,
    showChallenges: true,
    leaderboardOptIn: false,
    celebrationIntensity: 'full'
};

const INITIAL_STATE: Omit<GamificationStore, 'setTotalXP' | 'setLevel' | 'setXPToNextLevel' | 'updateStreak' | 'addAchievement' | 'updateChallenges' | 'updatePreferences' | 'addXP' | 'reset'> = {
    totalXP: 0,
    currentLevel: 1,
    xpToNextLevel: 50,
    currentStreak: {
        type: 'daily_practice',
        days: 0,
        multiplier: 1.0,
        lastActiveDate: '',
        graceUsedToday: false
    },
    achievements: [],
    activeChallenges: [],
    preferences: DEFAULT_PREFERENCES
};

export const useGamificationStore = create<GamificationStore>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,
            setTotalXP: (xp) => set({ totalXP: xp }),
            setLevel: (level) => set({ currentLevel: level }),
            setXPToNextLevel: (xp) => set({ xpToNextLevel: xp }),
            updateStreak: (streak) => set({ currentStreak: streak }),
            addAchievement: (achievement) => set((state) => ({ achievements: [...state.achievements, achievement] })),
            updateChallenges: (challenges) => set({ activeChallenges: challenges }),
            updatePreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
            addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),
            reset: () => set({ ...INITIAL_STATE, preferences: get().preferences })
        }),
        {
            name: 'gtd-gamification-storage',
            // We only persist preferences so far, but we could persist state if we want.
            // Wait, preferences and basic state should be persisted for immediate UI updates,
            // though the single source of truth for stats is Dexie.
        }
    )
);
