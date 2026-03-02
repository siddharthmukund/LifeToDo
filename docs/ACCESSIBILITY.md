# Life To Do — Accessibility Guide

> **Target:** WCAG 2.2 Level AA
> **Implemented:** iCCW #13 (March 2026)
> **Status:** All 31 Gate 0 violations resolved

---

## Architecture

All accessibility utilities live in `src/a11y/`. Import from `@/a11y`:

```ts
import { announcer, useAnnounce, FocusTrap, useReducedMotion } from '@/a11y'
import { SafeAnimation, SPRING, INSTANT } from '@/a11y/motion'
```

### Module Map

| File | Purpose |
|---|---|
| `types.ts` | Shared TypeScript types |
| `a11yConfig.ts` | Central config (IDs, sizes, delays) |
| `announcer.ts` | Aria-live singleton |
| `useAnnounce.ts` | React hook wrapping the announcer |
| `useFocusManagement.ts` | Focus trap hook (Tab cycling, Escape) |
| `FocusTrap.tsx` | Component wrapper for focus trapping |
| `useReducedMotion.ts` | Resolves OS + ADHD Mode motion preference |
| `useKeyboardNavigation.ts` | Global keyboard shortcut registry |
| `useTouchTarget.ts` | Dev-only touch target validator |
| `SkipLink.tsx` | Skip navigation component |
| `LiveRegion.tsx` | Aria-live DOM nodes |
| `motion/motionConfig.ts` | Framer Motion preset transitions |
| `motion/SafeAnimation.tsx` | Animation wrapper respecting reduced motion |

---

## Skip Navigation

A `<SkipLink />` is rendered in `app/layout.tsx` as the very first element inside `<body>`. It provides two skip targets:

- **Skip to main content** → `#main-content` (the `<main>` element)
- **Skip to navigation** → `#bottom-nav` (the bottom tab bar)

The link is visually hidden until focused — it becomes a green pill in the top-left corner on Tab press.

---

## Screen Reader Announcements

Use the `announcer` singleton or the `useAnnounce` hook to send messages to screen readers without moving focus.

```ts
// Singleton (anywhere, including outside React)
import { announcer } from '@/a11y'
announcer.announce('Task saved')                      // polite
announcer.announceError('Could not connect to server') // assertive

// Hook (inside React components)
const { announce, announceAction, announceError } = useAnnounce()
announceAction('Task completed: Buy groceries')
```

**Route changes** are announced automatically in `ClientLayout.tsx` via `announcer.announceRoute()` — no per-page code needed.

---

## Focus Management

All dialogs, bottom sheets, and drawers must use the `FocusTrap` component:

```tsx
<FocusTrap active={isOpen} onEscape={closeModal}>
  <div role="dialog" aria-modal="true" aria-labelledby="title-id">
    <h2 id="title-id">Modal Title</h2>
    …
  </div>
</FocusTrap>
```

This handles:
- Saving `document.activeElement` on open
- Moving focus to the first focusable child (or `initialFocusRef`)
- Tab / Shift+Tab cycling within the trap
- Escape key forwarded to `onEscape`
- Restoring focus on close

---

## Reduced Motion

Two independent axes control animation reduction:

| Axis | Source | Check |
|---|---|---|
| **Vestibular safety** | OS `prefers-reduced-motion: reduce` | `prefersReducedMotion` |
| **Cognitive load** | App ADHD Mode toggle | `adhdModeEnabled` |

Both are merged into `shouldReduceMotion`:

```ts
const { shouldReduceMotion } = useReducedMotion()

<motion.div
  transition={shouldReduceMotion ? INSTANT : SPRING}
  variants={shouldReduceMotion ? FADE_VARIANTS : SLIDE_UP_VARIANTS}
/>
```

Or use `SafeAnimation` for automatic adaptation:

```tsx
import { SafeAnimation } from '@/a11y/motion'

<SafeAnimation animation="modalSheet">
  <motion.div variants={SLIDE_UP_VARIANTS} transition={SPRING} />
</SafeAnimation>
```

CSS animations are disabled globally via `@media (prefers-reduced-motion: reduce)` in `globals.css`.

---

## Touch Targets

All interactive elements must meet **44×44 CSS pixels** (WCAG 2.5.8).

### Solutions

| Pattern | Usage |
|---|---|
| `min-h-[44px]` | Buttons, links with enough padding |
| `.touch-target-44` | Expands hit area via `::before` pseudo-element without changing visual size |
| `min-h-[44px] min-w-[44px]` | Explicit both-axis enforcement |

Dev-only validator — attach to any element for console warnings:

```ts
const ref = useTouchTarget('My Button')
<button ref={ref}>Click</button>
```

Full-page audit:
```ts
import { auditTouchTargets } from '@/a11y'
auditTouchTargets() // logs all violations to console
```

---

## Non-Color Indicators

Status information must never be conveyed by color alone (WCAG 1.4.1).

### `AIBadge` Confidence Levels

| Score | Color | Icon | SR Text |
|---|---|---|---|
| ≥ 0.8 | Green | `CheckCircle2` | "High confidence" |
| ≥ 0.5 | Yellow | `AlertCircle` | "Medium confidence" |
| < 0.5 | Gray | `MinusCircle` | "Low confidence" |

### Energy Levels (ActionCard)

A `sr-only` energy label is added to the accessible name of every task card:

> "Complete task: Buy groceries — High energy, in Personal"

---

## Keyboard Navigation

Register global shortcuts via `useKeyboardNavigation`:

```ts
useKeyboardNavigation([
  {
    id:      'capture',
    label:   'Open Capture',
    key:     'k',
    ctrlKey: true,
    handler: () => router.push('/capture'),
  },
])
```

Shortcuts are automatically unregistered on component unmount.

---

## Focus Indicator

All interactive elements show a `2px solid var(--primary)` outline on `:focus-visible`. This is defined globally in `globals.css` and should not be overridden with `outline: none`.

Use `focus-visible:ring-*` Tailwind classes for custom focus rings on specific components.

---

## Component Checklist

When building a new component, verify:

- [ ] Interactive elements are semantic (`<button>`, `<a>`, `<input>`) — no `<div onClick>`
- [ ] Icon-only buttons have `aria-label`
- [ ] All icons have `aria-hidden="true"`
- [ ] Forms have associated `<label>` elements (not just placeholder)
- [ ] Error messages use `role="alert"` or `aria-live="assertive"`
- [ ] Success messages use `announcer.announceAction()`
- [ ] Dialogs/modals use `<FocusTrap>`, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Touch targets are ≥ 44px or use `.touch-target-44`
- [ ] Animations respect `shouldReduceMotion`
- [ ] Status conveyed by color also has icon + sr-only text
- [ ] Run `axe` in dev tools (axe DevTools extension or `auditTouchTargets()`)
