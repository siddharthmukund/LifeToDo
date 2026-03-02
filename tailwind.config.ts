import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

// ─────────────────────────────────────────────────────────────────────────────
// Life To Do — Tailwind Design Token Config
// Tokens extracted from Figma screen exports (25 screens, Feb 2026).
// All CSS custom properties are defined in globals.css.
// Update hex values there; Tailwind reads them via var() at build time.
// ─────────────────────────────────────────────────────────────────────────────

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',

  theme: {
    extend: {

      // ── Colors ────────────────────────────────────────────────────────────
      colors: {
        // ── Core brand tokens (driven by CSS vars in globals.css) ────────────
        primary: 'var(--primary)',           // Cyan CTA fill
        accent: 'var(--accent)',            // Purple secondary

        // ── iCCW #5 Semantic surface tokens ──────────────────────────────────
        surface: {
          base: 'var(--surface-base)',
          card: 'var(--surface-card)',
          elevated: 'var(--surface-elevated)',
        },

        // ── iCCW #5 Semantic text tokens ─────────────────────────────────────
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-tertiary)',
          inverse: 'var(--text-on-brand)',
        },
        'primary-ink': 'var(--primary-ink)',

        // ── iCCW #5 Semantic overlay tokens ──────────────────────────────────
        overlay: {
          hover: 'var(--overlay-hover)',
          active: 'var(--overlay-active)',
          dim: 'var(--overlay-dim)',
        },

        // ── iCCW #5 Status tokens ─────────────────────────────────────────────
        status: {
          success: 'var(--status-ok-fg)',
          warning: 'var(--status-warn-fg)',
          error: 'var(--status-danger-fg)',
          info: '#3B82F6',
        },

        // ── Legacy backward-compat aliases (component migration in D4) ────────
        'background-dark': 'var(--surface-base)',
        'card-dark': 'var(--surface-card)',
        'card-elevated': 'var(--surface-elevated)',

        // ── Semantic palette (static — not theme-overridden) ─────────────────
        success: '#22C55E',
        warning: '#FFB84D',
        danger: '#FF4444',
        purple: '#9D4EDD',

        // ── Legacy GTD Life tokens (backward compatibility) ───────────────────
        gtd: {
          bg: 'var(--surface-base)',
          surface: 'var(--surface-card)',
          elevated: 'var(--surface-elevated)',
          border: 'var(--border-subtle)',
          accent: 'var(--primary)',
          'accent-light': 'var(--primary)',
          success: '#22C55E',
          warning: '#FFB84D',
          danger: '#FF4444',
          waiting: '#FFB84D',
          someday: '#9D4EDD',
          muted: 'var(--text-secondary)',
          text: 'var(--text-primary)',
          'text-muted': 'var(--text-secondary)',
        },
      },

      // ── Border Colours ───────────────────────────────────────────────────
      borderColor: {
        border: {
          default: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-brand)',
        },
        brand: 'var(--border-brand)',
        'status-ok': 'var(--status-ok-border)',
        'status-warn': 'var(--status-warn-border)',
        'status-danger': 'var(--status-danger-border)',
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: [
          'Manrope',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        // font-display: used for page titles + heavy headings
        display: ['Manrope', 'sans-serif'],
      },

      fontSize: {
        // ── ADHD Mode scale — 1.5× all standard sizes ──────────────────────
        // Applied automatically via .adhd-mode CSS overrides in globals.css
        'adhd-xs': ['0.9375rem', { lineHeight: '1.375rem' }], // 15px
        'adhd-sm': ['1.125rem', { lineHeight: '1.625rem' }], // 18px
        'adhd-base': ['1.3125rem', { lineHeight: '1.875rem' }], // 21px
        'adhd-lg': ['1.5rem', { lineHeight: '2rem' }], // 24px
        'adhd-xl': ['1.6875rem', { lineHeight: '2.25rem' }], // 27px
        'adhd-2xl': ['2.25rem', { lineHeight: '2.75rem' }], // 36px
      },

      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        // Figma screens use generous rounding — all standard Tailwind values
        // are fine; these extend the scale for component-specific use.
        '4xl': '2rem',   // 32px — large prominent cards
        '5xl': '2.5rem', // 40px — extra-large sheets / modals
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        // Safe area + nav
        'nav': '4rem',   // 64px — bottom nav height
        'header': '5.5rem', // 88px — sticky header height (status bar + title)
        // Touch targets
        'touch': '2.75rem', // 44px — minimum tap target
        'mic': '5rem',    // 80px — hero mic button
        'fab': '3.5rem',  // 56px — floating action button
      },

      // ── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        // iCCW #5: Glow shadows now use CSS vars — auto-reduce in light theme
        'glow-primary': '0 0 20px var(--glow-primary-shadow)',
        'glow-primary-lg': '0 0 32px var(--glow-primary-shadow-lg)',
        'glow-accent': '0 0 20px var(--glow-accent-shadow)',
        'glow-purple': '0 0 24px var(--glow-purple-shadow)',
        'glow-success': '0 0 20px var(--glow-success-shadow)',
        'glow-warning': '0 0 16px var(--glow-warning-shadow)',

        // Elevation / depth
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'inner-dark': 'inset 0 -1px 0 rgba(0, 0, 0, 0.20)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.55)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.35)',
      },

      // ── Animations ────────────────────────────────────────────────────────
      animation: {
        // Existing — keep
        'fade-in': 'fadeIn 0.25s ease-out both',
        'bounce-in': 'bounceIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.3s ease-out both',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        // New — mic recording rings (concentric growing rings)
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'pulse-ring-2': 'pulseRing 1.5s ease-out 0.5s infinite',

        // Subtle shimmer for skeleton loaders
        'shimmer': 'shimmer 1.8s linear infinite',

        // Spin for loaders
        'spin-slow': 'spin 2s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Growing concentric ring animation — mic recording state
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '80%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // ── Backdrop blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: '4px',
      },

      // ── Transition timing ─────────────────────────────────────────────────
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
      },
    },
  },

  plugins: [
    /**
     * iCCW #13 — Touch Target Expansion (WCAG 2.5.8)
     *
     * .touch-target-44  — expands the hit area to 44×44px using a ::before
     *                      pseudo-element, without changing visual size.
     *                      Requires `position: relative` on the element.
     *
     * .touch-target-min — same as above but uses 24×24px (WCAG 2.5.8 floor).
     *
     * Usage: <button class="touch-target-44 relative">...</button>
     */
    plugin(({ addUtilities }) => {
      addUtilities({
        '.touch-target-44': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '44px',
            minHeight: '44px',
          },
        },
        '.touch-target-min': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '24px',
            minHeight: '24px',
          },
        },
      })
    }),
  ],
}

export default config
