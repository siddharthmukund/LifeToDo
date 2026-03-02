# Deliverable 1: Current Color Usage Map

## 1A: Color Inventory
Based on scanning all `src/components/` and `src/app/` `.tsx` files for hardcoded color utility classes:

| Component Category | Hardcoded Color Classes Found | Count |
|--------------------|------------------------------|-------|
| `ui/*` (Atoms) | `bg-white/5`, `bg-card-dark`, `text-slate-500`, `text-white`, `border-white/10`, `bg-primary`, `bg-red-500/20`, etc. | ~45 instances |
| `layout/*` | `bg-background-dark`, `text-slate-500`, `text-primary`, `bg-primary/15`, `border-primary/20`, `bg-yellow-500` | ~25 instances |
| `today/*` (ActionCard) | `bg-card-dark`, `text-white`, `border-white/10`, `text-slate-400`, `text-slate-500`, `border-l-primary`, etc. | ~30 instances |
| `app/page.tsx` | `text-slate-500`, `bg-yellow-500/10`, `border-yellow-500/20`, `text-white`, `bg-card-dark`, `border-white/5` | ~20 instances |
| `app/review/*` | `text-yellow-500`, `bg-card-dark`, `text-slate-400`, `bg-background-dark`, `text-primary`, `border-white/5` | ~40 instances |
| `app/settings/*` | `bg-card-dark`, `text-slate-500`, `bg-white/5`, `border-white/8`, `bg-red-500/10`, `text-red-500` | ~30 instances |
| `app/projects/*` | `text-slate-500`, `text-white`, `bg-yellow-500/10`, `border-white/10`, `text-slate-400` | ~25 instances |

*Total hardcoded class usages to migrate: ~215 instances.*

## 1B: Unique Colors Extracted

| Current Class | Equivalent Hex / Var | Usage | Semantic Purpose |
|---------------|----------------------|-------|------------------|
| `bg-background-dark` | `var(--surface-base)` | bg | App shell background |
| `bg-card-dark` | `var(--surface-card)` | bg | Standard card/panel background |
| `bg-white/5` | `rgba(255,255,255,0.05)` | bg | Subtle hover/empty state |
| `text-white` | `#ffffff` | text | Primary text on dark |
| `text-slate-300` | `#cbd5e1` | text | Secondary elevated text |
| `text-slate-400` | `#94a3b8` | text | Secondary/muted text |
| `text-slate-500` | `#64748b` | text | Tertiary/caption text |
| `border-white/5` | `rgba(255,255,255,0.05)` | border | Subtle dividers |
| `border-white/10` | `rgba(255,255,255,0.10)` | border | Standard element borders |
| `text-primary` | `var(--primary)` | text | Primary brand accent text |
| `bg-primary` | `var(--primary)` | bg | Primary brand background |
| `bg-primary/10`, `/15`, `/20` | `var(--primary) + alpha` | bg | Interactive active states |
| `text-yellow-500` | `#eab308` | text | Warning / Waiting / Stale |
| `bg-yellow-500/10` | `rgba(234, 179, 8, 0.10)` | bg | Warning card background |
| `text-red-500` | `#ef4444` | text | Danger / Destructive |
| `bg-red-500/10` | `rgba(239, 68, 68, 0.10)` | bg | Danger background |
| `text-green-500` | `#22c55e` | text | Success text |

## 1C: Component-Level Theme Sensitivity

| Component / Route | Complexity | Notes |
|-------------------|------------|-------|
| `ui/Button.tsx` | High | Uses explicit map of color variants (`primary`, `secondary`, `danger`, `ghost`). Needs structural update to use semantics. |
| `ui/Card.tsx` | Medium | Relies heavily on `bg-card-dark` and `border-white/5`. |
| `ui/ContextChip.tsx` | Low | Uses `bg-white/5`, `border-white/10`. Standard semantic updates. |
| `today/ActionCard.tsx` | High | Uses context-specific borders and text colors (e.g. `border-l-primary`, `text-slate-400`). Needs careful mapping. |
| `layout/SideNav.tsx` / `BottomNav.tsx` | Medium | Heavy use of `<Icon>` fills and background borders. Uses CSS vars via `bg-background-dark`. |
| `app/review/page.tsx` | High | Very heavy use of `bg-card-dark`, `text-slate-400`, `text-yellow-500` (for stale items). |
| `app/settings/page.tsx` | Medium | Lots of `text-[10px] text-slate-500` labels. Needs strict mapping to `--text-secondary`/`tertiary`. |
| `app/inbox/page.tsx` | Medium | Focuses heavily on the giant recording UI which mostly uses `var(--primary)` and is pseudo-semantic. |

---
**Status:** Audit complete. Awaiting user review before generating `src/lib/themeTokens.ts` and updating `tailwind.config.ts`.
