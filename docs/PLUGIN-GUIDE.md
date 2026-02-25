# Plugin Guide

The plugin system lives in `src/plugins/`. It lets optional capabilities be added to Life To Do without modifying the core data or routing layer.

## LifeToDoPlugin Interface

Every plugin must satisfy the following interface:

```ts
interface LifeToDoPlugin {
  id: string;           // unique slug, e.g. "calendar"
  name: string;         // display name
  tier: 'free' | 'pro'; // minimum required tier
  initialize(): Promise<void>;
  teardown(): Promise<void>;
  isAvailable(): boolean; // runtime availability check (permissions, API keys)
}
```

## Writing a Plugin

1. Create `src/plugins/myPlugin/index.ts` implementing `LifeToDoPlugin`.
2. Expose any React hooks from the same directory (e.g., `useMyPlugin.ts`).
3. Keep all plugin state internal — do not reach into core Zustand stores directly.

## Registering a Plugin

In `src/app/ClientLayout.tsx`, import and register the plugin:

```ts
import { pluginRegistry } from '@/plugins/registry';
import { calendarPlugin } from '@/plugins/calendar';

pluginRegistry.register(calendarPlugin);
```

Registration occurs once on app mount. `initialize()` is called if `isAvailable()` returns `true` and the user's tier meets the requirement.

## Registry Singleton

`src/plugins/registry.ts` exports a singleton `Map<string, LifeToDoPlugin>`. Unregistered plugin IDs return a **no-op stub** — core hooks never throw when a plugin is absent.

## usePlugin Hook

```ts
const calendar = usePlugin('calendar');
calendar.addEvent(task); // no-op if plugin not registered
```

## Example Plugins

- **CalendarPlugin** (`src/plugins/calendar/`) — syncs tasks with `dueDate` to the device calendar via the Web Calendar API.
- **AICapturePlugin** (`src/plugins/aiCapture/`) — parses natural-language input into structured task fields using an LLM endpoint (Pro only).
