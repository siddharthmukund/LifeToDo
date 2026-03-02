'use client';

import { useLocale } from 'next-intl';
import { i18nConfig } from './config';
import type { Direction, Locale } from './config';

/**
 * Returns 'ltr' or 'rtl' depending on the active locale.
 */
export function useDirection(): Direction {
    const locale = useLocale() as Locale;
    return i18nConfig.localeMetadata[locale]?.dir || 'ltr';
}
