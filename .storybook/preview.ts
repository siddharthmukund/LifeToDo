// .storybook/preview.ts
import type { Preview } from '@storybook/react'

// Apply the app's global CSS to all stories
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark',  value: '#0F0F1A' },
        { name: 'light', value: '#FFFFFF' },
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
