'use client';
import { useState, useEffect, useCallback } from 'react';
import { initBilling, fetchOfferings, purchasePackage, restorePurchases } from './billingService';
import { useAuth } from '@/auth/useAuth';
import { platform } from '../';

/**
 * Hook to interface with native App Store and Google Play Subscriptions.
 * Replaces Stripe entirely on Native builds to comply with app store guidelines.
 */
export function useStoreBilling() {
    const { user } = useAuth();
    const [isReady, setIsReady] = useState(false);
    const [offerings, setOfferings] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (user && platform.isNative()) {
            initBilling(user.uid).then(success => {
                if (success) {
                    setIsReady(true);
                    fetchOfferings().then(setOfferings);
                }
            });
        }
    }, [user]);

    const purchase = useCallback(async (pkg: any) => {
        setIsProcessing(true);
        const success = await purchasePackage(pkg);
        setIsProcessing(false);
        return success;
    }, []);

    const restore = useCallback(async () => {
        setIsProcessing(true);
        const success = await restorePurchases();
        setIsProcessing(false);
        return success;
    }, []);

    return {
        isReady,
        isProcessing,
        isNativeBilling: platform.isNative(),
        offerings,
        purchase,
        restore
    };
}
