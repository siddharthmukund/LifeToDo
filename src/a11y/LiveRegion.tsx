'use client';
/**
 * src/a11y/LiveRegion.tsx
 * Renders the two hidden aria-live containers that power the announcer singleton.
 *
 * Mount this component once, inside <body>, before any interactive content.
 * The announcer.ts singleton manages the textContent of these elements.
 *
 * IMPORTANT: Do NOT render this component more than once — duplicate live
 * regions cause screen readers to announce messages multiple times.
 *
 * Usage (in app/layout.tsx):
 *   <LiveRegion />
 */

import { useEffect } from 'react';
import { A11Y_CONFIG } from './a11yConfig';

/**
 * Shared style object for visually-hidden live regions.
 * We use inline styles instead of Tailwind so the element is hidden
 * before any CSS loads — prevents a flash of visible text.
 */
const HIDDEN_STYLE: React.CSSProperties = {
    position:   'absolute',
    width:      '1px',
    height:     '1px',
    padding:    '0',
    margin:     '-1px',
    overflow:   'hidden',
    clip:       'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border:     '0',
};

export function LiveRegion() {
    // On first mount, ensure the announcer singleton's DOM nodes exist.
    // The announcer itself also creates them lazily, but having them in the
    // React tree lets Next.js include them in the initial SSR payload.
    useEffect(() => {
        // Nothing to do — the DOM nodes are rendered below via JSX.
        // This effect is a placeholder for any future initialization.
    }, []);

    return (
        <>
            {/* Polite region: task completions, saves, navigation, etc. */}
            <div
                id={A11Y_CONFIG.politeRegionId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-relevant="additions text"
                style={HIDDEN_STYLE}
            />
            {/* Assertive region: validation errors, urgent alerts */}
            <div
                id={A11Y_CONFIG.assertiveRegionId}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                aria-relevant="additions text"
                style={HIDDEN_STYLE}
            />
        </>
    );
}
