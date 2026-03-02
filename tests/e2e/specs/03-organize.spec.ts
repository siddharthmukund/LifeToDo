import { test, expect } from '../fixtures/auth';

test.describe('Organize Flow', () => {
    test('applies single context marker successfully', async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');

        // Quick Add
        const input = page.getByPlaceholder('What\'s on your mind?');
        await input.fill('Buy printer paper');
        await input.press('Enter');

        // Assert item populated
        const taskItem = page.getByRole('listitem').filter({ hasText: 'Buy printer paper' });
        await expect(taskItem).toBeVisible();

        // Click Context / Tags trigger
        await taskItem.getByRole('button', { name: 'Edit' }).click();
        // Assuming Edit expands context editing
        await page.getByRole('button', { name: '@errands' }).click();

        // Save Edit
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert Context mapped
        await expect(taskItem.getByText('@errands')).toBeVisible();
    });
});
