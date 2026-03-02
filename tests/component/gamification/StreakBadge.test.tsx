import { render, screen } from '@tests/setup/test-utils';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as useStreakModule from '@/gamification/useStreak';
import * as useStoreModule from '@/gamification/gamificationStore';

vi.mock('@/gamification/useStreak', () => ({
    useStreak: vi.fn()
}));

vi.mock('@/gamification/gamificationStore', () => ({
    useGamificationStore: vi.fn()
}));

describe('StreakBadge Component', () => {
    beforeEach(() => {
        vi.mocked(useStoreModule.useGamificationStore).mockImplementation((selector: any) =>
            selector({ preferences: { enabled: true } })
        );

        vi.mocked(useStreakModule.useStreak).mockReturnValue({
            currentStreak: { days: 5, multiplier: 1.25 }
        } as any);
    });

    test('renders nothing when gamification is disabled globally', () => {
        vi.mocked(useStoreModule.useGamificationStore).mockImplementation((selector: any) =>
            selector({ preferences: { enabled: false } })
        );
        const { container } = render(<StreakBadge />);
        expect(container).toBeEmptyDOMElement();
    });

    test('renders streak integer and multiplier explicitly when requested', () => {
        render(<StreakBadge showMultiplier={true} />);

        expect(screen.getByText('5')).toBeInTheDocument();
        // 1.25.toFixed(1) === '1.3' inside Chrome V8 depending on rounding algorithms, '1.2' otherwise. We match partial or full string natively.
        expect(screen.getByText('1.3×')).toBeInTheDocument();
    });

    test('hides multiplier when showMultiplier is explicitly false', () => {
        render(<StreakBadge showMultiplier={false} />);

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.queryByText(/×/)).not.toBeInTheDocument();
    });

    test('renders flame generically when streak is 0', () => {
        vi.mocked(useStreakModule.useStreak).mockReturnValue({
            currentStreak: { days: 0, multiplier: 1.0 }
        } as any);
        render(<StreakBadge showMultiplier={true} />);

        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.queryByText(/×/)).not.toBeInTheDocument();
    });
});
