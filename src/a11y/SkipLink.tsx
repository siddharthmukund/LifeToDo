'use client';
/**
 * src/a11y/SkipLink.tsx
 * Accessible skip-navigation link component.
 *
 * Renders a visually hidden "Skip to main content" link that becomes
 * visible on keyboard focus.  Activating it scrolls the viewport to
 * the target element and transfers keyboard focus to it.
 *
 * Rendered at the very top of <body> in app/layout.tsx so it is the
 * first Tab stop on every page.
 *
 * Usage (in layout.tsx):
 *   <SkipLink />
 *   — or —
 *   <SkipLink targets={[
 *     { targetId: 'main-content', label: 'Skip to main content' },
 *     { targetId: 'bottom-nav',   label: 'Skip to navigation'   },
 *   ]} />
 */

import { useCallback } from 'react';
import { A11Y_CONFIG } from './a11yConfig';
import type { SkipTarget } from './types';

interface SkipLinkProps {
    /** Override the default targets from a11yConfig. */
    targets?: SkipTarget[];
}

export function SkipLink({ targets }: SkipLinkProps) {
    const links = targets ?? A11Y_CONFIG.skipTargets;

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
            e.preventDefault();
            const el = document.getElementById(targetId);
            if (!el) return;

            // Make the element programmatically focusable if it isn't already
            if (el.tabIndex < 0) {
                el.tabIndex = -1;
            }

            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            el.focus({ preventScroll: false });
        },
        [],
    );

    return (
        <>
            {links.map(({ targetId, label }) => (
                <a
                    key={targetId}
                    href={`#${targetId}`}
                    onClick={(e) => handleClick(e, targetId)}
                    suppressHydrationWarning
                    className={[
                        // Named class — used by forced-colors CSS in globals.css
                        'skip-link',
                        // Visually hidden until focused
                        'sr-only focus:not-sr-only',
                        // Visible styles when focused
                        'focus:fixed focus:left-4 focus:top-4 focus:z-[9999]',
                        'focus:px-4 focus:py-2',
                        'focus:rounded-xl',
                        'focus:bg-status-ok focus:text-on-brand',
                        'focus:font-semibold focus:text-sm',
                        'focus:shadow-lg focus:shadow-glow-success',
                        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-status-ok',
                        'transition-none', // no animation on the skip link itself
                    ].join(' ')}
                >
                    {label}
                </a>
            ))}
        </>
    );
}
