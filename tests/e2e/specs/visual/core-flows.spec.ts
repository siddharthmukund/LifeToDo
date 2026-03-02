import { test } from '../../fixtures/auth';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regressions - Core Views', () => {
    // Percy automatically handles DOM serialization. We explicitly set Emulations to test Themes visually.

    test('Inbox View - Theming \u0026 Layouts', async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');
        // Wait for MSW mock syncs
        await page.waitForLoadState('networkidle');

        // Light Mode Baseline
        await page.emulateMedia({ colorScheme: 'light' });
        await percySnapshot(page, 'Inbox View - Light Mode', { widths: [375, 1280] });

        // Dark Mode
        await page.emulateMedia({ colorScheme: 'dark' });
        // Since React/Tailwind typically respects media queries immediately, we might optionally reload if state holds
        await percySnapshot(page, 'Inbox View - Dark Mode', { widths: [375, 1280] });
    });

    test('Today View & Focus Mode', async ({ authenticatedPage: page }) => {
        await page.goto('/today');
        await page.waitForLoadState('networkidle');

        await percySnapshot(page, 'Today View', { widths: [375, 1280] });
    });

    test('Weekly Review Dashboard', async ({ authenticatedPage: page }) => {
        await page.goto('/review');
        await page.waitForLoadState('networkidle');

        await percySnapshot(page, 'Weekly Review Step 1', { widths: [375, 1280] });
    });
});
