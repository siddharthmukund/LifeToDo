import { create } from 'zustand';

export type CelebrationIntensity = 'full' | 'subtle' | 'none';

export type CelebrationEvent =
    | { type: 'xp'; amount: number }
    | { type: 'achievement'; achievementId: string; xpReward: number }
    | { type: 'level_up'; oldLevel: number; newLevel: number }
    | { type: 'streak'; days: number }
    | { type: 'inbox_zero' }
    | { type: 'weekly_review' }
    | { type: 'project_completed'; projectName: string }
    | { type: 'challenge_completed'; xpReward: number };

interface CelebrationQueueStore {
    queue: CelebrationEvent[];
    enqueue: (event: CelebrationEvent) => void;
    dequeue: () => void;
    clear: () => void;
}

export const useCelebrationQueue = create<CelebrationQueueStore>((set) => ({
    queue: [],
    enqueue: (event) => set((state) => ({ queue: [...state.queue, event] })),
    dequeue: () => set((state) => ({ queue: state.queue.slice(1) })),
    clear: () => set({ queue: [] }),
}));

export function queueCelebration(event: CelebrationEvent) {
    useCelebrationQueue.getState().enqueue(event);
}
