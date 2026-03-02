import createMiddleware from 'next-intl/middleware';
import { i18nConfig } from '@/i18n/config';

export default createMiddleware({
    locales: i18nConfig.locales,
    defaultLocale: i18nConfig.defaultLocale,
    localeDetection: true,          // Auto-detect from Accept-Language header
    localePrefix: 'as-needed',      // /en/ omitted for default, /hi/ shown for Hindi
});

export const config = {
    // Match only internationalized pathnames
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',

        // Set a cookie to remember the previous locale for all requests that have a locale prefix
        '/(hi|es|ar|pt-BR|de|ja|zh-CN)/:path*',

        // Enable redirects that add missing locales
        // (e.g. `/pathnames` -> `/en/pathnames`)
        '/((?!api|_next|_vercel|.*\\\\..*).*)'
    ]
};
