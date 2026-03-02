import { platform, getPlugin } from '../';

// Simple mock for storing the token (In reality, send to Firebase Firestore)
async function savePushToken(token: string, platformName: string) {
    console.log(`[PushService] Saving push token for ${platformName}: ${token}`);
    // e.g. await db.collection('users').doc(uid).collection('push_tokens').doc(platformName).set({ token });
}

export async function requestPushPermission(): Promise<boolean> {
    if (!platform.isNative()) {
        // Web fallback
        if (typeof Notification === 'undefined') return false;
        const perm = await Notification.requestPermission();
        return perm === 'granted';
    }

    const push = await getPlugin<any>('push-notifications');
    if (!push) return false;

    const result = await push.requestPermissions();
    return result.receive === 'granted';
}

export async function registerPush(): Promise<string | null> {
    if (!platform.isNative()) {
        // Web push requires VAPID keys and service worker subscriptions
        console.log('[PushService] Web push registration via Service Worker required.');
        return null;
    }

    const push = await getPlugin<any>('push-notifications');
    if (!push) return null;

    // Register with FCM / APNs
    await push.register();

    return new Promise((resolve) => {
        push.addListener('registration', (token: { value: string }) => {
            savePushToken(token.value, platform.getPlatform());
            resolve(token.value);
        });

        push.addListener('registrationError', (error: any) => {
            console.error('[PushService] Error on registration:', error);
            resolve(null);
        });
    });
}

export async function addPushListeners(
    onNotificationReceived: (notification: any) => void,
    onNotificationAction: (action: any) => void
) {
    if (!platform.isNative()) return;

    const push = await getPlugin<any>('push-notifications');
    if (!push) return;

    push.addListener('pushNotificationReceived', onNotificationReceived);
    push.addListener('pushNotificationActionPerformed', onNotificationAction);
}

export async function removeAllPushListeners() {
    if (!platform.isNative()) return;

    const push = await getPlugin<any>('push-notifications');
    if (push) {
        push.removeAllListeners();
    }
}
