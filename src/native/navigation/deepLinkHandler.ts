import { platform, getPlugin } from '../';

/**
 * Listens for app open events (e.g., from an App Link or custom scheme lifetodo://)
 */
export async function addDeepLinkListener(onDeepLink: (path: string) => void) {
    if (!platform.isNative()) return;

    const app = await getPlugin<any>('app');
    if (!app) return;

    app.addListener('appUrlOpen', (data: any) => {
        // data.url will be something like "lifetodo://projects/123" or "https://app.lifetodo.com/projects/123"
        try {
            const url = new URL(data.url);

            // If our custom scheme
            if (url.protocol === 'lifetodo:') {
                // path becomes "/projects/123"
                const path = url.host === '' ? url.pathname : `/${url.host}${url.pathname}${url.search}`;
                onDeepLink(path);
            }
            // If Universal/App Links
            else if (url.hostname === 'app.lifetodo.com') {
                onDeepLink(`${url.pathname}${url.search}`);
            }
        } catch (e) {
            console.error('[DeepLink] Failed to parse deep link url', data.url);
        }
    });
}

export async function removeDeepLinkListeners() {
    if (!platform.isNative()) return;
    const app = await getPlugin<any>('app');
    if (app) app.removeAllListeners();
}
