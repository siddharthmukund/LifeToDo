/**
 * src/a11y/a11yConfig.ts
 * Central configuration for the Life To Do accessibility system.
 *
 * Change values here to adjust behaviour across every a11y module;
 * nothing in this file should import from the rest of the codebase
 * so it can be imported safely during SSR.
 */

import type { SkipTarget } from './types';

// ─── Touch Targets ────────────────────────────────────────────────────────────

export const A11Y_CONFIG = {
    /**
     * WCAG 2.5.8 (Level AA) — minimum touch-target size in CSS pixels.
     * Any interactive element smaller than this triggers a validator warning.
     */
    minTouchTarget: 44,

    /**
     * Hard minimum per WCAG 2.5.8 (44 × 44 is recommended; 24 × 24 is the
     * absolute floor below which the validator reports a failure).
     */
    absoluteMinTouchTarget: 24,

    // ─── Announcer ──────────────────────────────────────────────────────────

    /**
     * Milliseconds to keep an aria-live message in the DOM before clearing.
     * Clearing after this delay prevents stale messages from being repeated
     * when a screen reader refreshes the virtual buffer.
     */
    announcerClearDelay: 1500,

    /**
     * Milliseconds to wait before injecting the next message when the
     * announcer clears a previous one. This gap ensures some SRs (NVDA,
     * older VoiceOver) pick up the new text as a fresh change.
     */
    announcerInjectionDelay: 100,

    // ─── Route Announcements ────────────────────────────────────────────────

    /**
     * Prefix prepended to every route-change announcement.
     * e.g. "Navigated to Dashboard"
     */
    routeAnnouncementPrefix: 'Navigated to',

    // ─── Focus Management ───────────────────────────────────────────────────

    /**
     * CSS selector used to collect focusable descendants for focus-trap
     * tab order cycling. Intentionally conservative — excludes elements
     * with tabindex="-1" so they can be programmatically focusable but
     * are not part of the keyboard ring.
     */
    focusableSelector: [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        'details > summary',
        '[contenteditable]:not([contenteditable="false"])',
    ].join(', '),

    // ─── Motion ─────────────────────────────────────────────────────────────

    /**
     * Duration used for "instant" animations when reduced-motion is preferred.
     * A non-zero value (e.g. 0.001) satisfies Framer Motion's internal
     * optimisations; effectively imperceptible.
     */
    reducedMotionDuration: 0.001,

    /**
     * Framer Motion `transition` override applied when reduced motion is on.
     * Import `REDUCED_MOTION_TRANSITION` for use in motion.* props.
     */
    reducedMotionTransition: { duration: 0.001, ease: 'linear' as const },

    // ─── Skip Navigation ────────────────────────────────────────────────────

    /**
     * Skip-link targets rendered in app/layout.tsx.
     * The first entry is focussed first when Tab is pressed on a fresh page.
     */
    skipTargets: [
        { targetId: 'main-content', label: 'Skip to main content' },
        { targetId: 'bottom-nav',   label: 'Skip to navigation'   },
    ] satisfies SkipTarget[],

    // ─── Landmark IDs ───────────────────────────────────────────────────────

    /** id applied to the <main> element so skip links can target it. */
    mainContentId: 'main-content',

    /** id applied to the bottom navigation landmark. */
    bottomNavId: 'bottom-nav',

    // ─── Live Region IDs ────────────────────────────────────────────────────

    /** id of the polite aria-live region injected into <body>. */
    politeRegionId: 'a11y-live-polite',

    /** id of the assertive aria-live region injected into <body>. */
    assertiveRegionId: 'a11y-live-assertive',
} as const;

export type A11yConfig = typeof A11Y_CONFIG;
