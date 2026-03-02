import { useEffect, useState, useCallback } from 'react';
import { useCelebrationQueue, CelebrationEvent } from './achievementNotifier';
import { useGamificationStore } from './gamificationStore';
import { useADHDMode } from '@/hooks/useADHDMode';

export function useCelebration() {
    const queue = useCelebrationQueue(state => state.queue);
    const dequeue = useCelebrationQueue(state => state.dequeue);
    const { isADHDMode } = useADHDMode();
    const preferences = useGamificationStore(state => state.preferences);

    const [currentEvent, setCurrentEvent] = useState<CelebrationEvent | null>(null);

    const processNextEvent = useCallback(() => {
        if (queue.length > 0 && !currentEvent) {
            setCurrentEvent(queue[0]);
        }
    }, [queue, currentEvent]);

    useEffect(() => {
        processNextEvent();
    }, [queue, processNextEvent]);

    const dismissCurrent = useCallback(() => {
        setCurrentEvent(null);
        dequeue();
    }, [dequeue]);

    // Determine intensity safely defaulting to subtle if ADHD mode is on
    const intensity = isADHDMode
        ? (preferences.celebrationIntensity === 'full' ? 'subtle' : preferences.celebrationIntensity)
        : preferences.celebrationIntensity;

    return {
        currentEvent,
        dismissCurrent,
        intensity,
        hasActiveCelebration: !!currentEvent,
        isEnabled: preferences.enabled && preferences.showCelebrations
    };
}
