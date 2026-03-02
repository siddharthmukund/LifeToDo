import { platform } from './platform';
import { getPlugin } from './bridge';

export interface PlatformCapabilities {
    push: boolean;              // Native push notifications available
    biometric: boolean;         // Face ID / fingerprint available
    haptics: boolean;           // Haptic engine available
    nativeShare: boolean;       // Native Share Sheet available
    nativeFilesystem: boolean;  // Native file access (Save to Files)
    badge: boolean;             // App icon badge count
    deepLinks: boolean;         // Universal Links / App Links
    nativeKeyboard: boolean;    // Native keyboard control
    secureStorage: boolean;     // Keychain / Keystore
    nativeSpeech: boolean;      // Native speech recognition
}

let cachedCapabilities: PlatformCapabilities | null = null;

export async function detectCapabilities(): Promise<PlatformCapabilities> {
    if (cachedCapabilities) return cachedCapabilities;

    if (!platform.isNative()) {
        // Web platform fallbacks
        cachedCapabilities = {
            push: false,
            biometric: false,
            haptics: typeof navigator !== 'undefined' && 'vibrate' in navigator,
            nativeShare: typeof navigator !== 'undefined' && 'share' in navigator,
            nativeFilesystem: false,
            badge: false,
            deepLinks: false,
            nativeKeyboard: false,
            secureStorage: false,
            nativeSpeech: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
        };
        return cachedCapabilities;
    }

    // Native platform detections
    const [
        pushPlugin,
        biometricPlugin,
        hapticsPlugin,
        sharePlugin,
        fsPlugin,
        badgePlugin,
        appPlugin,
        keyboardPlugin,
    ] = await Promise.all([
        getPlugin<any>('push-notifications'),
        getPlugin<any>('native-biometric'), // Using community plugin or similar
        getPlugin<any>('haptics'),
        getPlugin<any>('share'),
        getPlugin<any>('filesystem'),
        getPlugin<any>('badge'), // Could be community shortcut-badger
        getPlugin<any>('app'),
        getPlugin<any>('keyboard'),
    ]);

    let hasBiometric = false;
    if (biometricPlugin && biometricPlugin.isAvailable) {
        try {
            const bioResult = await biometricPlugin.isAvailable();
            hasBiometric = bioResult.isAvailable;
        } catch {
            hasBiometric = false;
        }
    }

    cachedCapabilities = {
        push: !!pushPlugin,
        biometric: hasBiometric,
        haptics: !!hapticsPlugin,
        nativeShare: !!sharePlugin,
        nativeFilesystem: !!fsPlugin,
        badge: !!badgePlugin,
        deepLinks: !!appPlugin, // App plugin handles AppURLOpen events
        nativeKeyboard: !!keyboardPlugin,
        secureStorage: hasBiometric, // NativeBiometric often includes secure credential store
        nativeSpeech: false, // Could be true if a specific speech plugin is added
    };

    return cachedCapabilities;
}
