import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

// Push notification types matching messages/*/push.json keys
export type PushNotificationType =
    | 'inboxNudge'
    | 'reviewReminder'
    | 'streakWarning'
    | 'streakCelebration'
    | 'projectDeadline';

export interface PushParams {
    count?: number;
    project?: string;
    [key: string]: string | number | undefined;
}

const SUPPORTED_LOCALES = ['en', 'hi', 'es', 'ar', 'pt-BR', 'de', 'ja', 'zh-CN'];

/**
 * Minimal ICU message formatter for the patterns used in push notifications.
 * Handles: {variable}, {count, plural, one {# text} other {# text}}
 */
function formatICU(template: string, params: PushParams): string {
    // Handle plural: {key, plural, one {# singular} other {# plural}}
    let result = template.replace(
        /\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/g,
        (_, key, oneForm, otherForm) => {
            const count = typeof params[key] === 'number' ? (params[key] as number) : 0;
            const form = count === 1 ? oneForm : otherForm;
            return form.replace(/#/g, String(count));
        }
    );

    // Handle simple variables: {key}
    result = result.replace(/\{(\w+)\}/g, (_, key) => {
        const val = params[key];
        return val !== undefined ? String(val) : `{${key}}`;
    });

    return result;
}

/**
 * Loads push translation templates for the given locale, falling back to 'en'.
 */
function loadPushTemplates(locale: string): Record<string, { title: string; body: string }> {
    const messagesDir = path.join(__dirname, '..', 'messages');
    const localeFile = path.join(messagesDir, locale, 'push.json');
    const fallbackFile = path.join(messagesDir, 'en', 'push.json');

    try {
        return JSON.parse(fs.readFileSync(localeFile, 'utf-8'));
    } catch {
        return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
    }
}

/**
 * Sends a locale-aware targeted push notification to a specific user.
 * Reads the user's locale from Firestore, loads the matching translation
 * template, formats ICU variables, then dispatches to all registered tokens.
 */
export async function sendTargetedPush(
    uid: string,
    notificationType: PushNotificationType,
    params: PushParams,
    meta?: {
        targetScreen?: string;
        targetId?: string;
    }
) {
    // Fetch user locale and push tokens in parallel
    const [profileSnap, tokensSnapshot] = await Promise.all([
        admin.firestore().doc(`users/${uid}/profile/data`).get(),
        admin.firestore().collection(`users/${uid}/push_tokens`).get(),
    ]);

    if (tokensSnapshot.empty) {
        console.log(`No push tokens found for user ${uid}.`);
        return;
    }

    // Resolve locale — fall back to 'en' if not set or unsupported
    const rawLocale: string = profileSnap.data()?.locale ?? 'en';
    const locale = SUPPORTED_LOCALES.includes(rawLocale) ? rawLocale : 'en';

    // Load and format templates
    const templates = loadPushTemplates(locale);
    const template = templates[notificationType];
    if (!template) {
        console.error(`Unknown push notification type: ${notificationType}`);
        return;
    }

    const title = formatICU(template.title, params);
    const body = formatICU(template.body, params);

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token as string);

    const message = {
        notification: { title, body },
        data: {
            type: notificationType,
            targetScreen: meta?.targetScreen ?? '',
            targetId: meta?.targetId ?? '',
        },
        tokens,
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Push sent to user ${uid} [${locale}] (${notificationType}):`, response.successCount, 'ok,', response.failureCount, 'failed');

        // Clean up invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const code = resp.error?.code ?? '';
                    if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
                        invalidTokens.push(tokens[idx]);
                    }
                }
            });
            if (invalidTokens.length > 0) {
                await Promise.all(
                    tokensSnapshot.docs
                        .filter(doc => invalidTokens.includes(doc.data().token))
                        .map(doc => doc.ref.delete())
                );
                console.log(`Removed ${invalidTokens.length} invalid tokens for user ${uid}.`);
            }
        }
    } catch (error) {
        console.error('Error sending targeted push:', error);
    }
}
