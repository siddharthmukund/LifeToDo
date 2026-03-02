import { test, expect } from '../fixtures/auth';

test.describe('Test Infrastructure Validation', () => {
    test('playwright fixture loads and page mounts', async ({ authenticatedPage: page }) => {
        // Implicitly verifies Auth provider bypasses, routing to `/inbox` finishes, and app renders
        await expect(page).toHaveURL(/.*inbox.*/);

        // Check for the main capture input existence to verify React hydrated successfully
        // Explicitly open text mode since Voice orb defaults to primary visibility
        await page.getByRole('button', { name: /Keyboard|Type/i }).click();

        const input = page.getByPlaceholder('What\'s on your mind?');
        await expect(input).toBeVisible();
    });
});
