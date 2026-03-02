'use client';
/**
 * useSubscriptionStatus.ts
 * Real-time Firestore listener for Pro subscription status.
 * Keeps the UI in sync without polling, works on all platforms.
 */

import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/auth/useAuth';
import { SUBSCRIPTION_DOC_PATH } from './billingProvider';

export interface SubscriptionStatus {
    active: boolean;
    plan: string;
    platform: 'ios' | 'android' | 'web' | '';
    expiresAt?: Date;
}

const DEFAULT: SubscriptionStatus = { active: false, plan: '', platform: '' };

/**
 * Subscribe to the user's Firestore subscription document.
 * Returns live Pro status — updates whenever the webhook writes a new state.
 */
export function useSubscriptionStatus(): { status: SubscriptionStatus; loading: boolean } {
    const { user } = useAuth();
    const [status, setStatus]   = useState<SubscriptionStatus>(DEFAULT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setStatus(DEFAULT);
            setLoading(false);
            return;
        }

        const db  = getFirestore();
        const ref = doc(db, SUBSCRIPTION_DOC_PATH(user.uid));

        const unsub = onSnapshot(ref, (snap) => {
            if (!snap.exists()) {
                setStatus(DEFAULT);
            } else {
                const d = snap.data();
                setStatus({
                    active:    d.active ?? false,
                    plan:      d.plan   ?? '',
                    platform:  d.platform ?? '',
                    expiresAt: d.expiresAt?.toDate?.(),
                });
            }
            setLoading(false);
        }, () => {
            setLoading(false);
        });

        return unsub;
    }, [user]);

    return { status, loading };
}
