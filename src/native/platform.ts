/**
 * Platform detection — zero npm imports required.
 *
 * window.Capacitor is injected by the Capacitor WebView at runtime.
 * On plain web (Next.js dev, browser, SSR) it is undefined, so every
 * helper returns a safe web-compatible default.
 */

type CapacitorPlatform = 'ios' | 'android' | 'web';

interface CapacitorGlobal {
    isNativePlatform(): boolean;
    getPlatform(): CapacitorPlatform;
    convertFileSrc(filePath: string): string;
    Plugins: Record<string, unknown>;
}

declare global {
    interface Window {
        Capacitor?: CapacitorGlobal;
    }
}

/** Returns the Capacitor global injected by the WebView, or null on web/SSR. */
function getCap(): CapacitorGlobal | null {
    if (typeof window === 'undefined') return null;
    return window.Capacitor ?? null;
}

export const platform = {
    /** True only when running inside a Capacitor iOS/Android WebView. */
    isNative: (): boolean => getCap()?.isNativePlatform() ?? false,

    isIOS: (): boolean => getCap()?.getPlatform() === 'ios',

    isAndroid: (): boolean => getCap()?.getPlatform() === 'android',

    isWeb: (): boolean => !(getCap()?.isNativePlatform() ?? false),

    getPlatform: (): CapacitorPlatform => getCap()?.getPlatform() ?? 'web',

    /** Converts a native fs path to a WebView-accessible URL. No-op on web. */
    convertFileSrc: (path: string): string =>
        getCap()?.convertFileSrc(path) ?? path,

    /**
     * Synchronous Capacitor plugin lookup via window.Capacitor.Plugins.
     * All installed plugins self-register into this registry at WebView load.
     * Returns null on web or if the plugin is not installed.
     *
     * @param name PascalCase plugin class name — e.g. 'StatusBar', 'PushNotifications'.
     */
    getPlugin: <T>(name: string): T | null => {
        const cap = getCap();
        if (!cap) return null;
        return (cap.Plugins[name] as T) ?? null;
    },
};
