'use client'

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCelebration } from '@/gamification/useCelebration';
import { CELEBRATION_DURATIONS, ADHD_DURATIONS } from '@/gamification/celebrations';
import { ACHIEVEMENTS } from '@/gamification/achievements';

export function AchievementToast() {
    const { currentEvent, dismissCurrent, intensity, isEnabled } = useCelebration();

    useEffect(() => {
        if (!currentEvent || !isEnabled) return;
        if (currentEvent.type !== 'achievement' && currentEvent.type !== 'challenge_completed') return;

        const durationMap = intensity === 'subtle' ? ADHD_DURATIONS : CELEBRATION_DURATIONS;
        const duration = currentEvent.type === 'achievement' ? durationMap.achievement : durationMap.challenge_completed;

        const timeout = setTimeout(dismissCurrent, duration);
        return () => clearTimeout(timeout);
    }, [currentEvent, dismissCurrent, intensity, isEnabled]);

    if (!isEnabled || !currentEvent || (currentEvent.type !== 'achievement' && currentEvent.type !== 'challenge_completed')) return null;

    let title = '';
    let subtitle = '';
    let icon = '🏆';
    let xp = 0;

    if (currentEvent.type === 'achievement') {
        const def = ACHIEVEMENTS.find(a => a.id === currentEvent.achievementId);
        if (def) {
            title = 'Achievement Unlocked!';
            subtitle = def.name;
            icon = def.icon;
            xp = def.xpReward;
        }
    } else if (currentEvent.type === 'challenge_completed') {
        title = 'Challenge Complete!';
        subtitle = 'Daily Challenge';
        icon = '🎯';
        xp = currentEvent.xpReward;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={intensity === 'subtle' ? { opacity: 0 } : { opacity: 0, y: -20 }}
                animate={intensity === 'subtle' ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={intensity === 'subtle' ? { opacity: 0 } : { opacity: 0, y: -20 }}
                className={`fixed z-50 pointer-events-none flex justify-center w-full
            ${intensity === 'subtle' ? 'bottom-6 left-0' : 'top-6 left-0'}
        `}
            >
                <div className={`
          flex items-center gap-4 glass-card shadow-glow-accent rounded-2xl overflow-hidden
          ${intensity === 'subtle' ? 'min-w-[200px] p-2' : 'min-w-[300px] p-3'}
        `}>
                    <div className="flex bg-status-warn/20 text-status-warning h-12 w-12 rounded-xl items-center justify-center text-2xl">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-status-warning">{title}</p>
                        <p className="text-sm font-bold text-content-primary">{subtitle}</p>
                    </div>
                    <div className="px-3">
                        <span className="text-sm font-bold text-primary-ink">+{xp} XP</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
