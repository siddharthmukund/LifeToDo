'use client';
/**
 * src/a11y/useFocusManagement.ts
 * Hook that implements a keyboard focus trap for dialogs, drawers, and menus.
 *
 * Technique:
 *  - When `active` becomes true, saves the current activeElement and moves
 *    focus to the container (or the element pointed to by `initialFocusRef`).
 *  - Intercepts Tab / Shift+Tab to cycle only among focusable descendants.
 *  - When `active` becomes false, restores focus to the saved element (or the
 *    element pointed to by `returnFocusRef`).
 *  - Listens for Escape and calls `onEscape` if provided.
 *
 * Usage:
 *   const trapRef = useFocusManagement({ active: isOpen, onEscape: closeModal });
 *   <div ref={trapRef}>...</div>
 */

import { useEffect, useRef, useCallback } from 'react';
import { A11Y_CONFIG } from './a11yConfig';
import type { FocusTrapOptions } from './types';

const FOCUSABLE = A11Y_CONFIG.focusableSelector;

function getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.closest('[inert]') && el.tabIndex !== -1,
    );
}

export function useFocusManagement(options: FocusTrapOptions) {
    const { active, initialFocusRef, returnFocusRef, onEscape } = options;
    const containerRef = useRef<HTMLElement | null>(null);
    const savedFocusRef = useRef<Element | null>(null);

    // Save focus on activation
    useEffect(() => {
        if (!active) return;

        // Save current focus so we can restore it
        savedFocusRef.current = document.activeElement;

        const container = containerRef.current;
        if (!container) return;

        // Move focus to the designated initial element, or first focusable
        const target =
            initialFocusRef?.current ??
            getFocusable(container)[0] ??
            container;

        // Defer so the browser finishes painting the element before focusing
        requestAnimationFrame(() => {
            (target as HTMLElement).focus?.({ preventScroll: false });
        });
    }, [active, initialFocusRef]);

    // Restore focus on deactivation
    useEffect(() => {
        if (active) return;
        const toRestore =
            returnFocusRef?.current ??
            (savedFocusRef.current as HTMLElement | null);
        if (toRestore && typeof toRestore.focus === 'function') {
            requestAnimationFrame(() => {
                (toRestore as HTMLElement).focus({ preventScroll: true });
            });
        }
    }, [active, returnFocusRef]);

    // Keyboard handler: Tab cycling + Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!active) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                onEscape?.();
                return;
            }

            if (e.key !== 'Tab') return;

            const container = containerRef.current;
            if (!container) return;

            const focusable = getFocusable(container);
            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }

            const first = focusable[0];
            const last  = focusable[focusable.length - 1];

            if (e.shiftKey) {
                // Shift+Tab: if we're at the first element, wrap to last
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab: if we're at the last element, wrap to first
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        },
        [active, onEscape],
    );

    // Attach / detach the keydown listener
    useEffect(() => {
        if (!active) return;
        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [active, handleKeyDown]);

    /**
     * Ref callback that attaches the container element.
     * Spread onto the outermost element of the trapped region:
     *   <div ref={trapRef}>...</div>
     */
    const trapRef = useCallback((node: HTMLElement | null) => {
        containerRef.current = node;
    }, []);

    return trapRef;
}
