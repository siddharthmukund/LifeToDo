'use client'
// plugins/usePlugin.ts
// React hook for accessing registered plugins.
// Returns the plugin if registered and initialized; a typed no-op if not.
// Components depend on the plugin interface, not a specific implementation —
// this enables swapping plugins without touching UI code.

import { useMemo } from 'react'
import { getPlugin, getPluginStatus } from './registry'
import type { LifeToDoPlugin, PluginStatus } from './types'

interface UsePluginResult<T extends LifeToDoPlugin> {
  plugin:    T
  status:    PluginStatus
  isReady:   boolean   // true only when status === 'initialized'
}

/**
 * Access a registered plugin.
 *
 * @param id  Plugin id (e.g. 'calendar', 'ai-capture')
 *
 * @example
 * const { plugin, isReady } = usePlugin<CalendarPluginInterface>('calendar')
 * if (!isReady) return null
 * const events = await plugin.fetchEvents(start, end)
 */
export function usePlugin<T extends LifeToDoPlugin = LifeToDoPlugin>(
  id: string
): UsePluginResult<T> {
  const plugin = useMemo(() => getPlugin(id) as T, [id])
  const status = getPluginStatus(id)

  return {
    plugin,
    status,
    isReady: status === 'initialized',
  }
}
