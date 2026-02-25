// logger/index.ts
// Barrel export — iCCW #4 Structured Logging layer
export { logger }                        from './logger'
export { getLogs, getRecentLogs,
         clearLogs, pushLog }            from './logStore'
export type { LogEntry, LogLevel }       from './logStore'
