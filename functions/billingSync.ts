/**
 * billingSync.ts
 * Firebase Cloud Function — Firestore-triggered subscription sync.
 *
 * Whenever a subscription status document is written (by Apple/Google webhooks
 * or by the client adapters after a successful purchase), this function:
 *   1. Writes the canonical Pro status to the user's settings document
 *      so that the Zustand store picks it up on next sync.
 *   2. Sends a confirmation push notification to the user.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendTargetedPush } from './pushSender';
import { manageUserTopic } from './pushTopics';

if (!admin.apps.length) admin.initializeApp();

interface SubscriptionStatus {
    active: boolean;
    plan: string;
    platform: string;
}

export const billingSync = functions.firestore
    .document('users/{uid}/subscription/status')
    .onWrite(async (change, context) => {
        const uid = context.params.uid as string;
        const after = change.after.data() as SubscriptionStatus | undefined;

        if (!after) return;  // document deleted

        const isPro = after.active === true;

        // 1. Mirror Pro status into the main settings doc for the Zustand sync
        try {
            await admin.firestore()
                .doc(`users/${uid}`)
                .set({ tier: isPro ? 'pro' : 'free' }, { merge: true });
        } catch (err) {
            console.error('[BillingSync] Failed to update user tier', err);
        }

        // 2. Manage FCM topic for Pro-only push campaigns
        try {
            await manageUserTopic(uid, 'pro_users', isPro ? 'subscribe' : 'unsubscribe');
        } catch (err) {
            console.error('[BillingSync] Failed to manage topic', err);
        }

        // 3. Send a welcome/confirmation push
        const wasActive = change.before.data()?.active;
        if (isPro && !wasActive) {
            // Newly activated — send welcome message
            try {
                await sendTargetedPush(uid, {
                    title: '🎉 Welcome to Life To Do Pro!',
                    body:  'AI coaching, cloud sync, and all Pro features are now unlocked.',
                    type:  'pro_activated',
                    targetScreen: '/settings/upgrade',
                });
            } catch (err) {
                console.error('[BillingSync] Failed to send welcome push', err);
            }
        } else if (!isPro && wasActive) {
            // Downgraded / expired
            try {
                await sendTargetedPush(uid, {
                    title: 'Your Pro subscription has ended',
                    body:  'You can resubscribe anytime from Settings → Upgrade.',
                    type:  'pro_expired',
                    targetScreen: '/settings/upgrade',
                });
            } catch (err) {
                console.error('[BillingSync] Failed to send expiry push', err);
            }
        }
    });
