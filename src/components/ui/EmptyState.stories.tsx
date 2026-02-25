import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const InboxZero: Story = {
  args: { title: 'Inbox Zero!', description: 'Everything captured and clarified.', emoji: '🎉' }
}
export const NoActions: Story = {
  args: { title: 'Nothing next', description: 'Add an action to get started.', emoji: '⚡' }
}
