'use client';
/**
 * useBilling.ts
 * React hook wrapping the platform billing service.
 * Exposes products, purchase, and restore while hiding the adapter details.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth/useAuth';
import { platform } from '../';
import {
    initBilling,
    fetchOfferings,
    purchaseProduct,
    restorePurchases,
    checkProStatus,
} from './billingService';
import type { SubscriptionProduct } from './billingProvider';

export interface UseBillingResult {
    /** True when the billing SDK is ready to process purchases. */
    isReady: boolean;
    /** True while a purchase or restore is in flight. */
    isProcessing: boolean;
    /** True if the current platform uses native billing (not Stripe web). */
    isNativeBilling: boolean;
    /** Available subscription products from the store. */
    products: SubscriptionProduct[];
    /** Current Pro status (from Firestore). */
    isPro: boolean;
    /** Initiate a purchase for the given product ID. */
    purchase: (productId: string) => Promise<boolean>;
    /** Restore previous purchases. */
    restore: () => Promise<boolean>;
}

export function useBilling(): UseBillingResult {
    const { user } = useAuth();
    const [isReady, setIsReady]         = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [products, setProducts]       = useState<SubscriptionProduct[]>([]);
    const [isPro, setIsPro]             = useState(false);

    useEffect(() => {
        if (!user) return;

        initBilling(user.uid).then(async (ok) => {
            if (!ok) return;
            setIsReady(true);

            const [offerings, pro] = await Promise.all([
                fetchOfferings(),
                checkProStatus(),
            ]);

            if (offerings) setProducts(offerings);
            setIsPro(pro);
        });
    }, [user]);

    const purchase = useCallback(async (productId: string): Promise<boolean> => {
        setIsProcessing(true);
        const ok = await purchaseProduct(productId);
        if (ok) setIsPro(true);
        setIsProcessing(false);
        return ok;
    }, []);

    const restore = useCallback(async (): Promise<boolean> => {
        setIsProcessing(true);
        const ok = await restorePurchases();
        if (ok) setIsPro(true);
        setIsProcessing(false);
        return ok;
    }, []);

    return {
        isReady,
        isProcessing,
        isNativeBilling: platform.isNative(),
        products,
        isPro,
        purchase,
        restore,
    };
}
