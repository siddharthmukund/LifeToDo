import { test, expect } from '../fixtures/auth';

test.describe('Engage Flow', () => {
    test('lists actions appropriately in Today pane', async ({ authenticatedPage: page }) => {
        // Generate an actionable item
        await page.goto('/inbox');
        await page.getByPlaceholder('What\'s on your mind?').fill('Review quarterly marketing plan');
        await page.getByPlaceholder('What\'s on your mind?').press('Enter');

        // Manually push it to actionable
        await page.goto('/clarify');
        await page.getByRole('button', { name: 'Next' }).click(); // description
        await page.getByRole('button', { name: 'Yes' }).click(); // is actionable
        await page.getByPlaceholder('Be specific and actionable').fill('Read executive summary of marketing plan');
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByRole('button', { name: 'No' }).click(); // <2 min
        await page.getByRole('button', { name: 'No, single action' }).click(); // project

        // Now Check to see if the item sits in Engagement pane
        await page.goto('/today');
        await expect(page.getByText('Read executive summary of marketing plan')).toBeVisible();
    });

    test('completes task and triggers XP animation', async ({ authenticatedPage: page }) => {
        await page.goto('/today');

        // Assuming a task exists from the previous run
        const activeTask = page.getByRole('listitem').first();
        const taskTitle = await activeTask.textContent() || '';

        // Check it off
        await activeTask.getByRole('checkbox').click();

        // XP animation toast pops up
        // Wait for the overlay, check the string includes 'XP'
        await expect(page.getByText(/XP/i)).toBeVisible();

        // Check it's gone from today's list
        await expect(page.getByText(taskTitle)).not.toBeVisible();
    });
});
