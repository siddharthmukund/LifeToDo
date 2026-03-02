import { platform, getPlugin } from '../';

export interface SharedContent {
    text?: string;
    url?: string;
    imageUri?: string;
}

/**
 * Listens for content shared INTO the app natively 
 * (e.g., from the iOS Share Extension via AppGroup bridge).
 */
export async function addShareReceiverListener(callback: (content: SharedContent) => void) {
    if (!platform.isNative()) return;

    // A community plugin like capacitor-share-extension or custom deep link payload
    // is usually required here. For now, we mock the App plugin's deep link event.
    const app = await getPlugin<any>('app');
    if (app) {
        app.addListener('appUrlOpen', (data: any) => {
            // Parse custom URL schemes containing shared payload
            // E.g. lifetodo://share?text=...
            if (data.url && data.url.includes(' lifetodo://share')) {
                const urlObj = new URL(data.url);
                callback({
                    text: urlObj.searchParams.get('text') || undefined,
                    url: urlObj.searchParams.get('url') || undefined,
                });
            }
        });
    }
}

export async function removeShareReceiverListeners() {
    if (!platform.isNative()) return;
    const app = await getPlugin<any>('app');
    if (app) app.removeAllListeners();
}
