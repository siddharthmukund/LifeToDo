# Error Handling

Structured error handling lives in `src/errors/` with logging in `src/logger/`.

## Error Taxonomy

All application errors carry one of six error codes:

| Code | Severity | Meaning |
|---|---|---|
| `CAPTURE_FAILED` | DEGRADED | Failed to write a task to Dexie |
| `SYNC_FAILED` | DEGRADED | Supabase sync round-trip failed |
| `STORAGE_FULL` | CRITICAL | IndexedDB quota exceeded |
| `PLUGIN_ERROR` | DEGRADED | A plugin threw during init or teardown |
| `PARSE_ERROR` | DEGRADED | AI or import parsing produced invalid output |
| `RENDER_ERROR` | CRITICAL | React render threw (caught by ErrorBoundary) |

## Severity Levels

- **CRITICAL** — The user cannot continue the affected workflow. A blocking modal is shown.
- **DEGRADED** — The app continues but with reduced functionality. A toast notification is shown.

## ErrorBoundary

Wrap route segments or heavy component trees:

```tsx
<ErrorBoundary code="RENDER_ERROR" fallback={<ErrorFallback />}>
  <InsightsPage />
</ErrorBoundary>
```

## useErrorHandler Hook

```ts
const { reportError } = useErrorHandler();
try {
  await db.tasks.add(task);
} catch (e) {
  reportError({ code: 'CAPTURE_FAILED', cause: e, userMessage: 'Could not save task. Please try again.' });
}
```

## reportError / reportNativeError

- `reportError(AppError)` — structured internal errors.
- `reportNativeError(Error)` — wraps unknown JS errors, infers the closest error code.

Both functions write to the `error_log` Dexie table and call the logger.

## User-Facing vs Technical Messages

Every `AppError` carries two message fields:

- `userMessage` — plain English, shown in the UI. No stack traces, no internal identifiers.
- `technicalMessage` — full context, written only to `error_log`, never displayed.
