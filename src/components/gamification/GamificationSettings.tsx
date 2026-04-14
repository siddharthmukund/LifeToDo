'use client';

import { useGamificationStore } from '@/gamification/gamificationStore';

export function GamificationSettings() {
    const preferences = useGamificationStore(state => state.preferences);
    const updatePreferences = useGamificationStore(state => state.updatePreferences);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Gamification</h3>
                    <p className="text-sm text-content-secondary">Enable levels, achievements, and XP system.</p>
                </div>
                <input
                    type="checkbox"
                    checked={preferences.enabled}
                    onChange={(e) => updatePreferences({ enabled: e.target.checked })}
                    className="h-5 w-5 rounded border-border-default accent-primary cursor-pointer"
                />
            </div>

            <div className={`space-y-4 pl-4 border-l-2 border-border-subtle transition-opacity ${preferences.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-content-secondary">Show XP Progress Bar</span>
                    <input
                        type="checkbox"
                        checked={preferences.showXPBar}
                        onChange={(e) => updatePreferences({ showXPBar: e.target.checked })}
                        className="h-4 w-4 rounded border-border-default accent-primary cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-content-secondary">Milestone Animations</span>
                    <select
                        value={preferences.celebrationIntensity}
                        onChange={(e) => updatePreferences({ celebrationIntensity: e.target.value as any })}
                        className="text-sm border border-border-default rounded-md bg-surface-card text-content-primary px-2 py-1"
                    >
                        <option value="full">Full screen overlays</option>
                        <option value="subtle">Subtle notifications</option>
                        <option value="none">Off</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-content-secondary">Daily Challenges</span>
                    <input
                        type="checkbox"
                        checked={preferences.showChallenges}
                        onChange={(e) => updatePreferences({ showChallenges: e.target.checked })}
                        className="h-4 w-4 rounded border-border-default accent-primary cursor-pointer"
                    />
                </div>

            </div>
        </div>
    );
}
