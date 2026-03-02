/**
 * billingService.ts
 * Top-level billing service — delegates to the platform-appropriate adapter:
 *   iOS     → StoreKit 2  via storeKitAdapter
 *   Android → Play Billing via playBillingAdapter
 *   Web     → Stripe       via stripeAdapter
 *
 * No RevenueCat dependency. Pro status truth lives in Firestore at
 *   users/{uid}/subscription  { active: boolean, plan: string, expiresAt: Timestamp }
 */

import { platform } from '../';
import type { BillingProvider } from './billingProvider';

let _provider: BillingProvider | null = null;

async function getProvider(): Promise<BillingProvider> {
    if (_provider) return _provider;

    if (platform.isIOS()) {
        const { StoreKitAdapter } = await import('./storeKitAdapter');
        _provider = new StoreKitAdapter();
    } else if (platform.isAndroid()) {
        const { PlayBillingAdapter } = await import('./playBillingAdapter');
        _provider = new PlayBillingAdapter();
    } else {
        const { StripeAdapter } = await import('./stripeAdapter');
        _provider = new StripeAdapter();
    }

    return _provider;
}

export async function initBilling(uid: string): Promise<boolean> {
    try {
        const provider = await getProvider();
        return provider.initialize(uid);
    } catch (err) {
        console.warn('[Billing] Initialization failed', err);
        return false;
    }
}

export async function fetchOfferings(): Promise<import('./billingProvider').SubscriptionProduct[] | null> {
    try {
        const provider = await getProvider();
        return provider.getProducts([
            'app.lifetodo.pro.monthly',
            'app.lifetodo.pro.annual',
        ]);
    } catch (err) {
        console.error('[Billing] Failed to fetch offerings', err);
        return null;
    }
}

export async function purchaseProduct(productId: string): Promise<boolean> {
    try {
        const provider = await getProvider();
        const result = await provider.purchase(productId);
        return result.success;
    } catch (err: any) {
        if (!err?.userCancelled) {
            console.error('[Billing] Purchase failed', err);
        }
        return false;
    }
}

/** @deprecated Use purchaseProduct(productId) */
export async function purchasePackage(pkg: { productId?: string; product_id?: string }): Promise<boolean> {
    const id = pkg?.productId ?? pkg?.product_id ?? '';
    return purchaseProduct(id);
}

export async function restorePurchases(): Promise<boolean> {
    try {
        const provider = await getProvider();
        return provider.restore();
    } catch (err) {
        console.error('[Billing] Restore failed', err);
        return false;
    }
}

export async function checkProStatus(): Promise<boolean> {
    try {
        const provider = await getProvider();
        return provider.checkProStatus();
    } catch {
        return false;
    }
}
