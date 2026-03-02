import { test, expect } from '../fixtures/auth';

test.describe('Mobile Viewport Formatting', () => {
    // Use a global before step adjusting the viewpoint of this document specifically instead of relying purely on Playwright project matrixes.
    // We can force the layout width to specifically target the `md` or `sm` Tailwind constraints.

    test('collapses sidebar and reveals bottom navigation', async ({ authenticatedPage: page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/inbox');

        // Assert standard PC SideNav is gone
        await expect(page.getByTestId('desktop-sidebar')).not.toBeVisible();

        // Assert Mobile Bottom Nav loads
        const bottomNav = page.getByRole('navigation', { name: /bottom/i }).or(page.getByTestId('bottom-nav'));
        await expect(bottomNav).toBeVisible();

        // Tap Today icon
        await bottomNav.getByRole('link', { name: /Today/i }).click();

        // Verify routing logic inside the restricted layout works correctly without overflow
        await expect(page).toHaveURL(/.*today.*/);
    });
});
