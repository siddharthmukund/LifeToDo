'use client';
/**
 * src/a11y/useReducedMotion.ts
 * Hook that resolves the user's combined motion preference.
 *
 * Two independent axes:
 *   1. OS-level:  `prefers-reduced-motion: reduce` media query (vestibular safety)
 *   2. App-level: ADHD Mode setting in the GTD store (cognitive load)
 *
 * When either is true, `shouldReduceMotion` is true and all Framer Motion
 * components should use the `REDUCED_MOTION_TRANSITION` instead of springs.
 *
 * Usage:
 *   const { shouldReduceMotion, prefersReducedMotion } = useReducedMotion();
 *   <motion.div animate={...} transition={shouldReduceMotion ? REDUCED : spring} />
 */

import { useState, useEffect } from 'react';
import { useGTDStore } from '@/store/gtdStore';
import { A11Y_CONFIG } from './a11yConfig';
import type { MotionPreference } from './types';

/** Drop-in Framer Motion transition for reduced-motion contexts. */
export const REDUCED_MOTION_TRANSITION = A11Y_CONFIG.reducedMotionTransition;

/** Framer Motion `variants` helper: returns the "visible" variant key immediately. */
export const REDUCED_MOTION_VARIANTS = {
    hidden:  { opacity: 1 },
    visible: { opacity: 1 },
} as const;

function getMediaPreference(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion(): MotionPreference {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
        getMediaPreference(),
    );
    const settings = useGTDStore((s) => s.settings);
    const adhdModeEnabled = Boolean((settings as unknown as Record<string, unknown>)?.adhdMode);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handler = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        // Modern API
        if (mq.addEventListener) {
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
        // Legacy Safari
        mq.addListener(handler);
        return () => mq.removeListener(handler);
    }, []);

    return {
        prefersReducedMotion,
        adhdModeEnabled,
        shouldReduceMotion: prefersReducedMotion || adhdModeEnabled,
    };
}

/**
 * Lightweight SSR-safe version that skips the store subscription.
 * Use inside server components or layout-level code where the store
 * is not available.
 */
export function useSystemReducedMotion(): boolean {
    const [reduced, setReduced] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);

        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        if (mq.addEventListener) {
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
        mq.addListener(handler);
        return () => mq.removeListener(handler);
    }, []);

    return reduced;
}
