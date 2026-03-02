import { render, screen } from '@tests/setup/test-utils';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { describe, test, expect } from 'vitest';

describe('AchievementCard Component', () => {
    const mockAchievement = {
        id: 'test_achievement',
        name: 'Early Riser',
        description: 'Completed a task before 7 AM.',
        icon: '🌅',
        tier: 'silver' as const,
        xpReward: 500,
        condition: { type: 'stat_threshold' as const, stat: 'tasksCompleted', threshold: 1 }
    };

    test('renders unlocked state prominently with details', () => {
        render(<AchievementCard achievement={{ ...mockAchievement, isUnlocked: true, unlockedAt: '2026-03-02T10:00:00Z' }} />);

        expect(screen.getByText('Early Riser')).toBeInTheDocument();
        expect(screen.getByText('Completed a task before 7 AM.')).toBeInTheDocument();
        expect(screen.getByText('🌅')).toBeInTheDocument();
        // Since it's silver, we should have text displaying SILVER
        expect(screen.getByText(/SILVER/i)).toBeInTheDocument();
    });

    test('renders locked visible achievement dimly but shows title', () => {
        render(<AchievementCard achievement={{ ...mockAchievement, isUnlocked: false, hidden: false }} />);

        // Should still show info
        expect(screen.getByText('Early Riser')).toBeInTheDocument();
        expect(screen.getByText('Completed a task before 7 AM.')).toBeInTheDocument();
        expect(screen.getByText('🌅')).toBeInTheDocument();
    });

    test('renders hidden state mysteriously without spoiling content', () => {
        render(<AchievementCard achievement={{ ...mockAchievement, isUnlocked: false, hidden: true }} />);

        expect(screen.getByText('???')).toBeInTheDocument();
        expect(screen.getByText('Hidden achievement')).toBeInTheDocument();
        expect(screen.queryByText('Early Riser')).not.toBeInTheDocument();
        expect(screen.queryByText('🌅')).not.toBeInTheDocument();
    });
});
