'use client'
// analytics/useTrackAction.ts
// Thin hook wrapping track() — memoised so it's safe to use in dependency arrays.

import { useCallback } from 'react'
import { track } from './tracker'
import type { GTDEventName, EventProps } from './events'

/**
 * Returns a stable `track` function for use in components and hooks.
 *
 * @example
 * const track = useTrackAction()
 * const handleComplete = () => {
 *   completeAction(id)
 *   track('next_action_completed', { energy: 'high', timeEstimate: 15 })
 * }
 */
export function useTrackAction() {
  return useCallback(
    (name: GTDEventName, props?: EventProps) => { void track(name, props) },
    [],
  )
}
