# Life To Do — Theming System

> **iCCW #5** · Semantic token architecture, 4-state ADHD matrix, FOUC prevention, WCAG AA compliance.

---

## Overview

The app supports four rendering states:

| | Default | ADHD Mode |
|---|---|---|
| **Dark** | `:root` tokens, no `.adhd-mode` | `:root` tokens + `.adhd-mode` typography scale |
| **Light** | `[data-theme="light"]` overrides | `[data-theme="light"]` + `.adhd-mode` |

Theme switching is **zero-re-render**: CSS custom properties cascade instantly when `data-theme` changes on `<html>`. No React state is involved in the colour switch.

---

## Architecture

```
localStorage ('ltd-theme')
       │  ← read synchronously before first paint (FOUC script in layout.tsx)
       ▼
<html data-theme="dark|light">
       │  ← CSS custom properties resolve against this attribute
       ▼
:root { --surface-base: #0F0F1A }            ← dark baseline (globals.css)
[data-theme="light"] { --surface-base: #F4F6FB }  ← light overrides
       │
       ▼
tailwind.config.ts:  'surface-base': 'var(--surface-base)'
       │
       ▼
components: className="bg-surface-base"  ← reads the live CSS var
```

The `useTheme` hook keeps the DB preference (Dexie `settings.theme`) in sync with the DOM attribute and the localStorage mirror.

---

## CSS Token Reference

### Surface

| Token | CSS Var | Dark | Light |
|---|---|---|---|
| `bg-surface-base` | `--surface-base` | `#0F0F1A` | `#F4F6FB` |
| `bg-surface-card` | `--surface-card` | `#1A1A2E` | `#FFFFFF` |
| `bg-surface-elevated` | `--surface-elevated` | `#232342` | `#EDF1F9` |

### Text

| Token | CSS Var | Dark | Light | Contrast (on card) |
|---|---|---|---|---|
| `text-content-primary` | `--text-primary` | `#F5F5F5` | `#0F0F1A` | 15.65 / 19.03 ✅ |
| `text-content-secondary` | `--text-secondary` | `#94A3B8` | `#4B5563` | 6.65 / 7.56 ✅ |
| `text-content-muted` | `--text-tertiary` | `#64748B` | `#5C6A7A` | 3.58⚠️ / 5.53 ✅ |
| `text-content-inverse` | `--text-on-brand` | `#0F0F1A` | `#0F0F1A` | 11.85 on cyan ✅ |
| `text-primary-ink` | `--primary-ink` | `#00E5CC` | `#007A6E` | 10.62 / 5.24 ✅ |

> ⚠️ `text-content-muted` in dark is 3.58:1 — passes for large text (≥18pt) only. Use for timestamps, captions. For smaller muted text, use `text-content-secondary`.

### Status

| Token | CSS Var | Dark | Light | Contrast on card |
|---|---|---|---|---|
| `text-status-success` | `--status-ok-fg` | `#4ADE80` | `#15803D` | 9.79 / 5.02 ✅ |
| `text-status-warning` | `--status-warn-fg` | `#FACC15` | `#B45309` | 11.14 / 5.02 ✅ |
| `text-status-error` | `--status-danger-fg` | `#F87171` | `#DC2626` | 6.17 / 4.83 ✅ |

### Overlays

| Token | CSS Var | Dark | Light |
|---|---|---|---|
| `bg-overlay-hover` | `--overlay-hover` | `rgba(255,255,255,0.05)` | `rgba(15,15,26,0.04)` |
| `bg-overlay-active` | `--overlay-active` | `rgba(0,229,204,0.10)` | `rgba(0,229,204,0.08)` |
| `bg-overlay-dim` | `--overlay-dim` | `rgba(0,0,0,0.20)` | `rgba(15,15,26,0.08)` |

### Borders

| Class | CSS Var | Dark | Light |
|---|---|---|---|
| `border-border-subtle` | `--border-subtle` | `rgba(255,255,255,0.06)` | `rgba(15,15,26,0.08)` |
| `border-border-default` | `--border-default` | `rgba(255,255,255,0.10)` | `rgba(15,15,26,0.12)` |
| `border-border-strong` | `--border-brand` | `rgba(0,229,204,0.20)` | `rgba(0,122,110,0.25)` |

---

## ADHD Mode Overlays

ADHD mode is a **typography + spacing overlay** on top of the active theme. It does not define new colour tokens — it inherits whichever theme is active.

Applied via `.adhd-mode` class on the root `<div>` in `ClientLayout`. The `data-adhd="true"` attribute on `<html>` triggers lighter surface/contrast tweaks in `globals.css`:

```css
[data-theme="light"][data-adhd="true"] {
  --surface-base: #FAF8F5;   /* warm cream — reduces blue-light */
  --text-primary: #2D3748;   /* off-black — slightly lower contrast */
  --primary:      #00BFAE;   /* desaturated cyan */
}
[data-theme="dark"][data-adhd="true"] {
  --surface-base: #161626;   /* less stark dark */
  --text-primary: #E2E8F0;   /* off-white */
  --primary:      #00C8B3;   /* less saturated */
}
```

---

## FOUC Prevention

The inline `<script>` in `src/app/layout.tsx` runs **synchronously before the first paint**:

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

This ensures the correct CSS custom properties resolve before any stylesheet paint. `suppressHydrationWarning` on `<html>` silences the React SSR/CSR attribute mismatch.

---

## Glass Utilities

All `.glass-*` classes are CSS-var driven and switch automatically:

| Class | Purpose |
|---|---|
| `.glass-card` | Standard task card surface |
| `.glass-card-purple` | Accent/secondary surface |
| `.glass-panel` | Modal / bottom-sheet overlay |
| `.glass-header` | Sticky header surface |
| `.active-glow` | Primary element glow (mic, CTA) |
| `.active-glow-purple` | Secondary glow (focus timer) |

---

## ThemeToggle Component

```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Renders a dropdown with Light / Dark / System options.
// Place in the settings page or any persistent header.
<ThemeToggle />
```

---

## JS/SVG Colour Access

For Recharts, SVG strokes, Canvas 2D, or any context that cannot read Tailwind classes:

```ts
import { TOKEN_VAR, getThemeValues } from '@/lib/themeTokens'

// Option A — CSS var reference (auto-reactive, zero JS overhead)
<circle stroke={TOKEN_VAR.statusOk} />

// Option B — resolved hex (for Chart.js, OffscreenCanvas, etc.)
const { statusOk } = getThemeValues('dark')  // '#4ADE80'
```

---

## Adding a New Token

1. Add the CSS var to `:root` in `globals.css`
2. Add a light-mode override in `[data-theme="light"]` if needed
3. Add the Tailwind mapping in `tailwind.config.ts` under the appropriate group
4. Reference `TOKEN_VAR` in `themeTokens.ts` for JS/SVG access
5. Run `npx tsc --noEmit && npm run build` to confirm

---

## WCAG AA Compliance Matrix

All contrast ratios measured against the respective card surface.

| State | Pair | Ratio | Status |
|---|---|---|---|
| Dark | Primary text | 15.65:1 | ✅ AAA |
| Dark | Secondary text | 6.65:1 | ✅ AA |
| Dark | Muted text | 3.58:1 | ⚠️ Large only |
| Dark | Primary ink | 10.62:1 | ✅ AAA |
| Dark | Status success | 9.79:1 | ✅ AAA |
| Dark | Status warning | 11.14:1 | ✅ AAA |
| Dark | Status error | 6.17:1 | ✅ AA |
| Light | Primary text | 19.03:1 | ✅ AAA |
| Light | Secondary text | 7.56:1 | ✅ AA |
| Light | Muted text | 5.53:1 | ✅ AA |
| Light | Primary ink | 5.24:1 | ✅ AA |
| Light | Status success | 5.02:1 | ✅ AA |
| Light | Status warning | 5.02:1 | ✅ AA |
| Light | Status error | 4.83:1 | ✅ AA |
| Both | Text-on-brand on cyan | 11.85:1 | ✅ AAA |
