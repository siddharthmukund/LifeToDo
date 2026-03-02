'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from './navigation';
import { useLocale } from 'next-intl';
import type { Locale } from './config';

export function useLocalePreference() {
    const [isPending, startTransition] = useTransition();
    const currentLocale = useLocale() as Locale;
    const router = useRouter();
    const pathname = usePathname();

    const setLocale = (nextLocale: Locale) => {
        // We use startTransition to avoid blocking the UI while the
        // new locale JSON namespace fetch resolves from the server.
        startTransition(() => {
            // Replaces the URL path with the new specific locale prefix
            // (e.g. /en/inbox -> /hi/inbox) which triggers Layout middleware 
            // cookie writing and direction changes automatically.
            router.replace(pathname, { locale: nextLocale });
        });

        // In a real application, we would also emit a db.users.update(uid, { locale: nextLocale })
        // request here to persist the choice to their cloud profile.
    };

    return {
        currentLocale,
        setLocale,
        isPending
    };
}
