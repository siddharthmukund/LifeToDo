'use client';
import { useCallback } from 'react';
import { triggerHaptic, HapticType } from './hapticService';
import { useGTDStore } from '@/store/gtdStore';

/**
 * Hook for imperative, manual haptic triggers inside components.
 */
export function useHaptics() {
    const { settings } = useGTDStore();
    const adhdMode = settings?.adhdMode ?? false;

    const trigger = useCallback((type: HapticType) => {
        // If the user theoretically had a master haptics toggle, we'd check it here
        triggerHaptic(type, adhdMode);
    }, [adhdMode]);

    return { trigger };
}
