/**
 * billingProvider.ts
 * Unified BillingProvider interface implemented by StoreKit, Play Billing,
 * and Stripe adapters. All adapters share the same contract so the rest of
 * the app stays platform-agnostic.
 */

// ── Product IDs ─────────────────────────────────────────────────────────────
// These must match App Store Connect + Google Play Console exactly.

export const PRODUCT_IDS = {
    PRO_MONTHLY: 'app.lifetodo.pro.monthly',
    PRO_ANNUAL:  'app.lifetodo.pro.annual',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

// Firestore path where Pro status is written/read
export const SUBSCRIPTION_DOC_PATH = (uid: string) => `users/${uid}/subscription/status`;

// ── Domain types ────────────────────────────────────────────────────────────

export interface SubscriptionProduct {
    productId: string;
    title: string;
    description: string;
    price: string;           // Formatted, e.g. '$4.99'
    priceAmount: number;     // Raw micros / 100 for display math
    currency: string;        // ISO 4217 e.g. 'USD'
    period: 'monthly' | 'annual';
}

export interface PurchaseResult {
    success: boolean;
    productId?: string;
    transactionId?: string;
    receipt?: string;        // iOS receipt / Android purchase token
    error?: string;
    userCancelled?: boolean;
}

// ── Provider interface ──────────────────────────────────────────────────────

export interface BillingProvider {
    /**
     * Initialize the billing SDK for the current user.
     * Must be called before any other method.
     */
    initialize(uid: string): Promise<boolean>;

    /** Fetch available subscription products from the platform store. */
    getProducts(ids: string[]): Promise<SubscriptionProduct[]>;

    /** Trigger a native purchase flow for the given product ID. */
    purchase(productId: string): Promise<PurchaseResult>;

    /**
     * Restore previous purchases (required by App Store / Play Store guidelines).
     * Returns true if an active Pro subscription was found.
     */
    restore(): Promise<boolean>;

    /**
     * Check whether the user currently has an active Pro entitlement.
     * Reads from Firestore for cross-device consistency.
     */
    checkProStatus(): Promise<boolean>;

    /** Release any held resources or listeners. */
    dispose(): void;
}
