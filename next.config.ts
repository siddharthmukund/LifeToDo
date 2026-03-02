import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// iCCW #10: Register next-intl — points to our request config file
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // iCCW #13: disable Turbopack to avoid node PATH resolution issues in this shell env
  turbopack: undefined,
  // Serve sw.js with correct headers so browser treats it as a service worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      // iOS Universal Links — must be served as JSON without redirect
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
      // Android App Links — served as JSON
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
    ]
  },
  ...(process.env.BUILD_TARGET === 'native' && {
    output: 'export',
    images: { unoptimized: true },
  }),
}

export default withNextIntl(nextConfig)
