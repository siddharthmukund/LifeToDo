import { test, expect } from '../fixtures/auth';

test.describe('Upgrade Flow', () => {
    test('navigates to settings and observes Pro CTA', async ({ authenticatedPage: page }) => {
        await page.goto('/settings');
        await expect(page.getByRole('heading', { name: /Get Pro/i }).or(page.getByText(/Upgrade/i))).toBeVisible();
    });

    // Depending on how standard limits exist in the backend
    test('clicking upgrade redirects to Stripe session simulation', async ({ authenticatedPage: page }) => {
        await page.goto('/settings');

        // Listen for the MSW intercepted stripe checkout navigation response
        await page.getByRole('button', { name: /Upgrade to Pro/i }).click();

        // The Stripe mock server returns the link `/pay/cs_test_123` so the page will eventually redirect
        await page.waitForURL(/.*cs_test_123.*/);
        // Since Playwright runs into the mock redirect we verify the URL mutation
        expect(page.url()).toContain('cs_test_123');
    });
});
