/**
 * storeKitAdapter.ts
 * iOS StoreKit 2 adapter.
 *
 * Accesses the InAppPurchases Capacitor plugin registered at
 * window.Capacitor.Plugins.InAppPurchases (from @capacitor-community/in-app-purchases
 * or equivalent). Falls back gracefully if the plugin is absent.
 */

import { platform } from '../platform';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { BillingProvider, SubscriptionProduct, PurchaseResult } from './billingProvider';
import { SUBSCRIPTION_DOC_PATH } from './billingProvider';

interface IAPPlugin {
    echo(options: { value: string }): Promise<{ value: string }>;
    getProducts(options: { productIds: string[] }): Promise<{ products: IAPRawProduct[] }>;
    purchaseProduct(options: { productId: string }): Promise<IAPRawTransaction>;
    restorePurchases(): Promise<{ transactions: IAPRawTransaction[] }>;
    finishTransaction(options: { transactionId: string }): Promise<void>;
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
    receipt?: string;
    state: 'purchased' | 'restored' | 'failed' | 'cancelled';
    error?: string;
}

export class StoreKitAdapter implements BillingProvider {
    private uid = '';
    private plugin: IAPPlugin | null = null;

    async initialize(uid: string): Promise<boolean> {
        this.uid = uid;
        this.plugin = platform.getPlugin<IAPPlugin>('InAppPurchases');
        if (!this.plugin) {
            console.warn('[StoreKit] InAppPurchases plugin not available');
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
            console.error('[StoreKit] getProducts failed', err);
            return [];
        }
    }

    async purchase(productId: string): Promise<PurchaseResult> {
        if (!this.plugin) return { success: false, error: 'Plugin unavailable' };
        try {
            const tx = await this.plugin.purchaseProduct({ productId });

            if (tx.state === 'purchased') {
                await this.plugin.finishTransaction({ transactionId: tx.transactionId });
                await this._syncProToFirestore(true, productId);
                return { success: true, productId: tx.productId, transactionId: tx.transactionId, receipt: tx.receipt };
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
            console.error('[StoreKit] restore failed', err);
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
                platform: 'ios',
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } catch (err) {
            console.error('[StoreKit] Firestore sync failed', err);
        }
    }
}
