'use client';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { addDeepLinkListener, removeDeepLinkListeners } from './deepLinkHandler';

/**
 * Global hook to mount in the root layout to catch and route deep links.
 */
export function useDeepLinks() {
    const router = useRouter();

    const handleDeepLink = useCallback((path: string) => {
        // Ignore share target deep links since useShareReceiver handles them
        if (path.startsWith('/share')) return;

        // Navigate via Next.js router inside the WebView
        if (path) {
            router.push(path);
        }
    }, [router]);

    useEffect(() => {
        addDeepLinkListener(handleDeepLink);
        return () => {
            removeDeepLinkListeners();
        };
    }, [handleDeepLink]);
}
