'use client'
// ClientLayout — wraps every page.
// Handles one-time app initialisation: service worker + IndexedDB seed + store boot.

import { useEffect, useState } from 'react'
import { BottomNav } from './BottomNav'
import { useGTDStore } from '@/store/gtdStore'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const loadAll = useGTDStore(s => s.loadAll)
  const adhdMode = useGTDStore(s => s.settings?.adhdMode)
  const [ready, setReady] = useState(false)
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

      setReady(true)
    }
    boot()
  }, [loadAll])

  useEffect(() => {
    // 3. Register service worker (after paint — non-blocking)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(err =>
          console.warn('[SW] Registration failed:', err)
        )
      })
    }
  }, [])

  return (
    <div className={`bg-background-dark text-slate-100 font-display min-h-screen ${adhdMode ? 'adhd-mode' : ''}`}>
      {/* 
        We must always render the same React tree to avoid Hook order mismatches.
        Instead of unmounting the app, we visually hide it with CSS while waiting
        for IndexedDB.
      */}
      <div className={ready ? 'hidden' : 'fixed inset-0 flex items-center justify-center bg-background-dark z-50'}>
        <div className="flex flex-col items-center gap-3">
          <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mt-4">Loading Life To Do</p>
        </div>
      </div>

      <div className={ready ? 'block' : 'hidden'}>
        <main className="pb-28 min-h-screen max-w-[430px] mx-auto border-x border-primary/10 shadow-2xl bg-background-dark relative">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
