# Architecture Overview

Life To Do is a Next.js 16 Progressive Web App built around an **offline-first** design philosophy. All user data lives locally; the network is optional.

## Data Flow

```
Dexie (IndexedDB) → Zustand stores → React components
```

1. **Dexie** is the single source of truth. Tables: `tasks`, `projects`, `contexts`, `waiting_for`, `someday`, `weekly_reviews`, `analytics_events`, `error_log`.
2. **Zustand stores** subscribe to Dexie live queries and expose reactive slices to the UI.
3. **React components** read from Zustand selectors and dispatch actions that write back to Dexie.

## Route Map

| Route | Purpose |
|---|---|
| `/` | Today dashboard — due tasks and focus queue |
| `/inbox` | Capture landing — unprocessed items |
| `/waiting` | Waiting For list |
| `/projects` | Project hierarchy and next-actions |
| `/review` | Weekly Review wizard |
| `/settings` | User preferences and Pro tier |
| `/insights` | Analytics charts (Recharts, lazy-loaded) |
| `/someday` | Someday/Maybe backlog |

## Enhancement Layers

Five optional layers augment the core without coupling to it:

1. **Analytics** — local Dexie event store, no third-party SDK.
2. **Performance** — Core Web Vitals + JS heap sampling via `src/perf/`.
3. **Feature Flags** — tier-gated capabilities via `src/flags/`.
4. **Plugins** — extensible registry via `src/plugins/`.
5. **Errors / Logger** — structured taxonomy via `src/errors/` and `src/logger/`.

## PWA Caching Strategy

- **App shell** (HTML, JS, CSS) — `CacheFirst`, versioned cache name.
- **API routes** — `NetworkFirst` with 5 s timeout, Dexie fallback.
- **Static assets** — `StaleWhileRevalidate`.

## Design Token System

Tokens are defined in `tailwind.config.ts` and mirror Figma layer names:

| Token | Value | Usage |
|---|---|---|
| `background-dark` | `#0F0F1A` | Page background |
| `primary` | `#00E5CC` | CTA, active states |
| `accent` | `#9D4EDD` | Secondary highlights |
| `card-dark` | `#1A1A2E` | Card surfaces |
| `card-elevated` | `#252540` | Elevated cards |
