import { test, expect } from '../fixtures/auth';

test.describe('Offline Mode capability', () => {
    test('persists actions written offline', async ({ authenticatedPage: page, context }) => {
        // Start Page
        await page.goto('/inbox');

        // Simulate setting network offline
        await context.setOffline(true);

        // Attempt Quick capture mapping into IndexedDB proxy
        const input = page.getByPlaceholder('What\'s on your mind?');
        await input.fill('Write E2E documentation (Offline)');
        await input.press('Enter');

        // Assert visual inclusion
        await expect(page.getByRole('listitem').filter({ hasText: 'Write E2E documentation (Offline)' })).toBeVisible();

        // Reconnect simulation
        await context.setOffline(false);

        // Wait for the sync queues to fire and UI visual indicators to settle (Mocked behavior usually updates almost instantly)
        // The exact toast class requires inspecting the application, asserting generic text for now.
        // E.g 'Syncing actions...' or just checking it hasn't disappeared on refresh.

        await page.reload();
        await expect(page.getByRole('listitem').filter({ hasText: 'Write E2E documentation (Offline)' })).toBeVisible();
    });
});
