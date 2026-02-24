import type { Metadata, Viewport } from 'next'
import { ClientLayout } from '@/components/layout/ClientLayout'
import './globals.css'

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
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
