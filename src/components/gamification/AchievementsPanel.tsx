'use client';
import { useState } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { useAchievements } from '@/gamification/useAchievements';
import { AchievementCard } from './AchievementCard';
import type { AchievementCategory } from '@/types/gamification';

interface Props {
  className?: string;
}

const CATEGORIES: { key: AchievementCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '🏆' },
  { key: 'capture', label: 'Capture', emoji: '📥' },
  { key: 'clarify', label: 'Clarify', emoji: '⚖️' },
  { key: 'organize', label: 'Organize', emoji: '🏗️' },
  { key: 'reflect', label: 'Reflect', emoji: '🪞' },
  { key: 'engage', label: 'Engage', emoji: '🚀' },
  { key: 'meta', label: 'Meta', emoji: '🌟' },
];

export function AchievementsPanel({ className = '' }: Props) {
  const { achievements, unlockedCount, totalCount, loading } = useAchievements();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  return (
    <section className={`space-y-4 ${className}`}>
      {/* Header */}
      <header className="flex items-center gap-2">
        <Trophy size={15} className="text-primary" />
        <h2 className="text-sm font-bold text-content-primary">Achievements</h2>
        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
          {unlockedCount} / {totalCount}
        </span>
      </header>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-border-default text-content-secondary hover:bg-border-default/80'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievement list */}
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-content-muted text-sm justify-center">
          <Loader2 size={14} className="animate-spin" />
          Loading achievements…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-content-muted text-center py-6">No achievements in this category yet.</p>
      ) : (
        <div className="space-y-2">
          {/* Unlocked first */}
          {filtered
            .sort((a, b) => {
              if (a.isUnlocked && !b.isUnlocked) return -1;
              if (!a.isUnlocked && b.isUnlocked) return 1;
              return 0;
            })
            .map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </div>
      )}
    </section>
  );
}
