# Feature Flags

Feature flags live in `src/flags/`. They control tier-gated and experimental functionality without requiring a code deploy to enable or disable features.

## How Flags Work

Each flag is a boolean value resolved at runtime from the user's active tier (`free` | `pro`). Flags are defined in `src/flags/flags.ts` and consumed via the `useFeatureFlag` hook or the `FeatureGate` component.

## Flag Catalogue

| Flag Key | Free | Pro | Description |
|---|---|---|---|
| `insights_charts` | No | Yes | Recharts analytics dashboard |
| `recurring_tasks` | No | Yes | Recurring task schedules |
| `cloud_sync` | No | Yes | Cross-device Supabase sync |
| `ai_capture` | No | Yes | AI-assisted capture parsing |
| `calendar_plugin` | No | Yes | Calendar integration plugin |
| `weekly_review_export` | No | Yes | Export review as PDF/Markdown |
| `quick_capture_widget` | Yes | Yes | Home-screen widget |
| `dark_mode` | Yes | Yes | Theme toggle |

## Adding a New Flag

1. Add the key and tier requirement to `src/flags/flags.ts`:

```ts
export const FLAGS = {
  my_new_flag: { requiredTier: 'pro' },
} satisfies FlagCatalogue;
```

2. Consume it in a component:

```tsx
// Hook
const enabled = useFeatureFlag('my_new_flag');

// Gate component
<FeatureGate flag="my_new_flag">
  <MyProFeature />
</FeatureGate>
```

## Pro Tier Enforcement

The `useFeatureFlag` hook reads `userStore.tier`. If `tier === 'free'` and the flag requires Pro, the hook returns `false` and the `FeatureGate` renders the optional `fallback` prop instead.

**Never manually set a Pro flag to `true` for a Free user** in application code. Tier upgrades must flow through the billing flow which updates `userStore.tier` and persists to Dexie.
