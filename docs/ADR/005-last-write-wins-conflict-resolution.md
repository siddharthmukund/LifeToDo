# ADR 005 — Last-Write-Wins Conflict Resolution

**Status:** Accepted
**Date:** 2025-02-01

## Context

Pro tier users can sync tasks across multiple devices via Supabase. When the same task is edited on two devices during a network partition, a conflict resolution strategy is required to determine which version is the authoritative record when connectivity is restored.

## Decision

Use **Last-Write-Wins (LWW)** conflict resolution. Every task record carries an `updatedAt` ISO timestamp. On sync, the record with the later `updatedAt` value overwrites the record with the earlier value, regardless of which fields changed.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Operational Transformation | Requires a central server to sequence operations; adds significant backend complexity. |
| CRDTs (Conflict-free Replicated Data Types) | Correct for concurrent edits but far too complex for v1; library support for Dexie is immature. |
| Manual conflict UI | Asking users to manually resolve conflicts is poor UX for a task app. |
| Field-level LWW | More granular but requires per-field timestamps, increasing schema complexity significantly. |

## Consequences

**Positive:**
- Simple to implement and reason about.
- Correct for the overwhelmingly common case: a single user, editing on one device at a time.
- No server-side merge logic required.

**Negative:**
- If a user edits the same task on two devices within the same second (or with clock skew), one edit will be silently lost.
- Does not handle structural conflicts (e.g., a task deleted on Device A while edited on Device B) — deletion currently wins if the delete timestamp is later.
