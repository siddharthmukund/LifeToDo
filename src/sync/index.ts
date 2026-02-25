// sync/index.ts
// Barrel export — iCCW #4 Delta Sync layer
export { calculateDelta, pendingSyncCount }          from './deltaCalculator'
export { enqueue, dequeue, dequeueRecord,
         getQueue, getRetryableQueue,
         queueCount, markFailed, purgeExhausted }    from './syncQueue'
export { resolveConflict, resolveConflicts }         from './conflictResolver'
export { useSyncStatus }                             from './useSyncStatus'
export type { DeltaPayload }                         from './deltaCalculator'
export type { ConflictWinner, ConflictResult,
              Timestamped }                          from './conflictResolver'
export type { SyncStatus, SyncStatusCode }           from './useSyncStatus'
