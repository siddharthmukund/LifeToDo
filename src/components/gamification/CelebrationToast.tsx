'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Flame, CheckCircle2, BookOpen, Target } from 'lucide-react';
import type { CelebrationEvent } from '@/gamification/achievementNotifier';
import { ACHIEVEMENTS } from '@/gamification/achievements';

interface Props {
  event: CelebrationEvent;
  intensity: 'full' | 'subtle' | 'none';
}

function getToastContent(event: CelebrationEvent) {
  switch (event.type) {
    case 'xp':
      return {
        icon: <Star size={16} className="text-status-warning" fill="currentColor" />,
        headline: `+${event.amount} XP`,
        sub: null,
        bg: 'bg-status-warn/10 border-status-warn',
      };
    case 'achievement': {
      const def = ACHIEVEMENTS.find(a => a.id === event.achievementId);
      return {
        icon: <span className="text-xl">{def?.icon ?? '🏆'}</span>,
        headline: def?.name ?? 'Achievement Unlocked!',
        sub: `+${event.xpReward} XP`,
        bg: 'bg-surface-card border-border-default',
      };
    }
    case 'streak':
      return {
        icon: <Flame size={16} className="text-status-warning" fill="currentColor" />,
        headline: `${event.days}-Day Streak!`,
        sub: null,
        bg: 'bg-status-warn/10 border-status-warn',
      };
    case 'inbox_zero':
      return {
        icon: <CheckCircle2 size={16} className="text-status-ok" />,
        headline: 'Inbox Zero!',
        sub: null,
        bg: 'bg-status-ok/10 border-status-ok',
      };
    case 'weekly_review':
      return {
        icon: <BookOpen size={16} className="text-primary-ink" />,
        headline: 'Weekly Review Done!',
        sub: '+50 XP',
        bg: 'bg-primary/5 border-primary/20',
      };
    case 'project_completed':
      return {
        icon: <Trophy size={16} className="text-status-warning" fill="currentColor" />,
        headline: 'Project Complete!',
        sub: event.projectName,
        bg: 'bg-status-warn/10 border-status-warn',
      };
    case 'challenge_completed':
      return {
        icon: <Target size={16} className="text-primary" />,
        headline: 'Challenge Complete!',
        sub: `+${event.xpReward} XP`,
        bg: 'bg-primary/5 border-primary/20',
      };
    default:
      return { icon: <Star size={16} />, headline: 'Nice!', sub: null, bg: 'bg-surface-card border-border-default' };
  }
}

export function CelebrationToast({ event, intensity }: Props) {
  if (intensity === 'none') return null;

  const { icon, headline, sub, bg } = getToastContent(event);

  return (
    <AnimatePresence>
      <motion.div
        key={event.type}
        initial={{ opacity: 0, y: 48, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg ${bg} min-w-[200px] max-w-[300px]`}
        role="status"
        aria-live="polite"
      >
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-content-primary leading-tight">{headline}</p>
          {sub && <p className="text-xs text-content-secondary mt-0.5">{sub}</p>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
