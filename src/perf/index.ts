// perf/index.ts
// Barrel export — iCCW #4 Performance Monitoring layer
export { initPerformanceMonitoring, prunePerfLogs } from './monitor'
export { measureRender, withTiming }                from './renderTracker'
export { startMemoryWatcher }                       from './memoryWatcher'
export { usePerformance }                           from './usePerformance'
export type { }                                     from './usePerformance'
