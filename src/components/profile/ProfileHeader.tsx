// src/components/profile/ProfileHeader.tsx
'use client'

import { User } from 'lucide-react'
import { RoleBadge } from './RoleBadge'
import type { UserProfile } from '@/types'

interface ProfileHeaderProps {
  profile: UserProfile
  healthScore?: number
}

function HealthRing({ score }: { score: number }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 80 ? 'var(--status-ok-fg)' : score >= 60 ? 'var(--primary-ink)' : score >= 40 ? 'var(--status-warn-fg)' : 'var(--status-danger-fg)'

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ProfileHeader({ profile, healthScore }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {healthScore !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <HealthRing score={healthScore} />
          </div>
        )}
        <div className="w-14 h-14 rounded-full bg-primary/15 border-2 border-primary/20
                        flex items-center justify-center overflow-hidden">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={24} className="text-primary-ink" />
          )}
        </div>
        {healthScore !== undefined && (
          <span className="absolute -bottom-1 -right-1 text-[10px] font-bold
                           bg-surface-card border border-border-default rounded-full
                           w-5 h-5 flex items-center justify-center text-content-primary">
            {healthScore}
          </span>
        )}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold text-content-primary truncate">
          {profile.displayName || 'Anonymous'}
        </h2>
        {profile.email && (
          <p className="text-xs text-content-secondary truncate">{profile.email}</p>
        )}
        <div className="mt-1.5">
          <RoleBadge role={profile.role} size="sm" />
        </div>
      </div>
    </div>
  )
}
