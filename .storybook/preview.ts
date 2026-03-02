// .storybook/preview.ts
// iCCW #5: ThemeDecorator added — all stories now render in both Dark and
// Light themes side-by-side (or switchable via the toolbar globe icon).
import type { Preview, Decorator } from '@storybook/react'
import '../src/app/globals.css'

// ── ThemeDecorator ───────────────────────────────────────────────────────────
// Reads the `theme` global from the Storybook toolbar and applies
// data-theme on the story wrapper, mirroring how the real app works.
const ThemeDecorator: Decorator = (Story, context) => {
  const theme: string = context.globals?.theme ?? 'dark'
  return (
    Object.assign(document.createElement('div'), {
      setAttribute: (k: string, v: string) => {
        document.documentElement.setAttribute(k, v)
      },
    }),
    // Set data-theme on the root so CSS vars resolve correctly
    (() => {
      document.documentElement.setAttribute('data-theme', theme)
    })(),
    Story()
  ) as ReturnType<typeof Story>
}

const preview: Preview = {
  decorators: [ThemeDecorator],

  // ── Global toolbar ─────────────────────────────────────────────────────────
  globalTypes: {
    theme: {
      name:        'Theme',
      description: 'Light / Dark theme switcher',
      defaultValue: 'dark',
      toolbar: {
        icon:  'globe',
        items: [
          { value: 'dark',  title: '🌙 Dark'  },
          { value: 'light', title: '☀️ Light' },
        ],
        showName: true,
      },
    },
  },

  parameters: {
    backgrounds: {
      // Backgrounds sync with the theme global so the canvas colour matches
      default: 'dark',
      values: [
        { name: 'dark',  value: '#0F0F1A' },
        { name: 'light', value: '#F4F6FB' },
      ],
    },
    actions:  { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
  },
}

export default preview
