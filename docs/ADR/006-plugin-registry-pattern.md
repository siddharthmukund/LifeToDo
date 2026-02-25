# ADR 006 — Plugin Registry Pattern

**Status:** Accepted
**Date:** 2025-02-05

## Context

Several Pro-tier capabilities (Calendar integration, AI Capture, future third-party integrations) are optional and should not be bundled into the core app shell. These capabilities need a consistent lifecycle (init, teardown) and a way for core hooks to interact with them without creating hard import dependencies that would inflate the eager bundle.

## Decision

Implement a **singleton Map-based plugin registry** in `src/plugins/registry.ts`. The registry maps plugin IDs to `LifeToDoPlugin` instances. When core code calls `usePlugin('calendar')`, the registry either returns the real plugin or a **no-op stub** that silently swallows all method calls. Core hooks never need to check whether a plugin is registered — the stub handles the absent case transparently.

```ts
// No-op stub returned for unregistered plugins
const noOpPlugin: LifeToDoPlugin = {
  id: 'noop', name: 'No-Op', tier: 'free',
  initialize: async () => {},
  teardown: async () => {},
  isAvailable: () => false,
};
```

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Direct imports in components | Creates hard coupling; plugin code enters the eager bundle. |
| React Context for plugin instances | Requires Provider wrapping; makes server components awkward. |
| Event bus / pub-sub | Good for plugin-to-plugin communication but too loose for lifecycle management. |

## Consequences

**Positive:**
- Core hooks remain decoupled from concrete plugin implementations.
- Safe for progressive enhancement — missing plugins never throw.
- Plugins are loaded lazily and registered at runtime, keeping the eager bundle small.

**Negative:**
- Plugins cannot communicate with each other directly (intentional architectural boundary).
- Debugging requires knowing which plugins are currently registered; a `registry.list()` helper is provided for development.
