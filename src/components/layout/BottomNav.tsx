'use client'
// BottomNav — persistent 5-tab navigation.
// Inbox tab: blue badge for unprocessed count.
// Review tab: amber badge when stale items need attention.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, Zap, FolderOpen, Calendar, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGTDStore } from '@/store/gtdStore'
import { useStaleItems } from '@/hooks/useStaleItems'

const TABS = [
  { href: '/', icon: Zap, label: 'Today', badge: null },
  { href: '/inbox', icon: Inbox, label: 'Inbox', badge: 'inbox' },
  { href: '/projects', icon: FolderOpen, label: 'Projects', badge: null },
  { href: '/review', icon: Calendar, label: 'Review', badge: 'stale' },
  { href: '/settings', icon: Settings, label: 'Settings', badge: null },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const inboxCount = useGTDStore(s => s.inboxCount)
  const stale = useStaleItems()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-background-dark/95 
                 border-t border-primary/10 backdrop-blur-xl pb-6 pt-3 px-6 safe-area-bottom"
    >
      <div className="flex items-center justify-between gap-2">
        {TABS.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href

          const inboxBadge = badge === 'inbox' && inboxCount > 0 ? inboxCount : null
          const staleBadge = badge === 'stale' && stale.total > 0 ? stale.total : null

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 relative',
                'transition-colors duration-150 select-none pb-2',
                active ? 'text-primary' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <div className="relative flex items-center justify-center h-8">
                <Icon size={26} strokeWidth={active ? 2.5 : 2} className={active ? 'fill-primary/20' : ''} />

                {/* Blue badge — unprocessed inbox count */}
                {inboxBadge !== null && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center
                                   justify-center px-1 text-[10px] font-bold
                                   bg-primary text-background-dark rounded-full">
                    {inboxBadge > 99 ? '99+' : inboxBadge}
                  </span>
                )}

                {/* Amber badge — stale items needing review */}
                {staleBadge !== null && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center
                                   justify-center px-1 text-[10px] font-bold
                                   bg-yellow-500 text-background-dark rounded-full">
                    {staleBadge > 99 ? '99+' : staleBadge}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
