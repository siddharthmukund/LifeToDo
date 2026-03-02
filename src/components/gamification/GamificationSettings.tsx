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
                    <p className="text-sm text-zinc-500">Enable levels, achievements, and XP system.</p>
                </div>
                <input
                    type="checkbox"
                    checked={preferences.enabled}
                    onChange={(e) => updatePreferences({ enabled: e.target.checked })}
                    className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
            </div>

            <div className={`space-y-4 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 transition-opacity ${preferences.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Show XP Progress Bar</span>
                    <input
                        type="checkbox"
                        checked={preferences.showXPBar}
                        onChange={(e) => updatePreferences({ showXPBar: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-600 cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Milestone Animations</span>
                    <select
                        value={preferences.celebrationIntensity}
                        onChange={(e) => updatePreferences({ celebrationIntensity: e.target.value as any })}
                        className="text-sm border-zinc-200 dark:border-zinc-700 rounded-md bg-transparent dark:bg-zinc-900"
                    >
                        <option value="full">Full screen overlays</option>
                        <option value="subtle">Subtle notifications</option>
                        <option value="none">Off</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Daily Challenges</span>
                    <input
                        type="checkbox"
                        checked={preferences.showChallenges}
                        onChange={(e) => updatePreferences({ showChallenges: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-600 cursor-pointer"
                    />
                </div>

            </div>
        </div>
    );
}
