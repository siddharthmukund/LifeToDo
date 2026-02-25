import type { Meta, StoryObj } from '@storybook/react'
import { StreakCalendar } from './StreakCalendar'

const meta: Meta<typeof StreakCalendar> = {
  title: 'UI/StreakCalendar',
  component: StreakCalendar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof StreakCalendar>

const today = new Date()
function daysAgo(n: number) {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export const WithStreak: Story = {
  args: {
    completedDates: [daysAgo(0), daysAgo(7), daysAgo(14), daysAgo(21)],
    weeks: 6,
  }
}
export const Empty: Story = {
  args: { completedDates: [], weeks: 6 }
}
