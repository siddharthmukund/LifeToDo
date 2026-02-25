import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ProgressBar>

export const HalfDone: Story   = { args: { value: 3, max: 7, label: '3 of 7 tasks' } }
export const Complete: Story   = { args: { value: 5, max: 5, color: 'success' } }
export const Warning: Story    = { args: { value: 1, max: 7, color: 'warning' } }
export const Small: Story      = { args: { value: 2, max: 5, size: 'sm', showLabel: false } }
