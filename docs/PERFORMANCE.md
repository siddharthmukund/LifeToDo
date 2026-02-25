# Performance

Performance monitoring lives in `src/perf/`. The goal is to keep the app fast on mid-range mobile hardware with a slow 3G connection.

## Core Web Vitals

Life To Do uses the `web-vitals` library to measure all five metrics:

| Metric | Target | Measured By |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5 s | `onLCP` |
| CLS (Cumulative Layout Shift) | < 0.1 | `onCLS` |
| FCP (First Contentful Paint) | < 1.8 s | `onFCP` |
| INP (Interaction to Next Paint) | < 200 ms | `onINP` |
| TTFB (Time to First Byte) | < 800 ms | `onTTFB` |

Metrics are written to `analytics_events` in Dexie. Pro users with cloud sync enabled can view trends in the Insights dashboard.

## JS Heap Sampling

In Chrome-based browsers, `src/perf/heapSampler.ts` polls `performance.memory.usedJSHeapSize` every 30 seconds. Readings above 80 MB trigger a `PERFORMANCE_WARNING` log entry.

## Utility Functions

```ts
// Measure synchronous render time
measureRender('ActionCard', () => render(<ActionCard task={task} />));

// Wrap any async function with timing
const timedFetch = withTiming('dexie:loadInbox', fetchInboxTasks);
```

Both utilities write to the logger at the `debug` level.

## Bundle Budget

| Chunk | Budget (gzip) | Strategy |
|---|---|---|
| Eager (app shell) | < 150 KB | Tree-shaken core only |
| `recharts` | Lazy | Loaded only on `/insights` route |
| `framer-motion` | Shared | Deferred hydration |

## Code Splitting

Next.js route-based splitting is the primary mechanism. Heavy dependencies are loaded via `next/dynamic` with `ssr: false` where appropriate:

```ts
const InsightsPage = dynamic(() => import('@/components/InsightsPage'), { ssr: false });
```
