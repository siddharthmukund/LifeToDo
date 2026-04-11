// GTD Life — Service Worker (Workbox-free, hand-crafted)
// Strategy:
//   Navigation (HTML): Network-first → cache fallback (offline shell)
//   Static assets (JS/CSS/fonts/images): Cache-first → network fallback
//   API/external:  Network-only
//
// Background Sync: queued offline IndexedDB writes are NOT sent here
// (Dexie.js manages the queue; sync happens on reconnect in the main thread).

const CACHE_VERSION = 'gtd-life-v1'
const APP_SHELL     = [
  '/',
  '/inbox',
  '/waiting',
  '/projects',
  '/someday',
  '/review',
  '/settings',
  '/insights',
  '/manifest.json',
]

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll([...APP_SHELL, '/_next/data/BUILD_ID/index.json']))
      .then(() => self.skipWaiting())
  )
})

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k !== CACHE_VERSION)
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip Next.js internal routes (_next/webpack-hmr, etc.)
  if (url.pathname.startsWith('/_next/webpack-hmr')) return

  if (request.mode === 'navigate') {
    // Navigation: network-first, fallback to cached shell
    event.respondWith(networkFirst(request, '/'))
    return
  }

  // Static assets: cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js')  ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Default: network-first with cache fallback
  event.respondWith(networkFirst(request, null))
})

// ── Strategies ────────────────────────────────────────────────────────────────

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl)
      if (fallback) return fallback
    }
    return new Response('<h1>Offline</h1><p>GTD Life is offline. Open the app while connected to cache it.</p>', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    })
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'GTD Life', {
      body:    data.body ?? '',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-192.png',
      tag:     data.tag ?? 'gtd-notification',
      data:    { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? '/')
  )
})
