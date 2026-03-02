'use client';
import { Trophy } from 'lucide-react';
import { useGamificationStore } from '@/gamification/gamificationStore';
import type { GamificationPreferences } from '@/types/gamification';

function Toggle({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-sm text-content-primary">{label}</p>
        {description && <p className="text-xs text-content-muted">{description}</p>}
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-border-default'}`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

export function GamificationSettingsSection() {
  const preferences = useGamificationStore(s => s.preferences);
  const updatePreferences = useGamificationStore(s => s.updatePreferences);

  function set(partial: Partial<GamificationPreferences>) {
    updatePreferences(partial);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-content-primary flex items-center gap-1.5">
        <Trophy className="w-4 h-4 text-primary" />
        Gamification
      </h3>

      <div className="rounded-xl border border-border-subtle bg-surface-card divide-y divide-border-subtle">
        <Toggle
          label="Enable Gamification"
          description="XP, levels, achievements, and challenges"
          value={preferences.enabled}
          onChange={v => set({ enabled: v })}
        />
        <Toggle
          label="Show XP Bar"
          description="Progress bar in the header"
          value={preferences.showXPBar}
          onChange={v => set({ showXPBar: v })}
          disabled={!preferences.enabled}
        />
        <Toggle
          label="Celebrations"
          description="Animations when you hit milestones"
          value={preferences.showCelebrations}
          onChange={v => set({ showCelebrations: v })}
          disabled={!preferences.enabled}
        />
        <Toggle
          label="Daily Challenges"
          description="Challenge cards on your home screen"
          value={preferences.showChallenges}
          onChange={v => set({ showChallenges: v })}
          disabled={!preferences.enabled}
        />
      </div>

      {preferences.enabled && (
        <div className="rounded-xl border border-border-subtle bg-surface-card px-4 py-3 space-y-2">
          <p className="text-sm text-content-primary">Celebration intensity</p>
          <div className="flex gap-2">
            {(['full', 'subtle', 'none'] as const).map(level => (
              <button
                key={level}
                onClick={() => set({ celebrationIntensity: level })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  preferences.celebrationIntensity === level
                    ? 'bg-primary text-white'
                    : 'bg-border-default text-content-secondary hover:bg-border-default/80'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
