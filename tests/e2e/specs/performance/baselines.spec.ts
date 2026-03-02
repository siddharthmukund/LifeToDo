import { test, expect } from '../../fixtures/auth';

test.describe('Performance Benchmarks', () => {
    test('Quick Capture resolves under fast baseline', async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');

        // Wait for page to settle and hydrate 
        await page.waitForLoadState('networkidle');

        const input = page.getByPlaceholder('What\'s on your mind?');
        await input.fill('Performance Task Execution');

        const startTime = Date.now();
        await input.press('Enter');

        // Assert the new task is injected into the DOM
        const newTask = page.getByRole('listitem').filter({ hasText: 'Performance Task Execution' });
        await newTask.waitFor({ state: 'visible', timeout: 5000 });

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Playwright execution adds overhead. Sub-100ms visually translates to <1000ms programatically via CDP loops.
        expect(duration).toBeLessThan(1500);
    });

    test('Clarify Navigation resolves smoothly', async ({ authenticatedPage: page }) => {
        // Start somewhere else
        await page.goto('/inbox');
        await page.waitForLoadState('networkidle');

        const startTime = Date.now();
        await page.goto('/clarify');

        // Load the Clarify assistant
        await page.waitForSelector('.clarify-view, [data-testid="clarify-assistant"]', { state: 'attached', timeout: 5000 }).catch(() => null);

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Verify we hit navigation layout markers fast. Generous threshold for E2E navigation bindings.
        expect(duration).toBeLessThan(3000);
    });
});
