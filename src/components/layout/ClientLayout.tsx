'use client'
// ClientLayout — wraps every page.
// Handles one-time app initialisation: service worker + IndexedDB seed + store boot.
// Updated in iCCW #3: added SideNav for lg: breakpoint; BottomNav hidden on desktop.
// Updated in iCCW #4: analytics prune, perf monitoring, plugin registry init.

import { useEffect, useState } from 'react'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { useGTDStore } from '@/store/gtdStore'
import { pruneOldEvents } from '@/analytics/tracker'
import { initPerformanceMonitoring, prunePerfLogs } from '@/perf/monitor'
import { startMemoryWatcher } from '@/perf/memoryWatcher'
import { registerPlugin, initializePlugins, teardownPlugins } from '@/plugins/registry'
import { CalendarPlugin }  from '@/plugins/integrations/CalendarPlugin'
import { AICapturePlugin } from '@/plugins/integrations/AICapturePlugin'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const loadAll  = useGTDStore(s => s.loadAll)
  const settings = useGTDStore(s => s.settings)
  const adhdMode = useGTDStore(s => s.settings?.adhdMode)
  const [ready,   setReady]   = useState(false)
  const [mounted, setMounted] = useState(false)

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
      <div className={`bg-background-dark text-slate-100 font-display min-h-screen ${adhdMode ? 'adhd-mode' : ''}`}>
        <div className="fixed inset-0 flex items-center justify-center bg-background-dark z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-primary text-xs font-bold uppercase tracking-widest mt-4">
              Loading Life To Do
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-background-dark text-slate-100 font-display min-h-screen ${adhdMode ? 'adhd-mode' : ''}`}>

      {/* Desktop sidebar — hidden on mobile, shown at lg: breakpoint */}
      <SideNav />

      {/*
        Main content column:
        Mobile  → centred at max 430px, bottom-padded for BottomNav
        Desktop → shifted right by the 76px sidebar, no bottom padding
      */}
      <main
        className={[
          'min-h-screen',
          'max-w-[430px] mx-auto',
          'lg:mx-0 lg:ml-[76px]',
          'pb-28 lg:pb-0',
          'border-x border-primary/10 shadow-2xl',
          'bg-background-dark relative',
        ].join(' ')}
      >
        {children}
      </main>

      {/* Bottom nav — mobile only (hidden at lg: breakpoint) */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
