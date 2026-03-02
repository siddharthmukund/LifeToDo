'use client';
/**
 * src/a11y/useAnnounce.ts
 * React hook that exposes the announcer singleton with a stable API
 * and automatic cleanup on unmount.
 *
 * Usage:
 *   const { announce, announceError } = useAnnounce();
 *   announce('Task saved');
 *   announceError('Could not save task');
 */

import { useCallback } from 'react';
import { announcer } from './announcer';
import type { Politeness } from './types';

export interface UseAnnounceReturn {
    /**
     * Announce a polite notification (default) or assertive alert.
     *
     * @param text       The text to announce.
     * @param politeness 'polite' (default) or 'assertive'.
     * @param force      Re-announce even if identical to the previous message.
     */
    announce: (text: string, politeness?: Politeness, force?: boolean) => void;

    /** Shorthand for urgent / error announcements (assertive channel). */
    announceError: (text: string) => void;

    /**
     * Announce the result of a user action (e.g. "Task completed", "Item deleted").
     * Fires on the next tick to avoid racing with DOM mutations.
     */
    announceAction: (text: string) => void;

    /** Clear all pending announcements immediately. */
    clear: () => void;
}

export function useAnnounce(): UseAnnounceReturn {
    const announce = useCallback(
        (text: string, politeness: Politeness = 'polite', force = false) => {
            announcer.announce(text, politeness, force);
        },
        [],
    );

    const announceError = useCallback((text: string) => {
        announcer.announceError(text);
    }, []);

    const announceAction = useCallback((text: string) => {
        announcer.announceAction(text);
    }, []);

    const clear = useCallback(() => {
        announcer.clear();
    }, []);

    return { announce, announceError, announceAction, clear };
}
