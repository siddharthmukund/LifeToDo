import { platform, getPlugin } from '../';

/**
 * Dynamically updates the native Status Bar color to match the Next.js active theme.
 */
export async function syncStatusBar(isDark: boolean) {
    if (!platform.isNative()) return;

    const statusBar = await getPlugin<any>('status-bar');
    if (!statusBar) return;

    try {
        const Style = { Dark: 'DARK', Light: 'LIGHT' }; // From @capacitor/status-bar
        await statusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });

        // Set a solid color on Android, let iOS remain translucent over the safe area
        if (platform.isAndroid()) {
            await statusBar.setBackgroundColor({ color: isDark ? '#09090b' : '#ffffff' });
        }
    } catch (err) {
        console.error('[StatusBar] Sync failed', err);
    }
}
