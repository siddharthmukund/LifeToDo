'use client';
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { syncStatusBar } from './statusBarSync';
import { hideSplashScreen } from './splashScreen';
import { initKeyboardHandling } from './keyboardHandler';
import { useBiometric } from '../biometric';

/**
 * Root hook that manages UI synchronization between React and Native boundaries.
 */
export function useNativePolish() {
    const { isDark } = useTheme();
    // Using the biometric hook to avoid hiding the splash screen if we need to show the Face ID prompt immediately
    const { isAvailable, isLocked } = useBiometric();

    // Sync status bar theme
    useEffect(() => {
        syncStatusBar(isDark);
    }, [isDark]);

    // Hide splash screen after successful hydration/boot
    useEffect(() => {
        // If the app is locked, FaceID handles hiding the screen visually through its own overlay. 
        // We can delay hiding the splash screen by a few ms to ensure smooth handover
        const timeout = setTimeout(() => {
            hideSplashScreen();
        }, 100);

        return () => clearTimeout(timeout);
    }, [isLocked]);

    // Init Keyboard handling
    useEffect(() => {
        initKeyboardHandling(
            (height) => {
                // E.g., Inject a CSS variable for the keyboard height
                document.documentElement.style.setProperty('--keyboard-height', `${height}px`);
            },
            () => {
                document.documentElement.style.removeProperty('--keyboard-height');
            }
        );
    }, []);
}
