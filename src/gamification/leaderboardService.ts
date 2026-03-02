import { getFirebaseFirestore, FIREBASE_CONFIGURED } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { LeaderboardEntry } from '../types/gamification';
import { useGamificationStore } from './gamificationStore';
import { getLifetimeStats } from '@/lib/lifetimeStatsService';
import { useGTDHealthScore } from '@/analytics/useGTDHealthScore'; // we'll need this or calculate it

// We'll write this service assuming it's called client-side where FIREBASE_CONFIGURED is true

export async function fetchGlobalLeaderboard(limitCount: number = 50): Promise<LeaderboardEntry[]> {
    if (!FIREBASE_CONFIGURED) return [];

    const db = getFirebaseFirestore();
    const lbRef = collection(db, 'leaderboard_entry');
    const q = query(lbRef, orderBy('gtdHealthScore', 'desc'), orderBy('weeklyXP', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as LeaderboardEntry));
}

// Update the user's score to the leaderboard
export async function syncLeaderboardScore(
    uid: string,
    displayName: string,
    avatarUrl: string | null,
    healthScore: number
) {
    if (!FIREBASE_CONFIGURED) return;

    const state = useGamificationStore.getState();
    if (!state.preferences.leaderboardOptIn) return;

    const db = getFirebaseFirestore();
    const lbRef = doc(db, 'leaderboard_entry', uid);

    await setDoc(lbRef, {
        uid,
        displayName,
        avatarUrl,
        level: state.currentLevel,
        gtdHealthScore: healthScore,
        weeklyXP: 0, // In full implementation, we'd calculate this from Dexie xp_events
        currentStreak: state.currentStreak.days,
        updatedAt: new Date().toISOString()
    }, { merge: true });
}

export async function optOutLeaderboard(uid: string) {
    if (!FIREBASE_CONFIGURED) return;

    const db = getFirebaseFirestore();
    const lbRef = doc(db, 'leaderboard_entry', uid);
    await deleteDoc(lbRef);

    useGamificationStore.getState().updatePreferences({ leaderboardOptIn: false });
}
