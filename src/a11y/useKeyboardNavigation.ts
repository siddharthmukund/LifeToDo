'use client';
/**
 * src/a11y/useKeyboardNavigation.ts
 * Global keyboard shortcut registry hook.
 *
 * Shortcuts are registered per-component via `useKeyboardNavigation` and
 * automatically unregistered on unmount.  The registry is module-level so
 * that multiple hook instances share the same listener.
 *
 * Usage:
 *   useKeyboardNavigation([
 *     {
 *       id:    'capture',
 *       label: 'Open Capture',
 *       key:   'k',
 *       ctrlKey: true,
 *       handler: () => router.push('/capture'),
 *     },
 *   ]);
 */

import { useEffect } from 'react';
import type { KeyboardShortcut } from './types';

// ─── Module-level registry ────────────────────────────────────────────────────

const _registry = new Map<string, KeyboardShortcut>();
let _listenerAttached = false;

/** Whether the element currently focused should capture keyboard input. */
function isInputTarget(el: Element | null): boolean {
    if (!el) return false;
    const tag = (el as HTMLElement).tagName.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return true;
    if ((el as HTMLElement).isContentEditable) return true;
    return false;
}

function globalKeyHandler(e: KeyboardEvent): void {
    const focused = document.activeElement;

    for (const shortcut of _registry.values()) {
        // Skip text-input elements unless the shortcut opts in
        if (!shortcut.allowInInput && isInputTarget(focused)) continue;

        const keyMatch   = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch  = !shortcut.ctrlKey  || e.ctrlKey  || e.metaKey;
        const altMatch   = !shortcut.altKey   || e.altKey;
        const shiftMatch = !shortcut.shiftKey || e.shiftKey;
        const metaMatch  = !shortcut.metaKey  || e.metaKey;

        // Require explicit modifier keys when specified
        if (shortcut.ctrlKey  && !(e.ctrlKey  || e.metaKey)) continue;
        if (shortcut.altKey   && !e.altKey)   continue;
        if (shortcut.shiftKey && !e.shiftKey) continue;
        if (shortcut.metaKey  && !e.metaKey)  continue;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
            shortcut.handler(e);
            // Don't break: multiple shortcuts may share the same key combo (unlikely)
        }
    }
}

function attachGlobalListener(): void {
    if (_listenerAttached || typeof window === 'undefined') return;
    window.addEventListener('keydown', globalKeyHandler, true);
    _listenerAttached = true;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Register a list of keyboard shortcuts for the lifetime of the calling component.
 * All shortcuts are removed when the component unmounts.
 *
 * @param shortcuts Array of `KeyboardShortcut` objects.
 */
export function useKeyboardNavigation(shortcuts: KeyboardShortcut[]): void {
    useEffect(() => {
        if (shortcuts.length === 0) return;

        attachGlobalListener();

        // Register shortcuts
        for (const shortcut of shortcuts) {
            _registry.set(shortcut.id, shortcut);
        }

        // Cleanup on unmount or when shortcuts change
        return () => {
            for (const shortcut of shortcuts) {
                _registry.delete(shortcut.id);
            }
        };
    }, [shortcuts]);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Returns all currently registered shortcuts (e.g. for a help dialog). */
export function getRegisteredShortcuts(): KeyboardShortcut[] {
    return Array.from(_registry.values());
}

/** Programmatically register a shortcut outside of a React component. */
export function registerShortcut(shortcut: KeyboardShortcut): () => void {
    attachGlobalListener();
    _registry.set(shortcut.id, shortcut);
    return () => _registry.delete(shortcut.id);
}
