'use client'
// SideNav — desktop sidebar at lg: breakpoint.
// Mirrors BottomNav tabs; adds "Waiting" entry for Waiting For page.
// Shows as a fixed 76px icon column on the left. Hidden on mobile.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, Zap, FolderOpen, Calendar, Settings, Clock, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGTDStore } from '@/store/gtdStore'
import { useStaleItems } from '@/hooks/useStaleItems'

const TABS = [
  { href: '/',          icon: Zap,        label: 'Today',    badge: null    },
  { href: '/inbox',     icon: Inbox,      label: 'Inbox',    badge: 'inbox' },
  { href: '/projects',  icon: FolderOpen, label: 'Projects', badge: null    },
  { href: '/waiting',   icon: Clock,      label: 'Waiting',  badge: null    },
  { href: '/review',    icon: Calendar,   label: 'Review',   badge: 'stale' },
  { href: '/insights',  icon: BarChart2,  label: 'Insights', badge: null    },
  { href: '/settings',  icon: Settings,   label: 'Settings', badge: null    },
] as const

export function SideNav() {
  const pathname    = usePathname()
  const inboxCount  = useGTDStore(s => s.inboxCount)
  const stale       = useStaleItems()

  return (
    <nav
      className="fixed left-0 top-0 bottom-0 w-[76px] hidden lg:flex flex-col items-center
                 bg-background-dark/95 backdrop-blur-xl border-r border-primary/10
                 py-8 z-40 shadow-card gap-1"
    >
      {/* App logomark */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-glow-accent">
          <Zap size={18} className="text-primary fill-primary/30" />
        </div>
      </div>

      {/* Navigation items */}
      {TABS.map(({ href, icon: Icon, label, badge }) => {
        const active      = pathname === href
        const inboxBadge  = badge === 'inbox' && inboxCount > 0 ? inboxCount : null
        const staleBadge  = badge === 'stale' && stale.total > 0 ? stale.total : null

        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              'relative flex flex-col items-center justify-center w-[54px] h-[54px] rounded-2xl',
              'transition-all duration-150 select-none',
              active
                ? 'bg-primary/15 text-primary border border-primary/20 shadow-glow-accent'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5',
            )}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 2}
              className={active ? 'fill-primary/20 mb-0.5' : 'mb-0.5'}
            />
            <span className="text-[9px] font-bold uppercase tracking-tighter leading-none">
              {label}
            </span>

            {/* Inbox badge */}
            {inboxBadge !== null && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center
                               px-1 text-[10px] font-bold bg-primary text-background-dark rounded-full leading-none">
                {inboxBadge > 99 ? '99+' : inboxBadge}
              </span>
            )}

            {/* Stale / review badge */}
            {staleBadge !== null && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center
                               px-1 text-[10px] font-bold bg-yellow-500 text-background-dark rounded-full leading-none">
                {staleBadge > 99 ? '99+' : staleBadge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
