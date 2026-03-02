import { platform } from './platform';

/**
 * Safe Capacitor plugin access via window.Capacitor.Plugins.
 *
 * All installed Capacitor plugins self-register into the global plugin
 * registry when the WebView boots — no npm imports needed at the JS layer.
 * Returns null on web or when the plugin is not installed.
 *
 * @param name Plugin identifier as:
 *   - PascalCase class name  → 'StatusBar', 'PushNotifications', 'NativeBiometric'
 *   - kebab-case package suffix → 'status-bar', 'push-notifications' (auto-converted)
 */
export async function getPlugin<T>(name: string): Promise<T | null> {
    if (!platform.isNative()) return null;

    // Normalise kebab-case → PascalCase  ('push-notifications' → 'PushNotifications')
    const className = name.includes('-')
        ? name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
        : name;

    return platform.getPlugin<T>(className);
}
