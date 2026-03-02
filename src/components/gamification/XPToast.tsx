'use client'

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCelebration } from '@/gamification/useCelebration';
import { CELEBRATION_DURATIONS, ADHD_DURATIONS } from '@/gamification/celebrations';

export function XPToast() {
    const { currentEvent, dismissCurrent, intensity, isEnabled } = useCelebration();

    useEffect(() => {
        if (!currentEvent || !isEnabled) return;
        if (currentEvent.type !== 'xp') return; // only handle xp here

        const durationMap = intensity === 'subtle' ? ADHD_DURATIONS : CELEBRATION_DURATIONS;
        const timeout = setTimeout(dismissCurrent, durationMap.xp);

        return () => clearTimeout(timeout);
    }, [currentEvent, dismissCurrent, intensity, isEnabled]);

    if (!isEnabled || !currentEvent || currentEvent.type !== 'xp') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={intensity === 'subtle' ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={intensity === 'subtle' ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={intensity === 'subtle' ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed bottom-24 right-6 z-50 pointer-events-none"
            >
                <div className={`
          flex items-center gap-2 bg-blue-500 text-white font-bold rounded-full shadow-lg
          ${intensity === 'subtle' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}
        `}>
                    <span>+{currentEvent.amount} XP</span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
