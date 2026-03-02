/**
 * googleWebhook.ts
 * Firebase Cloud Function — handles Google Play Real-Time Developer Notifications.
 *
 * Play sends Pub/Sub messages to this endpoint for subscription lifecycle events.
 * We decode the message, check the subscription state via the Google Play
 * Android Publisher API, and write the canonical Pro status to Firestore.
 *
 * Endpoint: POST /googleWebhook
 * Configure in Google Play Console → Monetise → Subscriptions → Real-time notifications
 *   Topic: projects/{project}/topics/play-billing
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();

interface PubSubMessage {
    message: {
        data: string;     // base64-encoded JSON
        messageId: string;
        publishTime: string;
    };
    subscription: string;
}

interface PlayDeveloperNotification {
    version: string;
    packageName: string;
    eventTimeMillis: string;
    subscriptionNotification?: {
        version: string;
        notificationType: number;
        purchaseToken: string;
        subscriptionId: string;
    };
}

/**
 * Play Billing notification types
 * https://developer.android.com/google/play/billing/rtdn-reference
 */
const PLAY_SUBSCRIPTION_ACTIVE = new Set([1, 2, 4, 7]);   // RECOVERED, RENEWED, PURCHASED, RESTARTED
const PLAY_SUBSCRIPTION_INACTIVE = new Set([3, 5, 6, 12, 13]); // CANCELED, ON_HOLD, IN_GRACE_PERIOD, REVOKED, EXPIRED

export const googleWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const body = req.body as PubSubMessage;
        if (!body?.message?.data) {
            res.status(400).send('Missing Pub/Sub message');
            return;
        }

        const raw = Buffer.from(body.message.data, 'base64').toString('utf8');
        const notification = JSON.parse(raw) as PlayDeveloperNotification;

        const sub = notification.subscriptionNotification;
        if (!sub) {
            // Could be a one-time product notification — skip
            res.status(200).send('ok (no subscription notification)');
            return;
        }

        const { notificationType, purchaseToken, subscriptionId } = sub;

        // Look up which uid owns this purchase token
        const tokenSnap = await admin.firestore()
            .collection('play_tokens')
            .doc(purchaseToken)
            .get();

        const uid = tokenSnap.data()?.uid as string | undefined;
        if (!uid) {
            res.status(200).send('ok (unknown token)');
            return;
        }

        const active   = PLAY_SUBSCRIPTION_ACTIVE.has(notificationType);
        const inactive = PLAY_SUBSCRIPTION_INACTIVE.has(notificationType);

        if (active || inactive) {
            await admin.firestore()
                .doc(`users/${uid}/subscription/status`)
                .set({
                    active,
                    plan: subscriptionId,
                    platform: 'android',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    rawNotificationType: notificationType,
                }, { merge: true });
        }

        res.status(200).send('ok');
    } catch (err) {
        console.error('[GoogleWebhook] Error:', err);
        res.status(500).send('Internal error');
    }
});
