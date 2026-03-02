'use client';
import { useState, useEffect, useCallback } from 'react';
import { checkBiometricAvailability, authenticateBiometric, BiometricAvailability } from './biometricService';
import { useGTDStore } from '@/store/gtdStore';

// In reality, App.addListener('appStateChange') logic goes here to track background timeouts
export function useBiometric() {
    const [availability, setAvailability] = useState<BiometricAvailability>({ available: false, type: 'none' });
    const [isLocked, setIsLocked] = useState(false);
    const { settings } = useGTDStore();

    useEffect(() => {
        checkBiometricAvailability().then(setAvailability);
    }, []);

    const authenticate = useCallback(async (reason: string): Promise<boolean> => {
        if (!availability.available) return true; // Fail open if not available
        const success = await authenticateBiometric(reason);
        if (success) {
            setIsLocked(false);
        }
        return success;
    }, [availability.available]);

    // Exposing a method to manually lock the app (e.g. from appStateChange background hook)
    const lockApp = useCallback(() => {
        if ((settings as any)?.biometricLockEnabled) {
            setIsLocked(true);
        }
    }, [settings]);

    return {
        isAvailable: availability.available,
        biometryType: availability.type,
        isLocked,
        authenticate,
        lockApp,
    };
}
