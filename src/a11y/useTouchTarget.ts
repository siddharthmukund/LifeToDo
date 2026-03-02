'use client';
/**
 * src/a11y/useTouchTarget.ts
 * Development-only hook that validates touch-target sizes at runtime.
 *
 * Attach a ref to any interactive element to get a console warning
 * when it falls below WCAG 2.5.8 minimums.
 *
 * In production builds the hook is a no-op — no bundle cost.
 *
 * Usage:
 *   const targetRef = useTouchTarget('MyButton');
 *   <button ref={targetRef}>Click me</button>
 */

import { useRef, useEffect, useCallback } from 'react';
import { A11Y_CONFIG } from './a11yConfig';
import type { TouchTargetResult, TouchTargetSeverity } from './types';

const IS_DEV = process.env.NODE_ENV === 'development';

function measure(el: HTMLElement, label: string): TouchTargetResult {
    const rect = el.getBoundingClientRect();
    const { width, height } = rect;
    const min  = A11Y_CONFIG.minTouchTarget;      // 44px recommended
    const hard = A11Y_CONFIG.absoluteMinTouchTarget; // 24px hard floor

    let severity: TouchTargetSeverity;
    let message: string;

    if (width >= min && height >= min) {
        severity = 'pass';
        message  = `[a11y] ✅ ${label}: ${Math.round(width)}×${Math.round(height)}px (≥ 44×44)`;
    } else if (width >= hard && height >= hard) {
        severity = 'warn';
        message  = `[a11y] ⚠️  ${label}: ${Math.round(width)}×${Math.round(height)}px — below recommended 44×44px (WCAG 2.5.8)`;
    } else {
        severity = 'fail';
        message  = `[a11y] ❌ ${label}: ${Math.round(width)}×${Math.round(height)}px — FAIL: below absolute minimum 24×24px (WCAG 2.5.8)`;
    }

    return { element: el, width, height, severity, message };
}

/**
 * Dev-only hook to validate the touch target size of an interactive element.
 *
 * @param label   Human-readable label shown in console messages.
 * @returns       A ref to attach to the element under test.
 */
export function useTouchTarget(label: string) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!IS_DEV) return;
        const el = ref.current;
        if (!el) return;

        // Measure after the browser paints
        const timer = setTimeout(() => {
            const result = measure(el, label);
            if (result.severity === 'fail') {
                console.error(result.message, el);
            } else if (result.severity === 'warn') {
                console.warn(result.message, el);
            }
            // 'pass' — silent
        }, 500);

        return () => clearTimeout(timer);
    }, [label]);

    return ref;
}

/**
 * Run a one-off audit of all interactive elements in a container.
 * Logs results to the console. Dev-only.
 *
 * @param containerSelector CSS selector for the root to scan. Defaults to 'body'.
 */
export function auditTouchTargets(containerSelector = 'body'): TouchTargetResult[] {
    if (!IS_DEV || typeof document === 'undefined') return [];

    const container = document.querySelector(containerSelector);
    if (!container) return [];

    const interactive = Array.from(
        container.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [role="button"], [role="link"]',
        ),
    );

    const results = interactive.map((el) =>
        measure(el, el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || el.tagName),
    );

    const failures = results.filter((r) => r.severity === 'fail');
    const warnings = results.filter((r) => r.severity === 'warn');

    console.group(`[a11y] Touch Target Audit — ${containerSelector}`);
    console.log(`Total: ${results.length} | Pass: ${results.length - failures.length - warnings.length} | Warn: ${warnings.length} | Fail: ${failures.length}`);
    failures.forEach((r) => console.error(r.message, r.element));
    warnings.forEach((r) => console.warn(r.message, r.element));
    console.groupEnd();

    return results;
}

/**
 * Returns a ref callback (no-op in production).
 * Alternative to `useTouchTarget` when a ref callback is preferred.
 */
export function touchTargetRef(label: string) {
    return IS_DEV
        ? (el: HTMLElement | null) => {
            if (!el) return;
            setTimeout(() => {
                const result = measure(el, label);
                if (result.severity !== 'pass') {
                    const fn = result.severity === 'fail' ? console.error : console.warn;
                    fn(result.message, el);
                }
            }, 500);
          }
        : (_el: HTMLElement | null) => { /* noop in production */ };
}
