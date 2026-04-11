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
      className={cn(
        'fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40',
        'glass-panel border-t border-border-subtle',
        'shadow-glow-primary',
        'flex justify-around items-center h-20 px-2 safe-area-bottom pb-4',
        'rounded-t-[8px]',
      )}
    >
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
                'flex flex-col items-center justify-center gap-1 relative select-none',
                'min-h-[56px] min-w-[56px] px-2 rounded-2xl',
                'transition-all duration-200 ease-out active:scale-90',
                active
                  ? 'text-primary drop-shadow-[0_0_8px_var(--primary-ink)]'
                  : 'text-content-muted hover:text-primary/80',
              )}
            >
              <div className="relative flex items-center justify-center h-7">
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? 'text-primary' : ''}
                  aria-hidden="true"
                />

                {/* Blue badge — unprocessed inbox count */}
                {inboxBadge !== null && (
                  <div
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center
                                 justify-center px-1 text-[9px] font-bold
                                 bg-primary text-content-inverse rounded-full ring-2 ring-surface-base"
                    aria-hidden="true"
                  >
                    {inboxBadge > 99 ? '99+' : inboxBadge}
                  </div>
                )}

                {/* Amber badge — stale items needing review */}
                {staleBadge !== null && (
                  <div
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center
                                 justify-center px-1 text-[9px] font-bold
                                 bg-status-warning text-content-inverse rounded-full ring-2 ring-surface-base"
                    aria-hidden="true"
                  >
                    {staleBadge > 99 ? '99+' : staleBadge}
                  </div>
                )}
              </div>

              <span className={cn(
                'text-[9px] font-bold uppercase tracking-widest',
                active ? 'text-primary' : 'text-content-muted',
              )}>
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
    </nav>
  )
}
