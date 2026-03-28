'use client'
// BottomNav — persistent 5-tab navigation.
// Inbox tab: blue badge for unprocessed count.
// Review tab: amber badge when stale items need attention.
// iCCW #13: aria-label on <nav>, aria-current="page" on active link, sr-only badge text.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Inbox, Zap, FolderOpen, Calendar, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGTDStore } from '@/store/gtdStore'
import { useStaleItems } from '@/hooks/useStaleItems'

const TAB_DEFS = [
  { href: '/', icon: Zap, key: 'today' as const, badge: null },
  { href: '/inbox', icon: Inbox, key: 'inbox' as const, badge: 'inbox' },
  { href: '/projects', icon: FolderOpen, key: 'projects' as const, badge: null },
  { href: '/review', icon: Calendar, key: 'review' as const, badge: 'stale' },
  { href: '/settings', icon: Settings, key: 'settings' as const, badge: null },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const inboxCount = useGTDStore(s => s.inboxCount)
  const stale = useStaleItems()
  const t = useTranslations('navigation')

  return (
    <nav
      aria-label={t('aria.main')}
      className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-surface-base/95
                 border-t border-border-default backdrop-blur-xl pb-6 pt-3 px-6 safe-area-bottom"
    >
      <div className="flex items-center justify-between gap-2">
        {TAB_DEFS.map(({ href, icon: Icon, key, badge }) => {
          const active = pathname === href
          const label = t(`tabs.${key}`)

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
                  {t('aria.inboxBadge', { count: inboxBadge > 99 ? 99 : inboxBadge })}
                </span>
              )}
              {staleBadge !== null && (
                <span className="sr-only">
                  {t('aria.staleBadge', { count: staleBadge > 99 ? 99 : staleBadge })}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
