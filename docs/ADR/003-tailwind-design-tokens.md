# ADR 003 — Tailwind Custom Design Tokens

**Status:** Accepted
**Date:** 2025-01-20

## Context

The app uses a bespoke dark-mode-first colour palette designed in Figma. Colours need to be usable in Tailwind utility classes, stay consistent across components, be tree-shaken in production, and have IDE autocomplete support. The design hand-off uses semantic layer names (e.g., "background-dark", "card-elevated") rather than raw hex values.

## Decision

Define all brand colours as **custom Tailwind tokens** in `tailwind.config.ts` under `theme.extend.colors`. Token names mirror Figma layer names exactly so that designers and developers share a common vocabulary.

```ts
colors: {
  'background-dark': '#0F0F1A',
  'card-dark':       '#1A1A2E',
  'card-elevated':   '#252540',
  'primary':         '#00E5CC',
  'accent':          '#9D4EDD',
}
```

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| CSS custom properties (`--color-primary`) | No IDE autocomplete in Tailwind class strings; harder to purge unused variables. |
| Inline styles | Not purged; verbose; breaks responsive/state variants. |
| CSS Modules with variables | Requires importing a stylesheet per component; loses Tailwind's utility composability. |

## Consequences

**Positive:**
- Full IDE autocomplete for all custom tokens.
- Tailwind's JIT engine purges unused colour utilities automatically.
- Token names match Figma, reducing translation errors during design hand-off.
- Theming changes require only a single edit in `tailwind.config.ts`.

**Negative:**
- Runtime theme switching (e.g., user-defined accent colours) would require CSS variables instead; custom Tailwind tokens are static.
