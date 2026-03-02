/**
 * src/a11y/__tests__/announcer.test.ts
 * Unit tests for the aria-live announcement singleton.
 */

import { announcer } from '../announcer';

// Use fake timers to control setTimeout in the announcer
beforeEach(() => {
    jest.useFakeTimers();
    // Reset DOM between tests
    document.body.innerHTML = '';
    announcer.clear();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('announcer', () => {
    it('creates a polite live region on first announcement', () => {
        announcer.announce('Hello');
        expect(document.getElementById('a11y-live-polite')).toBeInTheDocument();
    });

    it('creates an assertive live region for urgent messages', () => {
        announcer.announceAssertive('Error!');
        expect(document.getElementById('a11y-live-assertive')).toBeInTheDocument();
    });

    it('injects text after the injection delay', () => {
        announcer.announce('Task saved');
        // Before delay: still empty
        expect(document.getElementById('a11y-live-polite')?.textContent).toBe('');
        // After injection delay (100ms default)
        jest.advanceTimersByTime(100);
        expect(document.getElementById('a11y-live-polite')?.textContent).toBe('Task saved');
    });

    it('clears text after the clear delay', () => {
        announcer.announce('Task saved');
        jest.advanceTimersByTime(100);  // inject
        jest.advanceTimersByTime(1500); // clear delay
        expect(document.getElementById('a11y-live-polite')?.textContent).toBe('');
    });

    it('does not re-announce the same text unless forced', () => {
        announcer.announce('Test');
        jest.advanceTimersByTime(100);
        const before = document.getElementById('a11y-live-polite')?.textContent;
        announcer.announce('Test'); // same text — should be no-op
        jest.advanceTimersByTime(100);
        expect(document.getElementById('a11y-live-polite')?.textContent).toBe(before);
    });

    it('re-announces when force=true', () => {
        announcer.announce('Test');
        jest.advanceTimersByTime(100);
        announcer.announce('Test', 'polite', true); // force re-announce
        jest.advanceTimersByTime(100);
        expect(document.getElementById('a11y-live-polite')?.textContent).toBe('Test');
    });

    it('announces route changes', () => {
        announcer.announceRoute({ pathname: '/inbox' });
        jest.advanceTimersByTime(100);
        expect(document.getElementById('a11y-live-polite')?.textContent).toBe('Navigated to Inbox');
    });

    it('clear() empties both regions', () => {
        announcer.announce('Hello');
        announcer.announceAssertive('Error');
        jest.advanceTimersByTime(100);
        announcer.clear();
        expect(document.getElementById('a11y-live-polite')?.textContent).toBe('');
        expect(document.getElementById('a11y-live-assertive')?.textContent).toBe('');
    });
});
