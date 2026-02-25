// plugins/index.ts
// Barrel export — iCCW #4 Plugin Architecture layer
export { registerPlugin, getPlugin, hasPlugin,
         listPlugins, getPluginStatus,
         initializePlugins, teardownPlugins }     from './registry'
export { usePlugin }                             from './usePlugin'
export { CalendarPlugin }                        from './integrations/CalendarPlugin'
export { AICapturePlugin }                       from './integrations/AICapturePlugin'
export type {
  LifeToDoPlugin,
  CalendarPluginInterface,
  AICapturePluginInterface,
  CalendarEvent,
  AICaptureResult,
  PluginTier,
  PluginStatus,
}                                                from './types'
