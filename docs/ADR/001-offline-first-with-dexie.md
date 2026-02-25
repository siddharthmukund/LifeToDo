# ADR 001 — Offline-First with Dexie.js

**Status:** Accepted
**Date:** 2025-01-15

## Context

Life To Do is a GTD productivity app that users interact with throughout the day, including in environments with unreliable or absent network connectivity (commutes, flights, underground car parks). All task management operations must work without a network connection. Data must persist across browser sessions and survive page reloads.

## Decision

Use **Dexie.js** as the single source of truth, backed by the browser's IndexedDB API. Zustand stores act as reactive projections of Dexie data — they subscribe to Dexie live queries and re-render components when underlying records change. No application state that the user would consider "their data" is held exclusively in memory.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| `localStorage` | 5–10 MB quota is too small for a full task database with history. |
| Firestore / Supabase realtime | Requires a network connection; adds latency on every read. |
| Plain `IndexedDB` | Low-level API is error-prone; Dexie provides migrations, transactions, and live queries. |
| SQLite (WASM) | Large WASM binary (~1.5 MB) hurts initial load; Dexie covers the required query patterns. |

## Consequences

**Positive:**
- Full offline support out of the box.
- Zero-latency reads — all data is local.
- Dexie's `liveQuery` provides reactive updates that integrate cleanly with Zustand.

**Negative:**
- Schema migrations must be written carefully; a bad migration can corrupt a user's only copy of their data.
- IndexedDB is not shared across origins or browsers, complicating cross-device sync (addressed separately by the cloud sync plugin).
