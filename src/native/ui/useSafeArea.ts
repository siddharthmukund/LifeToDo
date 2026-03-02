'use client';
/**
 * useSafeArea.ts
 * Applies safe-area CSS variables on mount and re-applies on orientation change.
 * Mount once in ClientLayout.
 */

import { useEffect } from 'react';
import { watchSafeArea } from './safeAreaService';

export function useSafeArea(): void {
    useEffect(() => {
        return watchSafeArea();
    }, []);
}
