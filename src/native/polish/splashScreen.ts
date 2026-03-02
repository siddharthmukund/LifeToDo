import { platform, getPlugin } from '../';

/**
 * Hides the native splash screen after React has hydrated and drawn the initial UI.
 */
export async function hideSplashScreen() {
    if (!platform.isNative()) return;

    const splash = await getPlugin<any>('splash-screen');
    if (!splash) return;

    try {
        await splash.hide();
    } catch (err) {
        console.error('[SplashScreen] Failed to hide', err);
    }
}
