import type { Meta, StoryObj } from '@storybook/react'
import { ContextChip } from './ContextChip'

const meta: Meta<typeof ContextChip> = {
  title: 'UI/ContextChip',
  component: ContextChip,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ContextChip>

export const Default: Story  = { args: { name: '@home', emoji: '🏠' } }
export const Active: Story   = { args: { name: '@computer', emoji: '💻', active: true } }
export const Phone: Story    = { args: { name: '@phone', emoji: '📱' } }
