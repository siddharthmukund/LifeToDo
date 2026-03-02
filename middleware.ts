/**
 * middleware.ts  (project root)
 * iCCW #10 — Localization: next-intl locale detection + routing middleware.
 *
 * Locale detection priority (handled by next-intl internally):
 *   1. URL prefix           /es/inbox  →  locale = 'es'
 *   2. NEXT_LOCALE cookie   set by LocaleSwitcher
 *   3. Accept-Language      browser preference header
 *   4. Default              'en'
 *
 * Firestore profile preference (D7) is resolved client-side after auth
 * and applied by updating the cookie — it cannot be read here without
 * a round-trip.
 *
 * Routes excluded from locale middleware:
 *   - /api/*          → server-side API routes (locale handled per-route)
 *   - /_next/*        → Next.js internals
 *   - /favicon.ico    → static asset
 *   - /manifest.json  → PWA manifest
 *   - /icons/*        → app icons
 *   - /sw.js          → service worker
 *   - /.well-known/*  → iOS Universal Links / Android App Links
 */
import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - api routes
     *   - _next/static (static files)
     *   - _next/image  (image optimisation)
     *   - favicon.ico
     *   - manifest.json
     *   - icons directory
     *   - sw.js
     *   - .well-known directory
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|icons|sw\\.js|\\.well-known).*)',
  ],
}
