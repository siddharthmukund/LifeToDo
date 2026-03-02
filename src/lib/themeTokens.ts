// src/lib/themeTokens.ts
// iCCW #5 — Semantic token registry.
//
// TOKEN_VAR: CSS custom-property references for use in JS/SVG inline styles
//   (Recharts stroke, SVG fill, Canvas, dynamic style objects).
//   Browser evaluates var() at render time, so theme switches are instant.
//
// THEME_VALUES: Resolved hex/rgba for contexts that require a concrete colour
//   string (e.g. Chart.js, OffscreenCanvas). Re-export the active set with
//   getThemeValues(resolvedTheme).

// ── CSS variable references ───────────────────────────────────────────────

export const TOKEN_VAR = {
  // Brand
  primary:         'var(--primary)',
  primaryInk:      'var(--primary-ink)',
  accent:          'var(--accent)',

  // Surface
  surfaceBase:     'var(--surface-base)',
  surfaceCard:     'var(--surface-card)',
  surfaceElevated: 'var(--surface-elevated)',

  // Text
  textPrimary:     'var(--text-primary)',
  textSecondary:   'var(--text-secondary)',
  textTertiary:    'var(--text-tertiary)',
  textOnBrand:     'var(--text-on-brand)',

  // Status
  statusOk:        'var(--status-ok-fg)',
  statusWarn:      'var(--status-warn-fg)',
  statusDanger:    'var(--status-danger-fg)',
} as const

export type TokenVar = (typeof TOKEN_VAR)[keyof typeof TOKEN_VAR]

// ── Resolved values per theme ─────────────────────────────────────────────
// Use these only when the browser CSS engine is unavailable (SSR, Canvas 2D,
// unit tests). In the browser, prefer TOKEN_VAR to get automatic reactivity.

export const THEME_VALUES = {
  dark: {
    primary:         '#00E5CC',
    primaryInk:      '#00E5CC',
    surfaceBase:     '#0F0F1A',
    surfaceCard:     '#1A1A2E',
    surfaceElevated: '#232342',
    textPrimary:     '#F5F5F5',
    textSecondary:   '#94A3B8',
    textTertiary:    '#64748B',
    statusOk:        '#4ADE80',
    statusWarn:      '#FACC15',
    statusDanger:    '#F87171',
  },
  light: {
    primary:         '#00E5CC',
    primaryInk:      '#007A6E',
    surfaceBase:     '#F4F6FB',
    surfaceCard:     '#FFFFFF',
    surfaceElevated: '#EDF1F9',
    textPrimary:     '#0F0F1A',
    textSecondary:   '#4B5563',
    textTertiary:    '#9CA3AF',
    statusOk:        '#15803D',
    statusWarn:      '#B45309',
    statusDanger:    '#DC2626',
  },
} as const

export type ResolvedTheme = keyof typeof THEME_VALUES

/** Returns the resolved value map for the given theme. */
export function getThemeValues(theme: ResolvedTheme) {
  return THEME_VALUES[theme]
}
