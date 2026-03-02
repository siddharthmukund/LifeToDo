'use client'
// PaginatedList — universal ADHD-aware list wrapper.
// When ADHD Mode OFF: renders all items, standard scroll.
// When ADHD Mode ON: caps at PAGE_SIZE (7), discrete page controls.
// Single responsibility: pagination logic + UI. Rendering via renderItem.

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePagination } from '@/hooks/usePagination'
import { useADHDMode } from '@/hooks/useADHDMode'

interface PaginatedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  /** Shown at the top of each page (e.g. "3 of 7 done") */
  progressLabel?: string
  /** Override ADHD page size (defaults to hook constant = 7) */
  pageSize?: number
  /** Class applied to the wrapping div */
  className?: string
  /** Class applied to each item wrapper div */
  itemClassName?: string
  /** Rendered when items array is empty */
  emptyState?: React.ReactNode
}

export function PaginatedList<T>({
  items,
  renderItem,
  keyExtractor,
  progressLabel,
  pageSize,
  className,
  itemClassName,
  emptyState,
}: PaginatedListProps<T>) {
  const { isADHDMode, PAGE_SIZE } = useADHDMode()
  const effectivePageSize = isADHDMode ? (pageSize ?? PAGE_SIZE) : items.length || 1

  const { page, totalPages, visibleItems, hasNext, hasPrev, nextPage, prevPage } =
    usePagination(items, { pageSize: effectivePageSize })

  if (items.length === 0) {
    return <>{emptyState ?? null}</>
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* ── ADHD progress label ────────────────────────────────────────────── */}
      {isADHDMode && progressLabel && (
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary-ink">
          {progressLabel}
        </p>
      )}

      {/* ── Items ─────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleItems.map((item, i) => (
          <motion.div
            key={keyExtractor(item, i)}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className={itemClassName}
          >
            {renderItem(item, i)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Pagination controls — only in ADHD mode, only when multi-page ─── */}
      {isADHDMode && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={prevPage}
            disabled={!hasPrev}
            aria-label="Previous page"
            className="p-2.5 rounded-full bg-surface-card border border-border-subtle text-content-secondary
                       disabled:opacity-30 hover:border-primary/30 hover:text-primary-ink transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm font-bold text-content-secondary tabular-nums">
            <span className="text-primary-ink">{page + 1}</span>
            <span className="text-content-muted mx-1">/</span>
            {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={!hasNext}
            aria-label="Next page"
            className="p-2.5 rounded-full bg-surface-card border border-border-subtle text-content-secondary
                       disabled:opacity-30 hover:border-primary/30 hover:text-primary-ink transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
