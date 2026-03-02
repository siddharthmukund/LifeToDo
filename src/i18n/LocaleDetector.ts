/**
 * LocaleDetector.ts
 * 
 * First visit heuristic for users who have no cookie or profile preference yet.
 * Leverages the standard HTTP `Accept-Language` headers and maps against our supported targets.
 * Handled natively by next-intl's createMiddleware configuration automatically, 
 * but this file remains available to override logic or provide manual fallbacks for APIs.
 */

import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18nConfig } from './config';

export function getBestMatchingLocale(acceptLanguageHeader: string | null): string {
    if (!acceptLanguageHeader) return i18nConfig.defaultLocale;

    // e.g. "en-GB,en;q=0.9,es-ES;q=0.8,es;q=0.7"
    const languages = new Negotiator({ headers: { 'accept-language': acceptLanguageHeader } }).languages();
    const locales: string[] = [...i18nConfig.locales];

    try {
        return match(languages, locales, i18nConfig.defaultLocale);
    } catch (e) {
        return i18nConfig.defaultLocale;
    }
}
