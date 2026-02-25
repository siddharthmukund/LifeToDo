// logger/logStore.ts
// In-memory circular buffer for log entries.
// Keeps the last MAX_ENTRIES entries so they can be displayed in-app (Pro insights)
// or exported for bug reports. Never persisted to IndexedDB (volatile by design).

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level:   LogLevel
  message: string
  args:    unknown[]
  ts:      number
}

const MAX_ENTRIES = 200
const buffer: LogEntry[] = []

// ── Public API ────────────────────────────────────────────────────────────────

export function pushLog(entry: LogEntry): void {
  buffer.push(entry)
  if (buffer.length > MAX_ENTRIES) {
    buffer.splice(0, buffer.length - MAX_ENTRIES)
  }
}

export function getLogs(level?: LogLevel): LogEntry[] {
  if (!level) return [...buffer]
  return buffer.filter(e => e.level === level)
}

export function clearLogs(): void {
  buffer.splice(0)
}

export function getRecentLogs(n = 50): LogEntry[] {
  return buffer.slice(-n)
}
