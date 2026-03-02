'use client';
/**
 * useKeyboard.ts
 * Manages the --keyboard-height CSS variable when the native keyboard
 * slides in/out. Mount once in ClientLayout.
 */

import { useEffect } from 'react';
import { initKeyboardHandling } from '../polish/keyboardHandler';

export function useKeyboard(): void {
    useEffect(() => {
        void initKeyboardHandling(
            (height) => {
                document.documentElement.style.setProperty('--keyboard-height', `${height}px`);
            },
            () => {
                document.documentElement.style.removeProperty('--keyboard-height');
            },
        );
    }, []);
}
