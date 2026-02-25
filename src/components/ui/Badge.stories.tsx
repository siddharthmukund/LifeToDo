import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story   = { args: { children: 'Default' } }
export const Primary: Story   = { args: { children: 'Primary', color: 'primary' } }
export const Warning: Story   = { args: { children: '3 stale', color: 'warning' } }
export const Success: Story   = { args: { children: 'Done', color: 'success' } }
