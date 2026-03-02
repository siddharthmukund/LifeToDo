'use client'
// BottomNav — persistent 5-tab navigation.
// Inbox tab: blue badge for unprocessed count.
// Review tab: amber badge when stale items need attention.
// iCCW #13: aria-label on <nav>, aria-current="page" on active link, sr-only badge text.

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
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-surface-base/95
                 border-t border-border-default backdrop-blur-xl pb-6 pt-3 px-6 safe-area-bottom"
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
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 relative',
                'transition-colors duration-150 select-none pb-2',
                // Minimum 44px touch target vertically via padding
                'min-h-[44px] justify-center',
                active ? 'text-primary-ink' : 'text-content-secondary hover:text-content-primary',
              )}
            >
              <div className="relative flex items-center justify-center h-8">
                <Icon
                  size={26}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? 'fill-primary/20' : ''}
                  aria-hidden="true"
                />

                {/* Blue badge — unprocessed inbox count */}
                {inboxBadge !== null && (
                  <div
                    className="absolute top-1 right-2 w-4 h-4 flex items-center
                                 justify-center px-1 text-[10px] font-bold
                                 bg-primary text-on-brand rounded-full"
                    aria-hidden="true"
                  >
                    {inboxBadge > 99 ? '99+' : inboxBadge}
                  </div>
                )}

                {/* Amber badge — stale items needing review */}
                {staleBadge !== null && (
                  <div
                    className="absolute top-1 right-2 w-4 h-4 flex items-center
                                 justify-center px-1 text-[10px] font-bold
                                 bg-yellow-500 text-on-brand rounded-full"
                    aria-hidden="true"
                  >
                    {staleBadge > 99 ? '99+' : staleBadge}
                  </div>
                )}
              </div>

              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {label}
              </span>

              {/* Screen-reader-only badge descriptions */}
              {inboxBadge !== null && (
                <span className="sr-only">
                  {inboxBadge === 1 ? '1 unprocessed item' : `${inboxBadge > 99 ? '99+' : inboxBadge} unprocessed items`}
                </span>
              )}
              {staleBadge !== null && (
                <span className="sr-only">
                  {staleBadge === 1 ? '1 item needs review' : `${staleBadge > 99 ? '99+' : staleBadge} items need review`}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
