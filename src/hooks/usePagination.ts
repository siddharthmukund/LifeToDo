'use client'
// usePagination — pure pagination logic, no UI.
// Accepts any array and a page size; returns the visible slice + navigation helpers.
// Consumed by PaginatedList.tsx to handle both ADHD and standard modes.

import { useState, useMemo, useCallback, useEffect } from 'react'

interface UsePaginationOptions {
  /** How many items to show per page. */
  pageSize: number
}

export interface PaginationResult<T> {
  /** 0-indexed current page. */
  page: number
  totalPages: number
  visibleItems: T[]
  hasNext: boolean
  hasPrev: boolean
  /** Jump to exact page (0-indexed, clamped to valid range). */
  goToPage: (n: number) => void
  nextPage: () => void
  prevPage: () => void
  /** Reset to page 0 — call when items list or filter changes. */
  reset: () => void
}

export function usePagination<T>(
  items: T[],
  { pageSize }: UsePaginationOptions,
): PaginationResult<T> {
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // Keep current page in valid range when list shrinks
  const safePage = Math.min(page, totalPages - 1)

  // Sync internal state if safePage differs (items removed)
  useEffect(() => {
    if (safePage !== page) setPage(safePage)
  }, [safePage, page])

  const visibleItems = useMemo(
    () => items.slice(safePage * pageSize, (safePage + 1) * pageSize),
    [items, safePage, pageSize],
  )

  const goToPage  = useCallback((n: number) =>
    setPage(Math.max(0, Math.min(n, totalPages - 1))), [totalPages])
  const nextPage  = useCallback(() => setPage(p => Math.min(p + 1, totalPages - 1)), [totalPages])
  const prevPage  = useCallback(() => setPage(p => Math.max(p - 1, 0)), [])
  const reset     = useCallback(() => setPage(0), [])

  return {
    page:         safePage,
    totalPages,
    visibleItems,
    hasNext:      safePage < totalPages - 1,
    hasPrev:      safePage > 0,
    goToPage,
    nextPage,
    prevPage,
    reset,
  }
}
