/**
 * appleWebhook.ts
 * Firebase Cloud Function — handles Apple Server-to-Server notification webhooks.
 *
 * Apple sends signed JWS payloads to this endpoint for subscription lifecycle events
 * (SUBSCRIBED, DID_RENEW, EXPIRED, REFUND, etc.).
 * We decode the payload and write the canonical subscription status to Firestore.
 *
 * Endpoint: POST /appleWebhook
 * Configure in App Store Connect → App → Subscriptions → Server Notifications URL
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();

interface AppleNotificationPayload {
    notificationType: string;
    subtype?: string;
    data?: {
        appAppleId?: number;
        bundleId?: string;
        bundleVersion?: string;
        environment?: string;
        signedTransactionInfo?: string;
        signedRenewalInfo?: string;
    };
}

interface DecodedTransactionInfo {
    appAccountToken?: string;   // maps to our uid stored at purchase time
    productId: string;
    expiresDate?: number;       // Unix ms
    type: string;
}

/** Minimal base64url decode (JWS payload is base64url-encoded). */
function decodeJWSPayload<T>(jws: string): T | null {
    try {
        const parts = jws.split('.');
        if (parts.length < 2) return null;
        const json = Buffer.from(parts[1], 'base64url').toString('utf8');
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

const ACTIVE_TYPES = new Set(['SUBSCRIBED', 'DID_RENEW', 'DID_RECOVER', 'OFFER_REDEEMED']);
const INACTIVE_TYPES = new Set(['EXPIRED', 'REFUND', 'REVOKE', 'GRACE_PERIOD_EXPIRED']);

export const appleWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const body = req.body as AppleNotificationPayload;
        const { notificationType, data } = body;

        if (!data?.signedTransactionInfo) {
            res.status(400).send('Missing signedTransactionInfo');
            return;
        }

        const tx = decodeJWSPayload<DecodedTransactionInfo>(data.signedTransactionInfo);
        if (!tx) {
            res.status(400).send('Invalid JWS payload');
            return;
        }

        const uid       = tx.appAccountToken;   // set by our app during purchase
        const productId = tx.productId;
        const active    = ACTIVE_TYPES.has(notificationType);
        const inactive  = INACTIVE_TYPES.has(notificationType);

        if (!uid) {
            // Can't match to a user without the account token
            res.status(200).send('ok (no uid)');
            return;
        }

        if (active || inactive) {
            const expiresAt = tx.expiresDate
                ? admin.firestore.Timestamp.fromMillis(tx.expiresDate)
                : null;

            await admin.firestore()
                .doc(`users/${uid}/subscription/status`)
                .set({
                    active,
                    plan: productId,
                    platform: 'ios',
                    expiresAt,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    rawNotificationType: notificationType,
                }, { merge: true });
        }

        res.status(200).send('ok');
    } catch (err) {
        console.error('[AppleWebhook] Error:', err);
        res.status(500).send('Internal error');
    }
});
