import type { Meta, StoryObj } from '@storybook/react'
import { HealthScoreRing } from './HealthScoreRing'

const meta: Meta<typeof HealthScoreRing> = {
  title: 'UI/HealthScoreRing',
  component: HealthScoreRing,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof HealthScoreRing>

export const Excellent: Story = { args: { score: 92 } }
export const Good: Story      = { args: { score: 78 } }
export const Fair: Story      = { args: { score: 61 } }
export const Low: Story       = { args: { score: 40 } }
export const Critical: Story  = { args: { score: 18 } }
export const Large: Story     = { args: { score: 85, size: 160 } }
