'use client'
// SideNav — desktop sidebar at lg: breakpoint.
// Mirrors BottomNav tabs; adds "Waiting" entry for Waiting For page.
// Shows as a fixed 76px icon column on the left. Hidden on mobile.
// iCCW #13: aria-label on <nav>, aria-current="page", aria-label on links, sr-only badge text.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Inbox, Zap, FolderOpen, Calendar, Settings, Clock, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGTDStore } from '@/store/gtdStore'
import { useStaleItems } from '@/hooks/useStaleItems'

const TAB_DEFS = [
  { href: '/', icon: Zap, key: 'today' as const, badge: null },
  { href: '/inbox', icon: Inbox, key: 'inbox' as const, badge: 'inbox' },
  { href: '/projects', icon: FolderOpen, key: 'projects' as const, badge: null },
  { href: '/waiting', icon: Clock, key: 'waiting' as const, badge: null },
  { href: '/review', icon: Calendar, key: 'review' as const, badge: 'stale' },
  { href: '/insights', icon: BarChart2, key: 'insights' as const, badge: null },
  { href: '/settings', icon: Settings, key: 'settings' as const, badge: null },
] as const

export function SideNav() {
  const pathname = usePathname()
  const inboxCount = useGTDStore(s => s.inboxCount)
  const stale = useStaleItems()
  const t = useTranslations('navigation')

  return (
    <nav
      aria-label={t('aria.sidebar')}
      className="fixed left-0 top-0 bottom-0 w-[76px] hidden lg:flex flex-col items-center
                 bg-surface-base/95 backdrop-blur-xl border-r border-border-default
                 py-8 z-40 shadow-card gap-1"
    >
      {/* App logomark (decorative) */}
      <div className="mb-8" aria-hidden="true">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-glow-accent">
          <Zap size={18} className="text-primary-ink fill-primary/30" />
        </div>
      </div>

      {/* Navigation items */}
      {TAB_DEFS.map(({ href, icon: Icon, key, badge }) => {
        const active = pathname === href
        const label = t(`tabs.${key}`)
        const inboxBadge = badge === 'inbox' && inboxCount > 0 ? inboxCount : null
        const staleBadge = badge === 'stale' && stale.total > 0 ? stale.total : null

        // Build accessible label including badge info
        const badgeText = inboxBadge !== null
          ? `, ${t('aria.inboxBadge', { count: inboxBadge > 99 ? 99 : inboxBadge })}`
          : staleBadge !== null
            ? `, ${t('aria.staleBadge', { count: staleBadge > 99 ? 99 : staleBadge })}`
            : ''

        return (
          <Link
            key={href}
            href={href}
            aria-label={`${label}${badgeText}`}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-2xl transition-all',
              active
                ? 'bg-primary/15 text-primary-ink border border-primary/20 shadow-glow-accent'
                : 'text-content-secondary hover:text-content-primary hover:bg-overlay-hover',
            )}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 2}
              className={active ? 'fill-primary/20 mb-0.5' : 'mb-0.5'}
              aria-hidden="true"
            />
            <span className="text-[9px] font-bold uppercase tracking-tighter leading-none" aria-hidden="true">
              {label}
            </span>

            {/* Inbox badge (aria-hidden — label carries the count) */}
            {inboxBadge !== null && (
              <div
                className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 h-[18px] min-w-[18px] flex items-center
                             justify-center px-1 text-[10px] font-bold bg-primary text-on-brand rounded-full leading-none"
                aria-hidden="true"
              >
                {inboxBadge > 99 ? '99+' : inboxBadge}
              </div>
            )}

            {/* Stale / review badge (aria-hidden — label carries the count) */}
            {staleBadge !== null && (
              <div
                className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 h-[18px] min-w-[18px] flex items-center
                             justify-center px-1 text-[10px] font-bold bg-yellow-500 text-on-brand rounded-full leading-none"
                aria-hidden="true"
              >
                {staleBadge > 99 ? '99+' : staleBadge}
              </div>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
