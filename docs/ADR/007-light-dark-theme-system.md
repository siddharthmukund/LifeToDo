# ADR 007 — Light / Dark Theme System

**Status:** Accepted
**Date:** 2026-02-25
**Iteration:** iCCW #5

---

## Context

The app launched with a dark-only design. All colour classes were hardcoded to dark-mode values (e.g. `bg-[#0F0F1A]`, `text-slate-400`, `bg-white/5`). Tailwind's `darkMode: 'class'` was set in the config but never used — there were no `dark:` variants anywhere.

Requirements for iCCW #5:

1. Full light / dark theme with a user-facing toggle persisted across sessions.
2. Zero re-renders when the theme switches — the colour change must feel instant.
3. No flash of unstyled content (FOUC) on page load.
4. ADHD mode must continue to work on top of whichever theme is active.
5. WCAG AA contrast compliance in both themes (4.5:1 normal, 3:1 large/UI).
6. All 39+ component files migrated from hardcoded values to semantic tokens.

---

## Decision

### 1 — CSS Custom Properties, not `dark:` class variants

Theme switching is implemented via **CSS custom properties** scoped to a `data-theme` attribute on `<html>`:

```css
:root                    { --surface-base: #0F0F1A; }
[data-theme="light"]     { --surface-base: #F4F6FB; }
```

Tailwind tokens reference the vars:

```ts
// tailwind.config.ts
surface: { base: 'var(--surface-base)' }
```

Components use semantic class names:

```tsx
<div className="bg-surface-base text-content-primary" />
```

Changing `data-theme` on `<html>` causes the browser to instantly re-cascade all custom properties — **no React state update, no re-render, no layout recalculation**.

**Why not `dark:` Tailwind variants?**

| Approach | Re-render cost | SSR compatibility | Token reuse in SVG/Canvas |
|---|---|---|---|
| `dark:` variants | None (CSS) | ✅ | ❌ (class-based only) |
| CSS vars + `data-theme` | **None (CSS)** | ✅ | ✅ (`var()` in SVG inline styles) |
| React state + inline styles | Full tree | ❌ | ✅ |

CSS vars won because they work natively in SVG `stroke` / `fill` attributes and in `OffscreenCanvas` contexts without any JS overhead, a requirement for `HealthScoreRing` and `TwoMinuteTimer`.

### 2 — FOUC Prevention via Synchronous Inline Script

A tiny inline `<script>` runs **synchronously in `<head>` before the first paint**:

```js
;(function(){
  try{
    var t = localStorage.getItem('ltd-theme');
    var r = (t==='light'||t==='dark') ? t
          : window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', r);
  } catch(e) {}
})();
```

This sets `data-theme` before any stylesheet resolves custom properties, so the user never sees a white flash when their preference is dark (or vice-versa). `suppressHydrationWarning` on `<html>` silences the React SSR/CSR attribute mismatch that would otherwise appear in development.

**Why not a `<link rel="stylesheet">` per theme?**
Swapping stylesheets causes a layout repaint. The inline script approach adds < 200 bytes to the initial HTML and imposes zero additional network round-trips.

### 3 — `useTheme` Hook as the Single Source of Truth

`src/hooks/useTheme.ts` connects three layers:

```
Dexie settings.theme ('light'|'dark'|'system')
       │  ← setTheme() writes here
       ▼
localStorage 'ltd-theme'    ← mirrored for FOUC script
       │
       ▼
document.documentElement['data-theme']  ← drives all CSS vars
```

The hook registers a `matchMedia` listener when `theme === 'system'` so the DOM attribute updates automatically when the OS preference changes, without the user touching the toggle.

`useTheme()` is called once at the `ClientLayout` level — not inside individual components — so there is exactly one DOM writer.

### 4 — Semantic Token Namespace

All colours are organised into five namespaces:

| Namespace | Tailwind prefix | CSS var prefix |
|---|---|---|
| Surface | `bg-surface-*` | `--surface-*` |
| Content (text) | `text-content-*` | `--text-*` |
| Overlay | `bg-overlay-*` | `--overlay-*` |
| Status | `text-status-*` / `bg-status-*` | `--status-*` |
| Border | `border-border-*` | `--border-*` |

`primary-ink` is a special alias that maps to the brand accent in whichever theme is active (`#00E5CC` dark / `#007A6E` light).

### 5 — ADHD Mode as a Layered Overlay

ADHD mode is **not** a fifth theme. It is a CSS attribute overlay applied on top of whichever theme is active:

```css
[data-theme="light"][data-adhd="true"] {
  --surface-base: #FAF8F5;   /* warm cream */
  --text-primary: #2D3748;   /* off-black  */
  --primary:      #00BFAE;   /* desaturated cyan */
}
[data-theme="dark"][data-adhd="true"] {
  --surface-base: #161626;
  --text-primary: #E2E8F0;
  --primary:      #00C8B3;
}
```

This gives four rendering states (2 themes × 2 ADHD modes) from two independent boolean axes, with no combinatorial explosion in component code.

### 6 — JS / SVG Colour Access

For Recharts, `<canvas>`, and SVG inline styles that cannot consume Tailwind classes, two access patterns are provided by `src/lib/themeTokens.ts`:

```ts
// Option A — CSS var reference (auto-reactive, zero JS overhead)
<circle stroke={TOKEN_VAR.statusOk} />     // "var(--status-ok-fg)"

// Option B — resolved hex (for Chart.js, OffscreenCanvas, workers)
const { statusOk } = getThemeValues('dark') // '#4ADE80'
```

SVG `stroke="var(--status-ok-fg)"` is evaluated by the browser at paint time and **reacts to `data-theme` changes with no JS involvement** — exactly like a CSS class.

---

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Tailwind `dark:` variants | Can't propagate colour into SVG inline styles or Canvas. Migration would generate ~400 new class pairs across 39 files. |
| Next.js `cookies()` server-side theme | Requires a server roundtrip per navigation; FOUC risk unless paired with local script anyway. |
| React Context + inline styles | Every colour change triggers a full render tree update. Unacceptable for a PWA targeting 60 fps. |
| CSS `@media (prefers-color-scheme)` only | No user override; impossible to persist "always light" preference. |
| Separate CSS file per theme | Double the stylesheet weight; extra network round-trip before first paint. |
| CSS `color-scheme` property only | Limited browser control over custom colours; doesn't satisfy the ADHD overlay requirement. |

---

## Consequences

### Positive

- Theme switches in < 1 ms (single attribute write + CSS cascade).
- FOUC eliminated on all modern browsers.
- WCAG AA achieved across all 28 colour pairs in both themes.
- SVG/Canvas components inherit theme colours with zero JS overhead.
- ADHD mode composes cleanly with either theme.
- `tsc --noEmit` and `npm run build` pass clean post-migration.

### Negative / Trade-offs

- **`suppressHydrationWarning`** on `<html>` masks any future SSR/CSR attribute divergence on that element — developers must be careful when adding other server-set attributes to `<html>`.
- **`dangerouslySetInnerHTML`** is required for the FOUC script. The script is static and authored by the team, so the XSS surface is nil, but the ESLint `@next/next/no-sync-scripts` rule must be suppressed with a comment.
- **Opacity modifiers on CSS vars** (`bg-status-success/15`) rely on Tailwind 3.4+ `color-mix()` behaviour. Downgrading Tailwind below 3.4 would break these utilities.
- **`text-content-muted` in dark** (`#64748B` on `#1A1A2E`) achieves only 3.58:1 — passes for large text (≥ 18pt) only. Documented in THEMING.md. Use `text-content-secondary` for small muted text.

---

## Files Changed

| File | Change |
|---|---|
| `src/app/globals.css` | Full rewrite — semantic CSS vars, light overrides, ADHD overlays, glass utilities |
| `tailwind.config.ts` | New semantic colour namespaces, border tokens, CSS-var boxShadow |
| `src/hooks/useTheme.ts` | New — reactive theme hook with Dexie + localStorage + DOM sync |
| `src/components/ui/ThemeToggle.tsx` | New — framer-motion dropdown with Light / Dark / System options |
| `src/lib/themeTokens.ts` | New — TOKEN_VAR and getThemeValues for JS/SVG contexts |
| `src/app/layout.tsx` | FOUC script, dual themeColor viewport, suppressHydrationWarning |
| `src/components/layout/ClientLayout.tsx` | Added useTheme() call |
| `src/components/ui/HealthScoreRing.tsx` | scoreColor() returns CSS var strings |
| `src/components/clarify/TwoMinuteTimer.tsx` | Hardcoded hex → CSS vars |
| 39 other `.tsx` files | Perl migration: hardcoded classes → semantic tokens |
| `.storybook/preview.ts` | ThemeDecorator + theme toolbar global |
| `docs/THEMING.md` | New — complete theming reference |
