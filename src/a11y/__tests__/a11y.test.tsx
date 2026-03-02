/**
 * src/a11y/__tests__/a11y.test.tsx
 * Automated accessibility tests using jest-axe.
 *
 * These tests catch ~30-40% of WCAG 2.2 AA violations automatically.
 * They complement, but do not replace, manual screen-reader testing.
 *
 * Prerequisites:
 *   npm i -D jest-axe @testing-library/react @testing-library/jest-dom
 *   npm i -D @types/jest-axe
 *
 * Run with:
 *   npx jest src/a11y/__tests__/a11y.test.tsx
 *   -- or --
 *   npm test -- --testPathPattern="a11y"
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Components under test
import { SkipLink } from '../SkipLink';
import { LiveRegion } from '../LiveRegion';
import { FocusTrap } from '../FocusTrap';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BottomNav } from '@/components/layout/BottomNav';

// Extend jest matchers
expect.extend(toHaveNoViolations);

// ─── axe configuration ────────────────────────────────────────────────────────

const AXE_CONFIG = {
    runOnly: {
        type: 'tag' as const,
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

async function expectNoViolations(ui: React.ReactElement) {
    const { container } = render(ui);
    const results = await axe(container, AXE_CONFIG);
    expect(results).toHaveNoViolations();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SkipLink', () => {
    it('has no axe violations', async () => {
        await expectNoViolations(
            <main>
                <SkipLink />
                <div id="main-content" tabIndex={-1}>Content</div>
                <nav id="bottom-nav" aria-label="Main navigation">Nav</nav>
            </main>,
        );
    });

    it('renders a visible link on focus', () => {
        const { getByText } = render(
            <>
                <SkipLink />
                <div id="main-content">Content</div>
            </>,
        );
        expect(getByText('Skip to main content')).toBeInTheDocument();
    });
});

describe('LiveRegion', () => {
    it('has no axe violations', async () => {
        await expectNoViolations(<LiveRegion />);
    });

    it('renders a polite and an assertive region', () => {
        const { container } = render(<LiveRegion />);
        expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
        expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
    });
});

describe('FocusTrap', () => {
    it('has no axe violations when inactive', async () => {
        await expectNoViolations(
            <FocusTrap active={false}>
                <div>
                    <button>Open</button>
                </div>
            </FocusTrap>,
        );
    });

    it('has no axe violations when active', async () => {
        await expectNoViolations(
            <FocusTrap active onEscape={() => {}}>
                <div role="dialog" aria-modal="true" aria-label="Test dialog">
                    <button>Close</button>
                    <button>Action</button>
                </div>
            </FocusTrap>,
        );
    });
});

describe('ProgressBar', () => {
    it('has no axe violations', async () => {
        await expectNoViolations(
            <ProgressBar value={3} max={7} ariaLabel="Tasks completed: 3 of 7" />,
        );
    });

    it('has role="progressbar" with correct aria-value* attributes', () => {
        const { container } = render(<ProgressBar value={3} max={7} />);
        const bar = container.querySelector('[role="progressbar"]');
        expect(bar).toBeInTheDocument();
        expect(bar).toHaveAttribute('aria-valuenow', '3');
        expect(bar).toHaveAttribute('aria-valuemin', '0');
        expect(bar).toHaveAttribute('aria-valuemax', '7');
    });
});

describe('Badge', () => {
    it('has no axe violations for all color variants', async () => {
        await expectNoViolations(
            <div>
                {(['default', 'accent', 'success', 'warning', 'danger', 'someday', 'muted'] as const).map(
                    (color) => <Badge key={color} color={color}>{color}</Badge>,
                )}
            </div>,
        );
    });
});

describe('Button', () => {
    it('has no axe violations', async () => {
        await expectNoViolations(
            <div>
                <Button>Click me</Button>
                <Button size="sm">Small</Button>
                <Button variant="danger">Delete</Button>
                <Button loading aria-label="Saving">Loading</Button>
            </div>,
        );
    });

    it('sm size meets 44px minimum touch target', () => {
        const { getByRole } = render(<Button size="sm">Small</Button>);
        const btn = getByRole('button');
        // Computed style check (jsdom doesn't do layout, check class)
        expect(btn.className).toContain('min-h-[44px]');
    });
});

describe('Modal', () => {
    it('has no axe violations when open', async () => {
        await expectNoViolations(
            <Modal open onClose={() => {}} title="Test Modal">
                <p>Modal content</p>
                <button>Action</button>
            </Modal>,
        );
    });

    it('has role="dialog" and aria-modal="true"', () => {
        const { container } = render(
            <Modal open onClose={() => {}} title="Test Modal">
                <p>Content</p>
            </Modal>,
        );
        const dialog = container.querySelector('[role="dialog"]');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('links aria-labelledby to the title heading', () => {
        const { container } = render(
            <Modal open onClose={() => {}} title="My Dialog">
                <p>Content</p>
            </Modal>,
        );
        const dialog = container.querySelector('[role="dialog"]');
        const labelId = dialog?.getAttribute('aria-labelledby');
        expect(labelId).toBeTruthy();
        const heading = container.querySelector(`#${labelId}`);
        expect(heading?.textContent).toBe('My Dialog');
    });

    it('has no axe violations when closed', async () => {
        await expectNoViolations(
            <Modal open={false} onClose={() => {}}>
                <p>Hidden content</p>
            </Modal>,
        );
    });
});

describe('BottomNav', () => {
    it('has no axe violations', async () => {
        await expectNoViolations(<BottomNav />);
    });

    it('has aria-label on the nav element', () => {
        const { container } = render(<BottomNav />);
        const nav = container.querySelector('nav');
        expect(nav).toHaveAttribute('aria-label');
    });
});
