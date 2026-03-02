import { platform, getPlugin } from '../';

export type HapticType =
    | 'impact_light'
    | 'impact_medium'
    | 'impact_heavy'
    | 'notification_success'
    | 'notification_warning'
    | 'notification_error'
    | 'selection';

export async function triggerHaptic(type: HapticType, adhdMode: boolean = false): Promise<void> {
    if (!platform.isNative()) {
        // Web fallback (minimal support)
        if (typeof navigator !== 'undefined' && navigator.vibrate && !adhdMode) {
            if (type.includes('heavy') || type.includes('notification')) {
                navigator.vibrate(50);
            }
        }
        return;
    }

    const haptics = await getPlugin<any>('haptics');
    if (!haptics) return;

    try {
        switch (type) {
            case 'impact_light':
                await haptics.impact({ style: 'light' });
                break;
            case 'impact_medium':
                await haptics.impact({ style: adhdMode ? 'light' : 'medium' });
                break;
            case 'impact_heavy':
                await haptics.impact({ style: adhdMode ? 'light' : 'heavy' });
                break;
            case 'notification_success':
                if (!adhdMode) {
                    await haptics.notification({ type: 'success' });
                } else {
                    await haptics.impact({ style: 'medium' });
                }
                break;
            case 'notification_warning':
                if (!adhdMode) await haptics.notification({ type: 'warning' });
                break;
            case 'notification_error':
                await haptics.notification({ type: 'error' }); // Always trigger error
                break;
            case 'selection':
                if (!adhdMode) await haptics.selectionStart();
                break;
        }
    } catch (error) {
        console.error('[Haptics] Failed to trigger haptic feedback:', error);
    }
}
