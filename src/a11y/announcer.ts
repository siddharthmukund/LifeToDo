/**
 * src/a11y/announcer.ts
 * Singleton aria-live announcement system.
 *
 * Usage:
 *   announcer.announce('Task saved');
 *   announcer.announce('Error: could not save', 'assertive');
 *   announcer.announceRoute('/dashboard');
 *
 * How it works:
 *   Two hidden <div> elements (polite + assertive) are inserted into <body>
 *   once on first use.  To trigger a re-read of the same message we clear the
 *   div, wait one tick, then set the new text.  This is the most reliable
 *   cross-SR technique (works with NVDA, JAWS, VoiceOver, TalkBack).
 */

import { A11Y_CONFIG } from './a11yConfig';
import type { AnnouncerMessage, Politeness, RouteAnnouncement } from './types';

// ─── Route label map ──────────────────────────────────────────────────────────
// Maps pathname prefixes to human-readable route names.
const ROUTE_LABELS: Record<string, string> = {
    '/':              'Dashboard',
    '/capture':       'Capture',
    '/today':         'Today',
    '/projects':      'Projects',
    '/settings':      'Settings',
    '/settings/upgrade': 'Upgrade to Pro',
    '/focus':         'Focus Mode',
    '/review':        'Weekly Review',
    '/someday':       'Someday / Maybe',
    '/logbook':       'Logbook',
    '/leaderboard':   'Leaderboard',
    '/ai-coach':      'AI Coach',
};

function resolveRouteLabel(pathname: string): string {
    // Exact match first
    if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
    // Prefix match (longest wins)
    const sorted = Object.keys(ROUTE_LABELS).sort((a, b) => b.length - a.length);
    for (const prefix of sorted) {
        if (pathname.startsWith(prefix) && prefix !== '/') {
            return ROUTE_LABELS[prefix];
        }
    }
    // Fallback: prettify the last path segment
    const segment = pathname.split('/').filter(Boolean).pop() ?? 'page';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function createRegion(id: string, politeness: Politeness): HTMLDivElement {
    const el = document.createElement('div');
    el.id = id;
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.setAttribute('aria-relevant', 'additions text');
    // Visually hidden but announced by screen readers
    Object.assign(el.style, {
        position:   'absolute',
        width:      '1px',
        height:     '1px',
        padding:    '0',
        margin:     '-1px',
        overflow:   'hidden',
        clip:       'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border:     '0',
    });
    return el;
}

function getOrCreateRegion(id: string, politeness: Politeness): HTMLDivElement {
    let el = document.getElementById(id) as HTMLDivElement | null;
    if (!el) {
        el = createRegion(id, politeness);
        document.body.appendChild(el);
    }
    return el;
}

// ─── Announcer singleton ──────────────────────────────────────────────────────

let _clearTimer: ReturnType<typeof setTimeout> | null = null;
let _lastMessage = '';

function _inject(text: string, politeness: Politeness): void {
    if (typeof document === 'undefined') return; // SSR guard

    const id = politeness === 'assertive'
        ? A11Y_CONFIG.assertiveRegionId
        : A11Y_CONFIG.politeRegionId;

    const region = getOrCreateRegion(id, politeness);

    // Clear any pending auto-clear
    if (_clearTimer) {
        clearTimeout(_clearTimer);
        _clearTimer = null;
    }

    // Step 1: clear to allow re-announcement of identical text
    region.textContent = '';

    // Step 2: inject after a brief DOM paint
    setTimeout(() => {
        region.textContent = text;

        // Step 3: auto-clear so stale messages aren't re-read
        _clearTimer = setTimeout(() => {
            region.textContent = '';
            _lastMessage = '';
            _clearTimer = null;
        }, A11Y_CONFIG.announcerClearDelay);
    }, A11Y_CONFIG.announcerInjectionDelay);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const announcer = {
    /**
     * Announce a message to screen reader users.
     *
     * @param text       The message to announce.
     * @param politeness 'polite' (default) or 'assertive' for urgent alerts.
     * @param force      When true, re-announces even if the text is identical
     *                   to the previous message.
     */
    announce(
        text: string,
        politeness: Politeness = 'polite',
        force = false,
    ): void {
        if (!text) return;
        if (text === _lastMessage && !force) return;
        _lastMessage = text;
        _inject(text, politeness);
    },

    /**
     * Shorthand for urgent announcements (e.g. validation errors).
     */
    announceAssertive(text: string, force = false): void {
        this.announce(text, 'assertive', force);
    },

    /**
     * Announce a route change.
     * Called from ClientLayout whenever `usePathname()` changes.
     */
    announceRoute({ pathname, customLabel }: RouteAnnouncement): void {
        const label = customLabel ?? resolveRouteLabel(pathname);
        this.announce(
            `${A11Y_CONFIG.routeAnnouncementPrefix} ${label}`,
            'polite',
            true, // always announce navigations even if the text is the same
        );
    },

    /**
     * Queue an announcement for a completed action (e.g. task ticked off).
     * Delayed by one tick so it fires after any simultaneous DOM mutations.
     */
    announceAction(text: string): void {
        setTimeout(() => this.announce(text, 'polite'), 0);
    },

    /**
     * Announce an error message using the assertive channel.
     */
    announceError(text: string): void {
        this.announce(text, 'assertive', true);
    },

    /**
     * Process a generic AnnouncerMessage object (useful when passing messages
     * through React state / context).
     */
    send({ text, politeness = 'polite', force = false }: AnnouncerMessage): void {
        this.announce(text, politeness, force);
    },

    /**
     * Immediately clear both live regions.
     */
    clear(): void {
        if (typeof document === 'undefined') return;
        const polite    = document.getElementById(A11Y_CONFIG.politeRegionId);
        const assertive = document.getElementById(A11Y_CONFIG.assertiveRegionId);
        if (polite)    polite.textContent    = '';
        if (assertive) assertive.textContent = '';
        _lastMessage = '';
        if (_clearTimer) { clearTimeout(_clearTimer); _clearTimer = null; }
    },
} as const;
