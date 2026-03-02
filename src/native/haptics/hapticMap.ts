import { triggerHaptic, HapticType } from './hapticService';
import { useGTDStore } from '@/store/gtdStore';

/**
 * Maps standard analytics/GTD events into explicit haptic responses.
 * Follows the observer/middleware pattern to automatically respond to 
 * application lifecycle moments.
 */
export const hapticEventMap: Record<string, HapticType> = {
    'next_action_completed': 'impact_medium',
    'two_minute_completed': 'impact_medium',
    'inbox_item_clarified': 'impact_light',
    'inbox_zero_achieved': 'notification_success',
    'weekly_review_completed': 'notification_success',
    'level_up': 'notification_success', // We might double-trigger in logic if needed
    'achievement_unlocked': 'notification_warning',
    'streak_milestone': 'impact_heavy',
    'voice_capture_used': 'selection',
    'error': 'notification_error'
};

/**
 * Standard middleware hook that intercepts application events 
 * and routes them to the haptics engine based on user settings.
 */
export function handleHapticForEvent(event_name: string, payload?: Record<string, any>) {
    // Directly pull from the store (since this could be outside a component)
    const state = useGTDStore.getState();
    const adhdMode = state.settings?.adhdMode ?? false;

    const hapticType = hapticEventMap[event_name];
    if (hapticType) {
        if (event_name === 'level_up' && !adhdMode) {
            // Double success for level up
            triggerHaptic(hapticType, adhdMode);
            setTimeout(() => triggerHaptic(hapticType, adhdMode), 200);
        } else {
            triggerHaptic(hapticType, adhdMode);
        }
    }
}
