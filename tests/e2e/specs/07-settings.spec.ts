import { test, expect } from '../fixtures/auth';

test.describe('Settings Profile', () => {
    test('toggles ADHD mode successfully', async ({ authenticatedPage: page }) => {
        await page.goto('/settings');

        const adhdSwitch = page.getByRole('switch', { name: /ADHD Mode/i });
        expect(await adhdSwitch.getAttribute('aria-checked')).toBe('false');

        // Turn toggle On
        await adhdSwitch.click();

        // Assert State flips
        expect(await adhdSwitch.getAttribute('aria-checked')).toBe('true');
    });

    test('toggles Dark Theme setting successfully', async ({ authenticatedPage: page }) => {
        await page.goto('/settings');

        // We assume there are radio toggles or buttons for light/dark
        await page.getByRole('button', { name: /Dark/i }).click();

        // Fetch the <html> data-theme attribute directly from the DOM
        const dataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        expect(dataTheme).toBe('dark');
    });
});
