import { test, expect } from '../fixtures/auth';

test.describe('Weekly Review Flow', () => {
    test('executes end-to-end Weekly Review successfully', async ({ authenticatedPage: page }) => {
        await page.goto('/review');

        // Page 1: Start
        await expect(page.getByRole('heading', { name: /Weekly Review/i })).toBeVisible();
        await page.getByRole('button', { name: /Start Review/i }).click();

        // Page 2: Clear mind
        await expect(page.getByText('Get Clear')).toBeVisible();
        await page.getByRole('button', { name: 'Next' }).click();

        // Page 3: Analyze
        await expect(page.getByText('Get Current')).toBeVisible();
        await page.getByRole('button', { name: 'Next' }).click();

        // Page 4: Think
        await expect(page.getByText('Get Creative')).toBeVisible();
        await page.getByRole('button', { name: 'Complete Review' }).click();

        // End State: Gamification celebration
        await expect(page.getByText(/Review Complete/i)).toBeVisible();
        await expect(page.getByText(/XP/i)).toBeVisible();
    });

    test('loads Socratic coaching chat from MSW integration', async ({ authenticatedPage: page }) => {
        await page.goto('/review');
        await page.getByRole('button', { name: /Start Review/i }).click();

        // Ask for help in the flow
        await page.getByRole('button', { name: /Get Coaching/i }).click();

        const uiInput = page.getByPlaceholder(/Ask the AI coach/i);
        await uiInput.fill('How should I prioritize?');
        await uiInput.press('Enter');

        // Anthropic API mocked in `msw/handlers.ts` returns "Mock AI response"
        await expect(page.getByText('Mock AI response')).toBeVisible({ timeout: 10000 });
    });
});
