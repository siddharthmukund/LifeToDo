/**
 * app/layout.tsx
 * iCCW #10 — Localization: minimal root layout.
 *
 * With next-intl's [locale] routing the real <html>/<body> shell lives in
 * app/[locale]/layout.tsx so it can set lang= and dir= dynamically.
 *
 * This root layout intentionally renders only its children.
 * Global CSS is imported here so it is included in the initial CSS bundle
 * regardless of locale.
 *
 * Note: Next.js App Router allows the root layout to return children
 * directly when a nested layout provides <html> and <body>.
 */
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
