'use client';
/**
 * src/a11y/FocusTrap.tsx
 * Compound component wrapper that applies keyboard focus trapping.
 *
 * Wraps the `useFocusManagement` hook in a render-prop / children pattern
 * so that modals, drawers, and dialogs can adopt focus trapping with a
 * single JSX element instead of imperative hook calls.
 *
 * Usage:
 *   <FocusTrap active={isOpen} onEscape={closeModal}>
 *     <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
 *       ...
 *     </div>
 *   </FocusTrap>
 *
 * Advanced usage with custom initial focus:
 *   const submitRef = useRef<HTMLButtonElement>(null);
 *   <FocusTrap active={isOpen} initialFocusRef={submitRef} onEscape={close}>
 *     <div role="dialog" ...>
 *       <button ref={submitRef}>Submit</button>
 *     </div>
 *   </FocusTrap>
 */

import { useRef } from 'react';
import { useFocusManagement } from './useFocusManagement';
import type { FocusTrapOptions } from './types';

interface FocusTrapProps extends Omit<FocusTrapOptions, 'active'> {
    /** Whether the focus trap is currently active. */
    active: boolean;
    /** Content to render inside the trap. */
    children: React.ReactNode;
    /**
     * Optional class name applied to the wrapping <div>.
     * Defaults to 'contents' so the wrapper has no layout impact.
     */
    className?: string;
    /**
     * The HTML element type of the wrapping container.
     * Defaults to 'div'.
     */
    as?: React.ElementType;
}

export function FocusTrap({
    active,
    initialFocusRef,
    returnFocusRef,
    onEscape,
    children,
    className = 'contents',
    as: Tag = 'div',
}: FocusTrapProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const trapRef = useFocusManagement({
        active,
        initialFocusRef,
        returnFocusRef,
        onEscape,
    });

    // Merge the trapRef callback ref with the local containerRef
    const setRef = (node: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        trapRef(node);
    };

    return (
        <Tag ref={setRef} className={className}>
            {children}
        </Tag>
    );
}
