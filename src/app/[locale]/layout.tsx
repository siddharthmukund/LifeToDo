/**
 * app/[locale]/layout.tsx
 * iCCW #10 — Localization: locale-specific root layout.
 *
 * This layout:
 *   1. Validates the [locale] segment against supported locales
 *   2. Loads the merged message bundle for the locale
 *   3. Provides NextIntlClientProvider to the entire subtree
 *   4. Renders <html lang dir> with correct BCP 47 tag and text direction
 *   5. Applies the FOUC-prevention theme script (same as old root layout)
 *   6. Mounts accessibility infrastructure (SkipLink, LiveRegion)
 *   7. Mounts AuthProvider + ClientLayout
 *
 * The root app/layout.tsx is now a thin pass-through (no html/body) so
 * the lang and dir attributes can be set dynamically here.
 */
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { routing } from '@/i18n/routing'
import { LOCALE_METADATA } from '@/i18n/config'
import type { Locale } from '@/i18n/config'

import { ClientLayout } from '@/components/layout/ClientLayout'
import { AuthProvider } from '@/auth/AuthProvider'
import { SkipLink } from '@/a11y/SkipLink'
import { LiveRegion } from '@/a11y/LiveRegion'

// ─── Static Params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// ─── Metadata / Viewport ─────────────────────────────────────────────────────
// (Also declared in root layout for metadata inheritance; kept here so
//  per-locale pages can override via their own generateMetadata.)

export const metadata: Metadata = {
  title: 'GTD Life',
  description: 'Getting Things Done, actually. Capture → Clarify → Organize → Reflect → Engage.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GTD Life',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
    icon: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0F0F1A' },
    { media: '(prefers-color-scheme: light)', color: '#F4F6FB' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// ─── FOUC-prevention script ───────────────────────────────────────────────────
// Runs synchronously before first paint to set data-theme on <html>.
// Must live here (not root layout) because <head> is rendered here.

const FOUC_SCRIPT = `;(function(){
  try{
    var t=localStorage.getItem('ltd-theme');
    var r=(t==='light'||t==='dark')
      ?t
      :(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
    document.documentElement.setAttribute('data-theme',r);
  }catch(e){}
})();`

// ─── Layout ───────────────────────────────────────────────────────────────────

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  // Enable Next.js Static Export for this locale
  setRequestLocale(locale)

  // Reject unknown locales — renders 404
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()
  const meta = LOCALE_METADATA[locale as Locale]

  return (
    <html
      lang={locale}
      dir={meta.dir}
      suppressHydrationWarning
    >
      <head>
        {/* FOUC-prevention — sets data-theme before CSS resolves */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
      </head>
      <body>
        {/*
          iCCW #13 — Accessibility infrastructure.
          SkipLink: first Tab stop on every page (keyboard users bypass nav).
          LiveRegion: hidden aria-live containers for screen-reader announcements.
        */}
        <SkipLink />
        <LiveRegion />

        {/*
          NextIntlClientProvider makes translations available to all
          client components in this locale subtree.
        */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/*
            AuthProvider initialises Firebase auth + anonymous UUID.
            ClientLayout handles routing chrome (BottomNav, SideNav),
            one-time app init (SW, seed, plugins), and SR route announcements.
          */}
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
