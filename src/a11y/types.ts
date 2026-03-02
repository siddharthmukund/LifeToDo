/**
 * src/a11y/types.ts
 * Core type definitions for the Life To Do accessibility system.
 *
 * These types are consumed by every module in src/a11y/ and by
 * any component that opts in to the accessibility infrastructure.
 */

// ─── Announcer ────────────────────────────────────────────────────────────────

/** Maps to the aria-live attribute values supported by ARIA 1.2. */
export type Politeness = 'polite' | 'assertive' | 'off';

/** A single message queued for live-region announcement. */
export interface AnnouncerMessage {
    /** The text to read aloud. An empty string clears the region. */
    text: string;
    /** How urgently the SR should interrupt. Defaults to "polite". */
    politeness?: Politeness;
    /** If true, identical successive messages are re-announced. */
    force?: boolean;
}

// ─── Focus Trap ───────────────────────────────────────────────────────────────

/** Options accepted by the FocusTrap component and useFocusManagement hook. */
export interface FocusTrapOptions {
    /** Whether the trap is currently active. */
    active: boolean;
    /**
     * Element to focus when the trap activates.
     * Defaults to the first focusable descendant.
     */
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    /**
     * Element to return focus to when the trap deactivates.
     * Defaults to `document.activeElement` at mount time.
     */
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Called when the user presses Escape inside the trap. */
    onEscape?: () => void;
}

// ─── Motion ───────────────────────────────────────────────────────────────────

/**
 * Resolved motion preference combining the OS-level
 * `prefers-reduced-motion` media query with the app's
 * ADHD Mode setting (independent cognitive-load axis).
 */
export interface MotionPreference {
    /** True when the OS reports `prefers-reduced-motion: reduce`. */
    prefersReducedMotion: boolean;
    /** True when the user has enabled ADHD Mode inside the app. */
    adhdModeEnabled: boolean;
    /**
     * True when animations should be fully suppressed.
     * Equals `prefersReducedMotion || adhdModeEnabled`.
     */
    shouldReduceMotion: boolean;
}

// ─── Keyboard Navigation ──────────────────────────────────────────────────────

/** A single keyboard shortcut registered with the global handler. */
export interface KeyboardShortcut {
    /** Unique identifier so shortcuts can be unregistered later. */
    id: string;
    /** Human-readable description shown in the keyboard shortcut help dialog. */
    label: string;
    /**
     * The key to match (e.g. "k", "ArrowDown", "Enter").
     * Case-insensitive for letter keys.
     */
    key: string;
    /** Require the Ctrl key (Cmd on macOS). */
    ctrlKey?: boolean;
    /** Require the Alt / Option key. */
    altKey?: boolean;
    /** Require the Shift key. */
    shiftKey?: boolean;
    /** Require the Meta (Cmd / Windows) key. */
    metaKey?: boolean;
    /**
     * When true the shortcut fires even if focus is inside a text
     * input, textarea, or contentEditable element. Defaults to false.
     */
    allowInInput?: boolean;
    /** The callback to invoke when the shortcut fires. */
    handler: (e: KeyboardEvent) => void;
}

// ─── Touch Target ─────────────────────────────────────────────────────────────

/** Severity levels used by the dev-only touch-target validator. */
export type TouchTargetSeverity = 'pass' | 'warn' | 'fail';

/** Result of a single touch-target measurement. */
export interface TouchTargetResult {
    /** The element that was measured. */
    element: HTMLElement;
    width: number;
    height: number;
    severity: TouchTargetSeverity;
    /** Human-readable message for the console. */
    message: string;
}

// ─── Audit Reporting (dev-only) ───────────────────────────────────────────────

/** WCAG 2.2 conformance level. */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/** Severity mirror from the Gate 0 audit. */
export type A11yViolationSeverity = 'critical' | 'high' | 'medium' | 'low';

/** A single recorded WCAG violation (used in test helpers). */
export interface A11yViolation {
    id: string;
    description: string;
    severity: A11yViolationSeverity;
    wcagCriteria: string;
    level: WCAGLevel;
    /** File path(s) where the violation was detected. */
    locations: string[];
}

// ─── Route Announcement ───────────────────────────────────────────────────────

/** Payload passed to the announcer when the route changes. */
export interface RouteAnnouncement {
    /** The new pathname (from `usePathname()`). */
    pathname: string;
    /** Optional override for the announcement text. */
    customLabel?: string;
}

// ─── Skip Link ────────────────────────────────────────────────────────────────

/** A single skip-nav target. */
export interface SkipTarget {
    /** The element `id` to scroll / focus on activation. */
    targetId: string;
    /** Label displayed inside the skip link button. */
    label: string;
}
