// plugins/registry.ts
// Singleton plugin registry.
// Plugins register themselves at app boot; core hooks retrieve them here.
// Requesting an unregistered plugin returns a no-op stub — never throws.

import type { LifeToDoPlugin, PluginStatus } from './types'

// ── No-op stub ────────────────────────────────────────────────────────────────

const NO_OP_PLUGIN: LifeToDoPlugin = {
  id:           '__noop__',
  name:         'No-op Plugin',
  tier:         'free',
  initialize:   async () => {},
  teardown:     async () => {},
  isAvailable:  ()        => false,
}

// ── Registry ──────────────────────────────────────────────────────────────────

const registry  = new Map<string, LifeToDoPlugin>()
const statusMap = new Map<string, PluginStatus>()

/**
 * Register a plugin.
 * If a plugin with the same id is already registered it is replaced.
 */
export function registerPlugin(plugin: LifeToDoPlugin): void {
  registry.set(plugin.id, plugin)
  statusMap.set(plugin.id, 'registered')
}

/**
 * Retrieve a registered plugin.
 * Returns a no-op stub if the plugin is not registered or unavailable.
 */
export function getPlugin(id: string): LifeToDoPlugin {
  return registry.get(id) ?? NO_OP_PLUGIN
}

/** Check whether a plugin is registered (not necessarily initialized) */
export function hasPlugin(id: string): boolean {
  return registry.has(id)
}

/** List all registered plugin ids */
export function listPlugins(): string[] {
  return Array.from(registry.keys())
}

/** Get the current status of a plugin */
export function getPluginStatus(id: string): PluginStatus {
  return statusMap.get(id) ?? 'unavailable'
}

/**
 * Initialize all registered plugins that declare isAvailable() === true.
 * Call once after app boot (after settings are loaded).
 *
 * @param userTier  Current user tier — Pro-only plugins skip init for Free users
 */
export async function initializePlugins(userTier: 'free' | 'pro'): Promise<void> {
  for (const [id, plugin] of registry) {
    if (plugin.tier === 'pro' && userTier === 'free') {
      statusMap.set(id, 'unavailable')
      continue
    }
    if (!plugin.isAvailable()) {
      statusMap.set(id, 'unavailable')
      continue
    }
    try {
      await plugin.initialize()
      statusMap.set(id, 'initialized')
    } catch {
      statusMap.set(id, 'error')
    }
  }
}

/**
 * Teardown all initialized plugins.
 * Call on app unmount / logout.
 */
export async function teardownPlugins(): Promise<void> {
  for (const [id, plugin] of registry) {
    if (statusMap.get(id) === 'initialized') {
      try { await plugin.teardown() } catch { /* non-critical */ }
      statusMap.set(id, 'registered')
    }
  }
}
