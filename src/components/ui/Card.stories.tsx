import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story  = { args: { children: 'Card content here', title: 'My Card' } }
export const Elevated: Story = { args: { children: 'Elevated surface', elevated: true } }
