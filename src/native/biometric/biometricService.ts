import { platform } from '../';

/** Minimal interface for the capacitor-native-biometric plugin. */
interface BiometricPlugin {
    isAvailable(): Promise<{ isAvailable: boolean; biometryType: string }>;
    verifyIdentity(options: {
        reason: string;
        title: string;
        subtitle: string;
        useFallback: boolean;
        fallbackTitle: string;
    }): Promise<void>;
    setCredentials(options: { username: string; password: string; server: string }): Promise<void>;
    getCredentials(options: { server: string }): Promise<{ password: string }>;
    deleteCredentials(options: { server: string }): Promise<void>;
}

/** Synchronously look up the NativeBiometric plugin from the Capacitor registry. */
function getBio(): BiometricPlugin | null {
    return platform.getPlugin<BiometricPlugin>('NativeBiometric');
}

export interface BiometricAvailability {
    available: boolean;
    type: 'face' | 'fingerprint' | 'iris' | 'none';
    hasCredentials?: boolean;
}

export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
    if (!platform.isNative()) {
        return { available: false, type: 'none', hasCredentials: false };
    }

    try {
        const bio = getBio();
        if (!bio) return { available: false, type: 'none', hasCredentials: false };
        const result = await bio.isAvailable();
        return {
            available: result.isAvailable,
            type: result.biometryType as 'face' | 'fingerprint' | 'iris' | 'none',
            hasCredentials: result.isAvailable,
        };
    } catch {
        return { available: false, type: 'none', hasCredentials: false };
    }
}

export async function authenticateBiometric(reason: string): Promise<boolean> {
    if (!platform.isNative()) return false;

    try {
        const bio = getBio();
        if (!bio) return false;
        await bio.verifyIdentity({
            reason,
            title: 'Authentication Required',
            subtitle: reason,
            useFallback: true,
            fallbackTitle: 'Use Password',
        });
        return true;
    } catch (err) {
        console.error('Biometric auth failed or cancelled:', err);
        return false;
    }
}

// ── Secure token storage via Biometric Keystore/Keychain ──────────────────────

export async function storeSecureToken(token: string): Promise<void> {
    if (!platform.isNative()) return;
    const bio = getBio();
    if (!bio) return;
    await bio.setCredentials({ username: 'lifetodo-session', password: token, server: 'app.lifetodo' });
}

export async function getSecureToken(): Promise<string | null> {
    if (!platform.isNative()) return null;
    try {
        const bio = getBio();
        if (!bio) return null;
        const credentials = await bio.getCredentials({ server: 'app.lifetodo' });
        return credentials.password;
    } catch {
        return null;
    }
}

export async function deleteSecureToken(): Promise<void> {
    if (!platform.isNative()) return;
    try {
        const bio = getBio();
        if (bio) await bio.deleteCredentials({ server: 'app.lifetodo' });
    } catch {
        // already absent — no-op
    }
}
