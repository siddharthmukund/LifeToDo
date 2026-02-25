import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story   = { args: { children: 'Capture', variant: 'primary' } }
export const Secondary: Story = { args: { children: 'Cancel', variant: 'secondary' } }
export const Ghost: Story     = { args: { children: 'Skip', variant: 'ghost' } }
export const Danger: Story    = { args: { children: 'Delete', variant: 'danger' } }
export const Loading: Story   = { args: { children: 'Saving…', loading: true } }
export const FullWidth: Story = { args: { children: 'Continue', fullWidth: true } }
