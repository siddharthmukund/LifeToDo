/**
 * src/a11y/motion/motionConfig.ts
 * Framer Motion preset transitions for reduced-motion contexts.
 *
 * Import these constants instead of inline transition objects to ensure
 * every animation site uses the same canonical fallbacks.
 *
 * Usage:
 *   import { useReducedMotion } from '@/a11y'
 *   import { SPRING, FADE, SLIDE_UP } from '@/a11y/motion/motionConfig'
 *
 *   const { shouldReduceMotion } = useReducedMotion()
 *   <motion.div transition={shouldReduceMotion ? INSTANT : SPRING} />
 */

import type { Transition, Variants } from 'framer-motion'

// ─── Transitions ──────────────────────────────────────────────────────────────

/** Standard spring — used for modal sheets, overlays, list items. */
export const SPRING: Transition = {
    type: 'spring',
    damping: 28,
    stiffness: 280,
}

/** Gentle spring for larger elements (full-screen panels, drawers). */
export const SPRING_SLOW: Transition = {
    type: 'spring',
    damping: 32,
    stiffness: 200,
}

/** Snappy spring for small UI feedback (chips, toggles, badges). */
export const SPRING_FAST: Transition = {
    type: 'spring',
    stiffness: 500,
    damping: 40,
}

/** Ease-out fade — used for status overlays. */
export const FADE: Transition = {
    duration: 0.2,
    ease: 'easeOut',
}

/** Standard ease-in-out — used for progress fills, colour transitions. */
export const EASE: Transition = {
    duration: 0.35,
    ease: 'easeInOut',
}

/**
 * Instant transition — effectively no animation.
 * Use this as the `transition` prop whenever `shouldReduceMotion` is true.
 * A non-zero duration (0.001s) avoids Framer Motion internal edge cases.
 */
export const INSTANT: Transition = {
    duration: 0.001,
    ease: 'linear',
}

// ─── Variant helpers ──────────────────────────────────────────────────────────

/**
 * Slide-up entry / fade exit — the default bottom-sheet pattern.
 * When reduced motion is on, use FADE_VARIANTS instead.
 */
export const SLIDE_UP_VARIANTS: Variants = {
    hidden:  { y: '100%', opacity: 0.9 },
    visible: { y: 0,      opacity: 1   },
    exit:    { y: '100%', opacity: 0   },
}

/**
 * Simple opacity fade — safe for vestibular-sensitive users.
 * Use as the reduced-motion replacement for any slide / scale variant.
 */
export const FADE_VARIANTS: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
    exit:    { opacity: 0 },
}

/**
 * No-op variants — content is always fully visible; use when
 * `shouldReduceMotion` is true and even a fade feels excessive.
 */
export const STATIC_VARIANTS: Variants = {
    hidden:  { opacity: 1 },
    visible: { opacity: 1 },
    exit:    { opacity: 1 },
}

// ─── Map: animation name → { full, reduced } ─────────────────────────────────

/**
 * Animation catalogue — maps semantic names to their full and
 * reduced-motion variants/transitions.
 *
 * Components look up their animation by name so changing the fallback
 * here automatically updates every usage.
 */
export const ANIMATION_MAP = {
    modalSheet: {
        variants:   SLIDE_UP_VARIANTS,
        transition: SPRING,
        reducedVariants:   FADE_VARIANTS,
        reducedTransition: FADE,
    },
    overlay: {
        variants:   FADE_VARIANTS,
        transition: FADE,
        reducedVariants:   FADE_VARIANTS,
        reducedTransition: INSTANT,
    },
    listItem: {
        variants:   SLIDE_UP_VARIANTS,
        transition: SPRING_SLOW,
        reducedVariants:   FADE_VARIANTS,
        reducedTransition: INSTANT,
    },
    chip: {
        variants:   FADE_VARIANTS,
        transition: SPRING_FAST,
        reducedVariants:   STATIC_VARIANTS,
        reducedTransition: INSTANT,
    },
    progressFill: {
        variants:   FADE_VARIANTS,
        transition: EASE,
        reducedVariants:   STATIC_VARIANTS,
        reducedTransition: INSTANT,
    },
} as const satisfies Record<string, {
    variants: Variants
    transition: Transition
    reducedVariants: Variants
    reducedTransition: Transition
}>

export type AnimationName = keyof typeof ANIMATION_MAP
