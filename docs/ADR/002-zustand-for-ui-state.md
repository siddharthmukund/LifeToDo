# ADR 002 — Zustand for UI State Management

**Status:** Accepted
**Date:** 2025-01-15

## Context

Life To Do needs reactive global state for UI concerns: the currently selected project, filter settings, the open/closed state of the ClarifyFlow wizard, user tier, and similar transient data. The choice of state management library affects bundle size, developer ergonomics, and long-term maintainability.

## Decision

Use **Zustand** for all UI state management. Each domain gets its own store file in `src/store/` (e.g., `taskStore.ts`, `uiStore.ts`, `userStore.ts`). Stores expose typed selectors and action functions. Components subscribe to exactly the slices they need, minimising unnecessary re-renders.

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Redux Toolkit | Significant boilerplate; Provider tree adds ceremony; overkill for a single-user app. |
| React Context | Re-renders all consumers on every state change unless memoised manually; does not scale. |
| Jotai | Atom granularity is useful but adds complexity compared to Zustand's store-per-domain pattern. |
| MobX | Implicit reactivity via proxies is harder to trace in TypeScript; larger runtime. |

## Consequences

**Positive:**
- Minimal boilerplate — a store is a plain function call.
- No Provider wrapping required anywhere in the component tree.
- Simple selector pattern (`useTaskStore(s => s.inbox)`) with built-in shallow equality.
- Tiny bundle footprint (~1 KB gzip).

**Negative:**
- No built-in time-travel debugging (Redux DevTools are available but require a middleware add-on).
- Stores are global singletons, which can complicate testing if stores are not reset between test cases.
