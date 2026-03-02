'use client'
// ClientLayout — wraps every page.
// Handles one-time app initialisation: service worker + IndexedDB seed + store boot.
// Updated in iCCW #3: added SideNav for lg: breakpoint; BottomNav hidden on desktop.
// Updated in iCCW #4: analytics prune, perf monitoring, plugin registry init.
// Updated in iCCW #7: native services — status bar, deep links, share, biometric lock, push prompt.
// Updated in iCCW #13: route change announcements for screen readers.

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { useGTDStore } from '@/store/gtdStore'
import { useTheme } from '@/hooks/useTheme'
import { pruneOldEvents } from '@/analytics/tracker'
import { initPerformanceMonitoring, prunePerfLogs } from '@/perf/monitor'
import { startMemoryWatcher } from '@/perf/memoryWatcher'
import { registerPlugin, initializePlugins, teardownPlugins } from '@/plugins/registry'
import { CalendarPlugin } from '@/plugins/integrations/CalendarPlugin'
import { AICapturePlugin } from '@/plugins/integrations/AICapturePlugin'
import { DeletionCoolingBanner } from '@/components/data/DeletionCoolingBanner'
import { CelebrationManager } from '@/components/gamification'
// iCCW #7 — Native services
import { useNativePolish } from '@/native/polish/useNativePolish'
import { useDeepLinks } from '@/native/navigation/useDeepLinks'
import { useShareReceiver } from '@/native/share/useShareReceiver'
import { useSafeArea } from '@/native/ui/useSafeArea'
import { useBiometric } from '@/native/biometric/useBiometric'
import { BiometricLockScreen } from '@/native/biometric/BiometricLockScreen'
import { PushPermissionPrompt } from '@/native/push/PushPermissionPrompt'
// iCCW #13 — Accessibility: route announcement singleton
import { announcer } from '@/a11y/announcer'
import { A11Y_CONFIG } from '@/a11y/a11yConfig'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const loadAll = useGTDStore(s => s.loadAll)
  const settings = useGTDStore(s => s.settings)
  const adhdMode = useGTDStore(s => s.settings?.adhdMode)
  const [ready, setReady] = useState(false)
  const [mounted, setMounted] = useState(false)

  // iCCW #5: Sync theme preference from Dexie → data-theme attribute on <html>.
  // The FOUC script sets an initial value before hydration; this hook keeps it
  // in sync whenever settings change (e.g. user toggles theme in Settings).
  useTheme()

  // iCCW #7: Native services — all no-op on web.
  useNativePolish()    // status bar sync + splash hide + keyboard height var
  useDeepLinks()       // universal links + lifetodo:// custom scheme
  useShareReceiver()   // iOS Share Extension + Android ACTION_SEND payloads
  useSafeArea()        // --safe-top/bottom/left/right CSS vars
  const { isLocked, biometryType, authenticate } = useBiometric()

  // iCCW #13 — Announce route changes to screen readers.
  const pathname = usePathname()
  useEffect(() => {
    // Skip the very first render so we don't announce the initial page load
    // (the page title already conveys this to screen readers).
    announcer.announceRoute({ pathname })
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function boot() {
      // 1. Seed IndexedDB with defaults (idempotent)
      const { initializeApp } = await import('@/lib/seed')
      await initializeApp()

      // 2. Hydrate Zustand store from IndexedDB
      await loadAll()

      // 3. Prune old analytics + perf logs (non-blocking, non-critical)
      void pruneOldEvents()
      void prunePerfLogs()

      setReady(true)
    }
    boot()
  }, [loadAll])

  // 4. Initialize plugins once settings are loaded
  useEffect(() => {
    if (!settings) return
    registerPlugin(CalendarPlugin)
    registerPlugin(AICapturePlugin)
    void initializePlugins(settings.tier)
    return () => { void teardownPlugins() }
  }, [settings?.tier]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // 5. Register service worker (after paint — non-blocking)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(err =>
          console.warn('[SW] Registration failed:', err)
        )
      })
    }

    // 6. Start Core Web Vitals + memory monitoring
    initPerformanceMonitoring()
    const stopMemory = startMemoryWatcher()
    return () => stopMemory()
  }, [])

  if (!mounted || !ready) {
    return (
      <div className={`bg-surface-base text-content-primary font-display min-h-screen ${adhdMode ? 'adhd-mode' : ''}`}>
        <div className="fixed inset-0 flex items-center justify-center bg-surface-base z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-primary-ink text-xs font-bold uppercase tracking-widest mt-4">
              Loading Life To Do
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-surface-base text-content-primary font-display min-h-screen ${adhdMode ? 'adhd-mode' : ''}`}>
      {/* Desktop sidebar — hidden on mobile, shown at lg: breakpoint */}
      <SideNav />

      {/* Main content wrapper with mobile safe area padding */}
      {/* id="main-content" is the SkipLink target (iCCW #13) */}
      <main
        id={A11Y_CONFIG.mainContentId}
        className={[
          'min-h-screen',
          'max-w-[430px] mx-auto',
          'lg:mx-0 lg:ml-[76px]',
          'pb-28 lg:pb-0',
          'border-x border-border-default shadow-card',
          'bg-surface-base relative',
        ].join(' ')}
      >
        {/* Deletion cooling-period warning — shown on all pages during 7-day window */}
        <DeletionCoolingBanner />
        {children}
      </main>

      {/* id="bottom-nav" is the secondary SkipLink target (iCCW #13) */}
      <div id={A11Y_CONFIG.bottomNavId} className="lg:hidden">
        <BottomNav />
      </div>

      {/* Gamification Celebration Manager — handles XP toasts, achievements, level-up modals */}
      <CelebrationManager />

      {/* iCCW #7 — Native overlay layers (all no-op / null on web) */}
      {/* Biometric lock screen — shown when the app resumes after inactivity */}
      <BiometricLockScreen
        isLocked={isLocked}
        biometryType={biometryType}
        onUnlock={async () => { await authenticate('Unlock Life To Do') }}
        onUsePassword={() => { void authenticate('Unlock Life To Do') }}
      />
      {/* Push permission prompt — nudges users to enable push on first relevant action */}
      <PushPermissionPrompt />
    </div>
  )
}
