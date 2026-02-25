import type { Meta, StoryObj } from '@storybook/react'
import { EnergyToggle } from './EnergyToggle'

const meta: Meta<typeof EnergyToggle> = {
  title: 'UI/EnergyToggle',
  component: EnergyToggle,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof EnergyToggle>

export const Unselected: Story = { args: { value: null, onChange: () => {} } }
export const HighSelected: Story = { args: { value: 'high', onChange: () => {} } }
export const LowSelected: Story  = { args: { value: 'low', onChange: () => {} } }
