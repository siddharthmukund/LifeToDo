/**
 * playBillingAdapter.ts
 * Android Google Play Billing adapter.
 *
 * Uses the same InAppPurchases plugin interface as StoreKitAdapter — the
 * underlying Capacitor plugin abstracts the platform difference.
 */

import { platform } from '../platform';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { BillingProvider, SubscriptionProduct, PurchaseResult } from './billingProvider';
import { SUBSCRIPTION_DOC_PATH } from './billingProvider';

interface IAPPlugin {
    getProducts(options: { productIds: string[] }): Promise<{ products: IAPRawProduct[] }>;
    purchaseProduct(options: { productId: string }): Promise<IAPRawTransaction>;
    restorePurchases(): Promise<{ transactions: IAPRawTransaction[] }>;
    finishTransaction(options: { transactionId: string }): Promise<void>;
    acknowledgePurchase(options: { purchaseToken: string }): Promise<void>;
}

interface IAPRawProduct {
    productId: string;
    localizedTitle: string;
    localizedDescription: string;
    price: string;
    priceAmount: number;
    currencyCode: string;
}

interface IAPRawTransaction {
    productId: string;
    transactionId: string;
    purchaseToken?: string;
    state: 'purchased' | 'restored' | 'failed' | 'cancelled';
    error?: string;
}

export class PlayBillingAdapter implements BillingProvider {
    private uid = '';
    private plugin: IAPPlugin | null = null;

    async initialize(uid: string): Promise<boolean> {
        this.uid = uid;
        this.plugin = platform.getPlugin<IAPPlugin>('InAppPurchases');
        if (!this.plugin) {
            console.warn('[PlayBilling] InAppPurchases plugin not available');
            return false;
        }
        return true;
    }

    async getProducts(ids: string[]): Promise<SubscriptionProduct[]> {
        if (!this.plugin) return [];
        try {
            const { products } = await this.plugin.getProducts({ productIds: ids });
            return products.map(p => ({
                productId:   p.productId,
                title:       p.localizedTitle,
                description: p.localizedDescription,
                price:       p.price,
                priceAmount: p.priceAmount,
                currency:    p.currencyCode,
                period:      p.productId.includes('annual') ? 'annual' : 'monthly',
            }));
        } catch (err) {
            console.error('[PlayBilling] getProducts failed', err);
            return [];
        }
    }

    async purchase(productId: string): Promise<PurchaseResult> {
        if (!this.plugin) return { success: false, error: 'Plugin unavailable' };
        try {
            const tx = await this.plugin.purchaseProduct({ productId });

            if (tx.state === 'purchased') {
                // Acknowledge the purchase so Play doesn't refund it after 3 days
                if (tx.purchaseToken) {
                    await this.plugin.acknowledgePurchase({ purchaseToken: tx.purchaseToken });
                }
                await this.plugin.finishTransaction({ transactionId: tx.transactionId });
                await this._syncProToFirestore(true, productId);
                return { success: true, productId: tx.productId, transactionId: tx.transactionId };
            }

            if (tx.state === 'cancelled') {
                return { success: false, userCancelled: true };
            }

            return { success: false, error: tx.error ?? 'Purchase failed' };
        } catch (err: any) {
            return { success: false, error: err?.message, userCancelled: !!err?.userCancelled };
        }
    }

    async restore(): Promise<boolean> {
        if (!this.plugin) return false;
        try {
            const { transactions } = await this.plugin.restorePurchases();
            const hasPro = transactions.some(
                tx => tx.state === 'restored' &&
                    (tx.productId.includes('pro.monthly') || tx.productId.includes('pro.annual'))
            );
            if (hasPro) await this._syncProToFirestore(true, transactions[0]?.productId);
            return hasPro;
        } catch (err) {
            console.error('[PlayBilling] restore failed', err);
            return false;
        }
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

    dispose(): void { /* no persistent listeners */ }

    private async _syncProToFirestore(active: boolean, productId?: string): Promise<void> {
        try {
            const db = getFirestore();
            await setDoc(doc(db, SUBSCRIPTION_DOC_PATH(this.uid)), {
                active,
                plan: productId ?? '',
                platform: 'android',
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } catch (err) {
            console.error('[PlayBilling] Firestore sync failed', err);
        }
    }
}
