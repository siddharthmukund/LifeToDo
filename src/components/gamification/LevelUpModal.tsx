'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getLevelDefinition } from '@/gamification/levelCalculator';

interface Props {
  oldLevel: number;
  newLevel: number;
  onDismiss: () => void;
  intensity: 'full' | 'subtle' | 'none';
}

export function LevelUpModal({ oldLevel, newLevel, onDismiss, intensity }: Props) {
  if (intensity === 'none') { onDismiss(); return null; }

  const newDef = getLevelDefinition(newLevel);

  return (
    <AnimatePresence>
      <motion.div
        key="level-up-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
        onClick={onDismiss}
      >
        <motion.div
          key="level-up-card"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          onClick={e => e.stopPropagation()}
          className="bg-surface-card border border-border-subtle rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5 text-center max-w-sm w-full"
        >
          {/* Animated icon */}
          <motion.div
            animate={intensity === 'full' ? {
              scale: [1, 1.15, 1],
              rotate: [0, -8, 8, 0],
            } : {}}
            transition={{ repeat: intensity === 'full' ? Infinity : 0, duration: 2.5, ease: 'easeInOut' }}
            className="text-6xl leading-none"
          >
            {newDef.icon}
          </motion.div>

          {/* Sparkle header */}
          <div className="flex items-center gap-1.5 text-primary">
            <Sparkles size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">Level Up!</span>
            <Sparkles size={14} />
          </div>

          <div className="space-y-1">
            <p className="text-4xl font-black text-content-primary tabular-nums">
              {newLevel}
            </p>
            <p className="text-lg font-bold text-primary">{newDef.title}</p>
            {oldLevel > 0 && (
              <p className="text-sm text-content-muted">
                You levelled up from {oldLevel} → <strong>{newLevel}</strong>
              </p>
            )}
          </div>

          <button
            onClick={onDismiss}
            className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all"
          >
            Keep Going 🚀
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
