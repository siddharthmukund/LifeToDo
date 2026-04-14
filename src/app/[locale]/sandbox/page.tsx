'use client';

import { useXP } from '@/gamification/useXP';
import { useAchievements } from '@/gamification/useAchievements';
import { useChallenges } from '@/gamification/useChallenges';
import { processXPEvent } from '@/gamification/xpMiddleware';
import { XPAction } from '@/types/gamification';
import { useGamificationStore } from '@/gamification/gamificationStore';
import { ACHIEVEMENTS } from '@/gamification/achievements';
import { db } from '@/lib/db';
import { queueCelebration } from '@/gamification/achievementNotifier'; // Add this line

export default function GamificationSandbox() {
    const { totalXP, currentLevel, isEnabled } = useXP();
    const { achievements, unlockedCount } = useAchievements();
    const { challenges } = useChallenges();
    const { reset } = useGamificationStore();

    if (!isEnabled) {
        return (
            <div className="p-8 text-center text-content-muted">
                Gamification is globally disabled in Settings.
            </div>
        );
    }

    const triggerAction = async (action: XPAction) => {
        // We map raw action keys to themselves because processXPEvent handles falling back
        // to direct XPAction strings if they are valid.
        await processXPEvent(action as any);
    };

    const forceClearData = async () => {
        await db.xp_events.clear();
        await db.achievements_unlocked.clear();
        await db.active_challenges.clear();
        reset();
    };

    const testCelebration = (type: string) => {
        if (type === 'inbox_zero') queueCelebration({ type: 'inbox_zero' });
        if (type === 'review') queueCelebration({ type: 'weekly_review' });
        if (type === 'level_up') queueCelebration({ type: 'level_up', oldLevel: currentLevel, newLevel: currentLevel + 1 });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">

            {/* ── Header ──────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold">Gamification Sandbox</h1>
                    <p className="text-content-secondary">Internal test suite for triggering XP events.</p>
                </div>
                <button
                    onClick={forceClearData}
                    className="px-4 py-2 bg-status-error/10 text-status-error font-medium rounded-lg hover:bg-status-error/20"
                >
                    Nuke Gamification Data
                </button>
            </div>

            {/* ── Status ──────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-surface-card border border-border-default rounded-2xl p-6">
                    <p className="text-xs uppercase tracking-widest font-bold text-content-muted mb-2">Current Level</p>
                    <p className="text-4xl font-bold">{currentLevel}</p>
                    <p className="text-sm font-mono text-primary mt-2">{totalXP} total XP</p>
                </div>
                <div className="bg-surface-card border border-border-default rounded-2xl p-6">
                    <p className="text-xs uppercase tracking-widest font-bold text-content-muted mb-2">Achievements</p>
                    <p className="text-4xl font-bold">{unlockedCount} / {ACHIEVEMENTS.length}</p>
                </div>
                <div className="bg-surface-card border border-border-default rounded-2xl p-6">
                    <p className="text-xs uppercase tracking-widest font-bold text-content-muted mb-2">Active Challenges</p>
                    <p className="text-4xl font-bold">{challenges.length}</p>
                </div>
            </div>

            {/* ── Test Celebrations ─────────────────────────────────────────────── */}
            <section>
                <h2 className="text-xl font-bold mb-4">Test Render Celebrations</h2>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => testCelebration('inbox_zero')} className="px-4 py-2 border rounded-xl hover:bg-overlay-hover">
                        Inbox Zero
                    </button>
                    <button onClick={() => testCelebration('review')} className="px-4 py-2 border rounded-xl hover:bg-overlay-hover">
                        Weekly Review
                    </button>
                    <button onClick={() => testCelebration('level_up')} className="px-4 py-2 border rounded-xl hover:bg-overlay-hover">
                        Level Up Modal
                    </button>
                </div>
            </section>

            {/* ── Core Loop Triggers ────────────────────────────────────────────── */}
            <section>
                <h2 className="text-xl font-bold mb-4">Trigger Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => triggerAction('quick_capture')} className="p-3 text-sm font-medium border border-border-default rounded-xl hover:bg-overlay-hover active:scale-95 text-left">
                        📥 Quick Capture (1 XP)
                    </button>
                    <button onClick={() => triggerAction('voice_capture')} className="p-3 text-sm font-medium border border-border-default rounded-xl hover:bg-overlay-hover active:scale-95 text-left">
                        🎙️ Voice Capture (2 XP)
                    </button>
                    <button onClick={() => triggerAction('item_clarified')} className="p-3 text-sm font-medium border border-border-default rounded-xl hover:bg-overlay-hover active:scale-95 text-left">
                        ⚖️ Clarify Item (5 XP)
                    </button>
                    <button onClick={() => triggerAction('two_minute_completed')} className="p-3 text-sm font-medium border border-border-default rounded-xl hover:bg-overlay-hover active:scale-95 text-left">
                        ⚡ 2-Min Action (8 XP)
                    </button>
                    <button onClick={() => triggerAction('next_action_completed')} className="p-3 text-sm font-medium border border-border-default rounded-xl hover:bg-overlay-hover active:scale-95 text-left">
                        ✅ Next Action (3 XP)
                    </button>
                    <button onClick={() => triggerAction('project_created')} className="p-3 text-sm font-medium border border-border-default rounded-xl hover:bg-overlay-hover active:scale-95 text-left">
                        🏗️ Project Create (3 XP)
                    </button>
                    <button onClick={() => triggerAction('inbox_zero_achieved')} className="p-3 text-sm font-medium border border-border-default rounded-xl hover:bg-overlay-hover active:scale-95 text-left">
                        🧹 Inbox Zero (25 XP)
                    </button>
                    <button onClick={() => triggerAction('weekly_review_completed')} className="p-3 text-sm font-medium border border-border-default rounded-xl hover:bg-overlay-hover active:scale-95 text-left">
                        🪞 Weekly Review (50 XP)
                    </button>
                </div>
            </section>

            {/* ── Active Challenges Viewer ──────────────────────────────────────── */}
            <section>
                <h2 className="text-xl font-bold mb-4">Active Challenges Tracking</h2>
                {challenges.length === 0 ? (
                    <p className="text-content-muted italic">No active challenges. They might be filtered out by Free tier or not initiated.</p>
                ) : (
                    <div className="space-y-3">
                        {challenges.map(c => (
                            <div key={c.challengeId} className="p-4 border border-border-default rounded-2xl flex justify-between items-center bg-surface-card">
                                <div>
                                    <p className="font-bold flex items-center gap-2">
                                        {c.def?.icon} {c.def?.name}
                                    </p>
                                    <p className="text-sm text-content-muted">{c.def?.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-lg">{c.current} / {c.target}</p>
                                    <p className="text-xs text-primary-ink uppercase font-bold tracking-widest">{c.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}
