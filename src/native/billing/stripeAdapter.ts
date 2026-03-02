/**
 * stripeAdapter.ts
 * Web / fallback billing adapter — delegates to the existing Stripe checkout
 * endpoints already implemented in iCCW #11.
 *
 * On web builds the "native" billing UI is replaced by a Stripe Checkout
 * redirect; Pro status is written to Firestore by the /api/stripe/webhook
 * handler after payment succeeds.
 */

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import type { BillingProvider, SubscriptionProduct, PurchaseResult } from './billingProvider';
import { SUBSCRIPTION_DOC_PATH, PRODUCT_IDS } from './billingProvider';

const STRIPE_PRICE_MAP: Record<string, string> = {
    [PRODUCT_IDS.PRO_MONTHLY]: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? '',
    [PRODUCT_IDS.PRO_ANNUAL]:  process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL  ?? '',
};

export class StripeAdapter implements BillingProvider {
    private uid = '';

    async initialize(uid: string): Promise<boolean> {
        this.uid = uid;
        return true;   // No SDK to initialise on web
    }

    async getProducts(ids: string[]): Promise<SubscriptionProduct[]> {
        // Minimal static product catalogue for the upgrade UI
        const catalogue: SubscriptionProduct[] = [
            {
                productId:   PRODUCT_IDS.PRO_MONTHLY,
                title:       'Life To Do Pro — Monthly',
                description: 'Full AI coaching, cloud sync, and all Pro features.',
                price:       '$4.99',
                priceAmount: 499,
                currency:    'USD',
                period:      'monthly',
            },
            {
                productId:   PRODUCT_IDS.PRO_ANNUAL,
                title:       'Life To Do Pro — Annual',
                description: 'Best value. Full Pro access for a full year.',
                price:       '$39.99',
                priceAmount: 3999,
                currency:    'USD',
                period:      'annual',
            },
        ];
        return catalogue.filter(p => ids.includes(p.productId));
    }

    async purchase(productId: string): Promise<PurchaseResult> {
        // Create a Stripe Checkout Session and redirect the browser.
        // The webhook will mark the user as Pro in Firestore after payment.
        try {
            const priceId = STRIPE_PRICE_MAP[productId];
            if (!priceId) return { success: false, error: 'Unknown product' };

            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, uid: this.uid }),
            });

            if (!res.ok) throw new Error('Checkout session creation failed');
            const { url } = await res.json() as { url: string };
            if (url) window.location.href = url;

            // Will not reach here — browser navigated away
            return { success: false };
        } catch (err: any) {
            console.error('[Stripe] Checkout failed', err);
            return { success: false, error: err?.message };
        }
    }

    async restore(): Promise<boolean> {
        // On web, "restore" = check Firestore (populated by webhook)
        return this.checkProStatus();
    }

    async checkProStatus(): Promise<boolean> {
        try {
            const db = getFirestore();
            const snap = await getDoc(doc(db, SUBSCRIPTION_DOC_PATH(this.uid)));
            return snap.exists() && snap.data()?.active === true;
        } catch {
            return false;
        }
    }

    dispose(): void { /* nothing to tear down */ }
}
