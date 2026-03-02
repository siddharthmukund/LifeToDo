'use client'

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCelebration } from '@/gamification/useCelebration';
import { CELEBRATION_DURATIONS, ADHD_DURATIONS } from '@/gamification/celebrations';
import { ACHIEVEMENTS } from '@/gamification/achievements';
import { LEVEL_DEFINITIONS } from '@/gamification/levels';

export function CelebrationOverlay() {
    const { currentEvent, dismissCurrent, intensity, isEnabled } = useCelebration();

    useEffect(() => {
        if (!currentEvent || !isEnabled) return;

        let timeout: ReturnType<typeof setTimeout>;

        const durationMap = intensity === 'subtle' ? ADHD_DURATIONS : CELEBRATION_DURATIONS;

        if (currentEvent.type === 'inbox_zero') {
            timeout = setTimeout(dismissCurrent, durationMap.inbox_zero);
        } else if (currentEvent.type === 'weekly_review') {
            timeout = setTimeout(dismissCurrent, durationMap.weekly_review);
        } else if (currentEvent.type === 'project_completed') {
            timeout = setTimeout(dismissCurrent, durationMap.project_completed);
        } else if (currentEvent.type === 'level_up') {
            if (intensity === 'subtle') {
                timeout = setTimeout(dismissCurrent, durationMap.level_up);
            }
            // In full mode, level up stays until user clicks
        }

        return () => clearTimeout(timeout);
    }, [currentEvent, dismissCurrent, intensity, isEnabled]);

    if (!isEnabled || !currentEvent) return null;

    return (
        <AnimatePresence>
            {currentEvent.type === 'inbox_zero' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`flex flex-col items-center bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800 ${intensity === 'subtle' ? 'scale-90' : ''}`}
                    >
                        <span className="text-6xl mb-4">✨</span>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                            Inbox Zero!
                        </h2>
                        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Mind like water.</p>
                    </motion.div>
                    {/* Confetti simulation (simplified for now without extra deps) */}
                </motion.div>
            )}

            {currentEvent.type === 'weekly_review' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-blue-500/30">
                            <span className="text-5xl">🪞</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Review Complete</h2>
                        <p className="text-blue-200">System aligned and ready for the week.</p>
                    </motion.div>
                </motion.div>
            )}

            {currentEvent.type === 'level_up' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
                    onClick={dismissCurrent}
                >
                    <motion.div
                        initial={{ y: 100, scale: 0.9 }}
                        animate={{ y: 0, scale: 1 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 max-w-sm w-full text-center shadow-[0_0_50px_rgba(59,130,246,0.3)] cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="60" className="stroke-zinc-800" strokeWidth="8" fill="none" />
                                <motion.circle
                                    initial={{ strokeDasharray: '0, 400' }}
                                    animate={{ strokeDasharray: '377, 400' }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    cx="64" cy="64" r="60"
                                    className="stroke-blue-500" strokeWidth="8" fill="none" strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-sm text-zinc-400 font-medium tracking-widest uppercase">Level</span>
                                <span className="text-4xl font-bold text-white">{currentEvent.newLevel}</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            {LEVEL_DEFINITIONS.find(l => l.level === currentEvent.newLevel)?.title || 'Level Up!'}
                        </h2>
                        <p className="text-zinc-400 mb-8">
                            Your GTD mastery grows stronger.
                        </p>

                        <button
                            onClick={dismissCurrent}
                            className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            Continue
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
