// sync/conflictResolver.ts
// Conflict resolution strategy: Last-Write-Wins (LWW).
// When a local record and a remote record diverge, the one with the
// later updatedAt / capturedAt timestamp wins.
//
// This is appropriate for a personal GTD app where the same user works
// across multiple devices. For shared/collaborative data a CRDT approach
// would be necessary (out of scope for current tier).

// ── Types ─────────────────────────────────────────────────────────────────────

export type Timestamped = {
  id:         string
  updatedAt?: Date | string
  capturedAt?: Date | string
}

export type ConflictWinner = 'local' | 'remote' | 'equal'

export interface ConflictResult<T extends Timestamped> {
  winner:  ConflictWinner
  record:  T
  reason:  string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toMs(value: Date | string | undefined): number {
  if (!value) return 0
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

function getTs(record: Timestamped): number {
  return toMs(record.updatedAt) || toMs(record.capturedAt) || 0
}

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * Resolve a conflict between a local and remote version of the same record.
 * The record with the later timestamp wins. If timestamps are equal, local wins
 * (optimistic — trust the device that has the record in hand).
 *
 * @example
 * const { record } = resolveConflict(localAction, remoteAction)
 * await db.actions.put(record)
 */
export function resolveConflict<T extends Timestamped>(
  local:  T,
  remote: T,
): ConflictResult<T> {
  const localTs  = getTs(local)
  const remoteTs = getTs(remote)

  if (localTs > remoteTs) {
    return { winner: 'local',  record: local,  reason: `local  ts ${localTs} > remote ts ${remoteTs}` }
  }
  if (remoteTs > localTs) {
    return { winner: 'remote', record: remote, reason: `remote ts ${remoteTs} > local  ts ${localTs}` }
  }
  return { winner: 'equal', record: local, reason: 'timestamps equal — local wins by tiebreak' }
}

/**
 * Resolve a batch of conflicts.
 * Returns a map of recordId → winning record.
 */
export function resolveConflicts<T extends Timestamped>(
  pairs: Array<{ local: T; remote: T }>,
): Map<string, T> {
  const result = new Map<string, T>()
  for (const { local, remote } of pairs) {
    const { record } = resolveConflict(local, remote)
    result.set(record.id, record)
  }
  return result
}
