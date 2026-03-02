// Icons that SHOULD mirror in RTL (directional intent)
const mirroredIcons = new Set([
    'arrow-left', 'arrow-right', 'chevron-left', 'chevron-right',
    'reply', 'forward', 'undo', 'redo', 'external-link',
    'indent', 'outdent', 'skip-forward', 'skip-back',
    'logout',
]);

/**
 * Determines whether a Lucide icon name should be horizontally flipped when `dir="rtl"`.
 */
export function shouldMirrorIcon(iconName: string): boolean {
    return mirroredIcons.has(iconName);
}

/**
 * Helper to compute an RTL-aware class wrapper for icons.
 * Recommends `rtl:-scale-x-100` via Tailwind.
 */
export function getMirroredIconClass(iconName: string, isRtl: boolean): string {
    return shouldMirrorIcon(iconName) && isRtl ? 'rtl:-scale-x-100' : '';
}
