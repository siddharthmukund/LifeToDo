'use client';
/**
 * src/a11y/motion/SafeAnimation.tsx
 * Wrapper component that adapts Framer Motion animations based on the
 * user's reduced-motion preference.
 *
 * When `shouldReduceMotion` is true (OS prefers-reduced-motion OR ADHD Mode):
 *   - Replaces slide / scale variants with fade-only alternatives.
 *   - Uses INSTANT transition (0.001s) so the animation is imperceptible.
 *
 * Usage (simple fade replacement):
 *   <SafeAnimation>
 *     <motion.div .../>   ← receives augmented props automatically
 *   </SafeAnimation>
 *
 * Usage (named animation from catalogue):
 *   <SafeAnimation animation="modalSheet">
 *     <motion.div/>
 *   </SafeAnimation>
 *
 * Usage (manual override):
 *   <SafeAnimation
 *     variants={MY_VARIANTS}
 *     reducedVariants={FADE_VARIANTS}
 *     transition={SPRING}
 *     reducedTransition={INSTANT}
 *   >
 *     <motion.div/>
 *   </SafeAnimation>
 */

import { cloneElement, isValidElement, type ReactElement } from 'react';
import type { Variants, Transition } from 'framer-motion';
import { useReducedMotion } from '../useReducedMotion';
import {
    ANIMATION_MAP,
    FADE_VARIANTS,
    INSTANT,
    type AnimationName,
} from './motionConfig';

interface SafeAnimationProps {
    children: ReactElement;
    /** Named preset from ANIMATION_MAP. Overrides manual variant/transition props. */
    animation?: AnimationName;
    /** Full-motion variants (ignored when reduced). */
    variants?: Variants;
    /** Fallback variants used when reduced motion is active. Defaults to FADE_VARIANTS. */
    reducedVariants?: Variants;
    /** Full-motion transition. */
    transition?: Transition;
    /** Fallback transition used when reduced motion is active. Defaults to INSTANT. */
    reducedTransition?: Transition;
}

export function SafeAnimation({
    children,
    animation,
    variants,
    reducedVariants = FADE_VARIANTS,
    transition,
    reducedTransition = INSTANT,
}: SafeAnimationProps) {
    const { shouldReduceMotion } = useReducedMotion();

    if (!isValidElement(children)) return children;

    // Resolve from named preset if provided
    const preset = animation ? ANIMATION_MAP[animation] : null;

    const resolvedVariants    = preset?.variants    ?? variants;
    const resolvedReduced     = preset?.reducedVariants    ?? reducedVariants;
    const resolvedTransition  = preset?.transition  ?? transition;
    const resolvedReducedT    = preset?.reducedTransition  ?? reducedTransition;

    // Clone and inject the appropriate props
    return cloneElement(children, {
        variants:   shouldReduceMotion ? resolvedReduced    : resolvedVariants,
        transition: shouldReduceMotion ? resolvedReducedT   : resolvedTransition,
    } as Record<string, unknown>);
}
