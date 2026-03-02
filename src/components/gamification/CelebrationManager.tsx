'use client';
import { useEffect, useRef } from 'react';
import { useCelebration } from '@/gamification/useCelebration';
import { useADHDMode } from '@/hooks/useADHDMode';
import { CelebrationToast } from './CelebrationToast';
import { LevelUpModal } from './LevelUpModal';
import { CELEBRATION_DURATIONS, ADHD_DURATIONS } from '@/gamification/celebrations';

/**
 * Root-level singleton — mount once in the app layout.
 * Reads the celebration queue and renders toasts / modals in order.
 */
export function CelebrationManager() {
  const { currentEvent, dismissCurrent, intensity, isEnabled } = useCelebration();
  const { isADHDMode } = useADHDMode();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentEvent || !isEnabled) return;
    if (currentEvent.type === 'level_up' && intensity === 'full') return; // manual dismiss

    const durations = isADHDMode ? ADHD_DURATIONS : CELEBRATION_DURATIONS;
    const ms = durations[currentEvent.type as keyof typeof durations] ?? 2000;
    if (ms <= 0) { dismissCurrent(); return; }

    timerRef.current = setTimeout(() => { dismissCurrent(); }, ms);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentEvent, isEnabled, intensity, isADHDMode, dismissCurrent]);

  if (!isEnabled || !currentEvent) return null;

  if (currentEvent.type === 'level_up') {
    return (
      <LevelUpModal
        oldLevel={currentEvent.oldLevel}
        newLevel={currentEvent.newLevel}
        onDismiss={dismissCurrent}
        intensity={intensity}
      />
    );
  }

  // Non-level-up: toast anchored bottom-right
  return (
    <div className="fixed bottom-24 right-4 z-50 pointer-events-none">
      <CelebrationToast event={currentEvent} intensity={intensity} />
    </div>
  );
}
