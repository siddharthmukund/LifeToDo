import { render, screen } from '@tests/setup/test-utils';
import { XPBar } from '@/components/gamification/XPBar';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as useXPModule from '@/gamification/useXP';

vi.mock('@/gamification/useXP', () => ({
    useXP: vi.fn()
}));

describe('XPBar Component', () => {
    beforeEach(() => {
        vi.mocked(useXPModule.useXP).mockReturnValue({
            totalXP: 100,
            currentLevel: 5,
            xpToNextLevel: 50,
            isEnabled: true,
            showXPBar: true,
            addXP: vi.fn(),
            calculateActionXP: vi.fn(),
            isMaxLevel: false
        });
    });

    test('renders nothing if gamification is disabled', () => {
        vi.mocked(useXPModule.useXP).mockReturnValueOnce({
            totalXP: 100,
            currentLevel: 5,
            xpToNextLevel: 50,
            isEnabled: false,
            showXPBar: true,
            addXP: vi.fn(),
            calculateActionXP: vi.fn(),
            isMaxLevel: false
        });

        const { container } = render(<XPBar />);
        expect(container).toBeEmptyDOMElement();
    });

    test('renders current level and formats UI elements', () => {
        render(<XPBar />);

        // Check for level string
        expect(screen.getByText('5')).toBeInTheDocument();

        // XP texts
        expect(screen.getByText('50')).toBeInTheDocument(); // xpToNextLevel
        expect(screen.getByText('100')).toBeInTheDocument(); // totalXP
    });

    test('hides if showXPBar is false', () => {
        vi.mocked(useXPModule.useXP).mockReturnValueOnce({
            totalXP: 100,
            currentLevel: 5,
            xpToNextLevel: 50,
            isEnabled: true,
            showXPBar: false,
            addXP: vi.fn(),
            calculateActionXP: vi.fn(),
            isMaxLevel: false
        });

        const { container } = render(<XPBar />);
        expect(container).toBeEmptyDOMElement();
    });
});
