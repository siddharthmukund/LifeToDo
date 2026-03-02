'use client';

import { useXP } from '@/gamification/useXP';
import { motion } from 'framer-motion';

export function XPBar() {
    const { totalXP, currentLevel, xpToNextLevel, isEnabled, showXPBar } = useXP();

    if (!isEnabled || !showXPBar) return null;

    const currentLevelBaseXP = totalXP - (totalXP + xpToNextLevel) + xpToNextLevel; // Simplified. True math uses the curve.
    // Actually, we need the formula again.
    const reqForCurrent = Math.floor(50 * Math.pow(currentLevel, 1.8));
    const reqForNext = Math.floor(50 * Math.pow(currentLevel + 1, 1.8));

    const progressToNext = totalXP - reqForCurrent;
    const levelBracket = reqForNext - reqForCurrent;
    const progressPercent = Math.min(100, Math.max(0, (progressToNext / levelBracket) * 100));

    return (
        <div className="flex items-center gap-3 w-full max-w-xs group cursor-default">
            {/* Level Badge */}
            <div className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-xs font-bold w-7 h-7 rounded-lg text-zinc-700 dark:text-zinc-300 ring-1 ring-zinc-200 dark:ring-zinc-700">
                {currentLevel}
            </div>

            {/* Progress Track */}
            <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                <motion.div
                    className="absolute top-0 left-0 bottom-0 bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>

            {/* XP text hover info */}
            <div className="text-xs text-zinc-400 font-medium font-mono min-w-[40px] text-right">
                <span className="group-hover:hidden transition-all">{xpToNextLevel}</span>
                <span className="hidden group-hover:inline transition-all">{totalXP}</span>
            </div>
        </div>
    );
}
