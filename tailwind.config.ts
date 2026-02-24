import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // New Premium Design Tokens
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        'background-dark': 'var(--background-dark)',
        'card-dark': 'var(--card-dark)',

        // Legacy GTD Life design tokens (keep for compatibility during transition)
        gtd: {
          bg: 'var(--background-dark)',
          surface: 'var(--card-dark)',
          border: 'rgba(255,255,255,0.08)',
          accent: 'var(--primary)', // Map old accent to new primary
          'accent-light': '#818CF8',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          waiting: '#F59E0B',
          someday: '#A855F7',
          muted: '#6B7280',
          text: '#F5F5F5',
          'text-muted': '#9CA3AF',
        },
      },
      fontSize: {
        'adhd-sm': ['1.3125rem', '1.75rem'],  // 14px * 1.5 = 21px
        'adhd-base': ['1.5rem', '2rem'],      // 16px * 1.5 = 24px
        'adhd-lg': ['1.6875rem', '2.25rem'],  // 18px * 1.5 = 27px
        'adhd-xl': ['1.875rem', '2.5rem'],    // 20px * 1.5 = 30px
        'adhd-2xl': ['2.25rem', '2.75rem'],   // 24px * 1.5 = 36px
      },
      fontFamily: {
        sans: [
          'Manrope',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        display: ['Manrope', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounceIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow-accent': '0 0 20px rgba(99,102,241,0.3)',
        'glow-success': '0 0 20px rgba(34,197,94,0.3)',
        'premium': '0 20px 50px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}

export default config
