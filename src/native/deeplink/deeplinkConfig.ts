/**
 * deeplinkConfig.ts
 * Route patterns and scheme definitions for Life To Do deep links.
 *
 * Supported schemes:
 *   Custom:   lifetodo://           (iOS & Android)
 *   Universal: https://lifetodo.app  (iOS Associated Domains)
 *   App Links: https://lifetodo.app  (Android .well-known/assetlinks.json)
 */

export const DEEP_LINK_SCHEME = 'lifetodo';
export const DEEP_LINK_DOMAIN = 'lifetodo.app';

/** Map of named deep-link routes → their in-app Next.js paths. */
export const DEEP_LINK_ROUTES: Record<string, string> = {
    inbox:          '/inbox',
    'next-actions': '/next-actions',
    projects:       '/projects',
    review:         '/review',
    capture:        '/capture',
    settings:       '/settings',
    'pro-upgrade':  '/settings/upgrade',
};

/**
 * Resolve a raw deep-link URL string into an in-app navigation path.
 * Returns null if the URL doesn't belong to this app.
 *
 * Examples:
 *   lifetodo://inbox              → '/inbox'
 *   lifetodo://projects/proj-123  → '/projects/proj-123'
 *   https://lifetodo.app/review   → '/review'
 */
export function resolveDeepLink(rawUrl: string): string | null {
    try {
        const url = new URL(rawUrl);

        let path: string;

        if (url.protocol === `${DEEP_LINK_SCHEME}:`) {
            // lifetodo://host/path  or  lifetodo:///path
            const host = url.host || '';
            path = host ? `/${host}${url.pathname}` : url.pathname;
        } else if (url.hostname === DEEP_LINK_DOMAIN) {
            path = `${url.pathname}${url.search}`;
        } else {
            return null;  // unknown origin
        }

        // Normalise double-slashes
        return path.replace(/\/\/+/g, '/') || '/';
    } catch {
        return null;
    }
}
