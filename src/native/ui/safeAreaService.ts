/**
 * safeAreaService.ts
 * Reads the native safe-area insets injected by WKWebView / Chrome Custom Tabs
 * into CSS environment variables (env(safe-area-inset-*)) and mirrors them as
 * custom CSS properties on <html> for use in Tailwind utilities.
 *
 * Call once from ClientLayout after the native platform is confirmed.
 */

import { platform } from '../platform';

/** CSS variable names set on document.documentElement */
const CSS_VARS = {
    top:    '--safe-top',
    bottom: '--safe-bottom',
    left:   '--safe-left',
    right:  '--safe-right',
} as const;

/**
 * Reads env(safe-area-inset-*) values and writes them to CSS custom properties.
 * No-op on web (returns immediately).
 */
export function applySafeAreaVars(): void {
    if (!platform.isNative()) return;
    if (typeof document === 'undefined') return;

    // We read via a temporary element to force the browser to compute the env() values.
    const el = document.createElement('div');
    el.style.cssText = [
        'position:fixed',
        'top:env(safe-area-inset-top,0px)',
        'bottom:env(safe-area-inset-bottom,0px)',
        'left:env(safe-area-inset-left,0px)',
        'right:env(safe-area-inset-right,0px)',
        'visibility:hidden',
        'pointer-events:none',
    ].join(';');
    document.body.appendChild(el);

    const style = getComputedStyle(el);
    const root  = document.documentElement;

    root.style.setProperty(CSS_VARS.top,    style.top);
    root.style.setProperty(CSS_VARS.bottom, style.bottom);
    root.style.setProperty(CSS_VARS.left,   style.left);
    root.style.setProperty(CSS_VARS.right,  style.right);

    document.body.removeChild(el);
}

/** Re-apply on every orientation change (safe areas differ in landscape). */
export function watchSafeArea(): () => void {
    if (!platform.isNative() || typeof window === 'undefined') return () => {};

    applySafeAreaVars();
    const mql = window.matchMedia('(orientation: portrait)');
    const handler = () => applySafeAreaVars();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
}
