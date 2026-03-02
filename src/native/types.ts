// ── Core ──────────────────────────────────────────────────────────────────────

export type PlatformType = 'ios' | 'android' | 'web';

export interface NativePluginError extends Error {
    code?: string;
    plugin?: string;
}

// ── Haptics ───────────────────────────────────────────────────────────────────

export type HapticImpactStyle = 'HEAVY' | 'MEDIUM' | 'LIGHT';
export type HapticNotificationType = 'SUCCESS' | 'WARNING' | 'ERROR';
export type HapticType =
    | 'impact_light'
    | 'impact_medium'
    | 'impact_heavy'
    | 'notification_success'
    | 'notification_warning'
    | 'notification_error'
    | 'selection_changed';

// ── Push Notifications ────────────────────────────────────────────────────────

export interface PushToken {
    value: string;
}

export interface PushNotificationPayload {
    id: string;
    title?: string;
    body?: string;
    data?: Record<string, string>;
    badge?: number;
}

export interface PushNotificationAction {
    actionId: string;
    inputValue?: string;
    notification: PushNotificationPayload;
}

export type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

// ── Biometric ─────────────────────────────────────────────────────────────────

export type BiometryType = 'face' | 'fingerprint' | 'iris' | 'none';

export interface BiometricAvailabilityResult {
    isAvailable: boolean;
    biometryType: string;
}

// ── Status Bar ────────────────────────────────────────────────────────────────

export type StatusBarStyle = 'DARK' | 'LIGHT' | 'DEFAULT';

export interface StatusBarOptions {
    style: StatusBarStyle;
    animated?: boolean;
}

export interface StatusBarColorOptions {
    color: string;
    animated?: boolean;
}

// ── Keyboard ──────────────────────────────────────────────────────────────────

export interface KeyboardInfo {
    keyboardHeight: number;
}

// ── Share ─────────────────────────────────────────────────────────────────────

export interface ShareOptions {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
    files?: string[];
}

export interface ShareResult {
    activityType?: string;
}

// ── Filesystem ────────────────────────────────────────────────────────────────

export type FilesystemEncoding = 'utf8' | 'ascii' | 'utf16';

export interface FilesystemWriteOptions {
    path: string;
    data: string;
    directory?: string;
    encoding?: FilesystemEncoding;
    recursive?: boolean;
}

export interface FilesystemReadOptions {
    path: string;
    directory?: string;
    encoding?: FilesystemEncoding;
}

export interface FilesystemReadResult {
    data: string;
}

// ── App / Deep Links ──────────────────────────────────────────────────────────

export interface AppUrlOpenEvent {
    url: string;
    iosSourceApplication?: string;
    iosOpenInPlace?: boolean;
}

// ── Splash Screen ─────────────────────────────────────────────────────────────

export interface SplashHideOptions {
    fadeOutDuration?: number;
}

// ── Badge ─────────────────────────────────────────────────────────────────────

export interface BadgeOptions {
    count: number;
}

// ── Local Notifications ───────────────────────────────────────────────────────

export interface LocalNotification {
    id: number;
    title: string;
    body: string;
    schedule?: {
        at?: Date;
        repeats?: boolean;
    };
    extra?: Record<string, string | number | boolean>;
    smallIcon?: string;
    iconColor?: string;
    actionTypeId?: string;
}

// ── In-App Purchases ──────────────────────────────────────────────────────────

export interface IAPProduct {
    productId: string;
    title: string;
    description: string;
    price: string;
    priceAmount: number;
    currency: string;
}

export interface IAPTransaction {
    productId: string;
    transactionId: string;
    receipt?: string;
}

export interface IAPPurchaseResult {
    productId: string;
    transactionId: string;
    verified: boolean;
}
