// src/components/profile/RoleBadge.tsx
'use client'

import { ROLE_PRESETS } from '@/components/onboarding/rolePresets'
import type { UserRole } from '@/types'

interface RoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md'
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const preset = ROLE_PRESETS[role]
  if (!preset) return null

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5'

  return (
    <span className={`inline-flex items-center rounded-full font-semibold
      bg-primary/10 text-primary-ink border border-primary/20 ${sizeClass}`}>
      <span>{preset.emoji}</span>
      <span>{preset.label}</span>
    </span>
  )
}
