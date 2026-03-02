import { test, expect } from '../fixtures/auth';

test.describe('Quick Capture', () => {
    test('captures task with Enter key', async ({ authenticatedPage: page }) => {
        // Navigating explicitly to ensure context mounts properly
        await page.goto('/inbox');

        // Find capture input
        await page.getByRole('button', { name: /Keyboard|Type/i }).click();
        const input = page.getByPlaceholder('What\'s on your mind?');
        await expect(input).toBeVisible();

        // Type task
        await input.fill('Buy groceries');

        // Press Enter
        await input.press('Enter');

        // Verify task appears in inbox
        await expect(page.getByRole('listitem').filter({ hasText: 'Buy groceries' })).toBeVisible();

        // Verify input is cleared
        await expect(input).toHaveValue('');

        // Verify focus returns to input
        await expect(input).toBeFocused();
    });

    test('captures task with button click', async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');

        await page.getByRole('button', { name: /Keyboard|Type/i }).click();
        const input = page.getByPlaceholder('What\'s on your mind?');
        await input.fill('Call dentist');

        // Click add button
        // The `<CaptureButton>` has a visual-only SVG when collapsed, so we look for the generic Add click.
        await page.getByRole('button', { name: 'Add' }).first().click();

        // Verify task appears
        await expect(page.getByRole('listitem').filter({ hasText: 'Call dentist' })).toBeVisible();
    });

    test('does not capture empty task', async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');

        await page.getByRole('button', { name: /Keyboard|Type/i }).click();
        const input = page.getByPlaceholder('What\'s on your mind?');

        // Press Enter on empty input
        await input.press('Enter');

        // Verify no new task added
        const tasks = page.getByRole('listitem');
        const initialCount = await tasks.count();

        await input.press('Enter');

        expect(await tasks.count()).toBe(initialCount);
    });

    test('trims whitespace from task', async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');

        await page.getByRole('button', { name: /Keyboard|Type/i }).click();
        const input = page.getByPlaceholder('What\'s on your mind?');
        await input.fill('  Buy milk  ');
        await input.press('Enter');

        // Verify trimmed task
        await expect(page.getByRole('listitem').filter({ hasText: 'Buy milk' })).toBeVisible();
    });
});

test.describe('Smart Capture', () => {
    test('parses "tomorrow" date expression', async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');

        await page.getByRole('button', { name: /Keyboard|Type/i }).click();
        const input = page.getByPlaceholder('What\'s on your mind?');
        await input.fill('Email boss tomorrow');
        await input.press('Enter');

        // Wait for AI parsing (mock intercepted)
        await page.waitForSelector('[data-testid="smart-capture-suggestion"]', { timeout: 5000 });

        // Verify date suggestion
        const tomorrow = new Date(Date.now() + 86400000);
        const dateText = tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        await expect(page.getByText(`Due: ${dateText}`)).toBeVisible();

        // Confirm suggestion
        await page.getByRole('button', { name: 'Confirm' }).click();

        // Verify task has due date
        const task = page.getByRole('listitem').filter({ hasText: 'Email boss' });
        await expect(task.getByText(dateText)).toBeVisible();
    });
});

test.describe('Brain Dump', () => {
    test('extracts multiple tasks from paragraph', async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');

        // Click Brain Dump button (might be hidden inside a "more" dropdown in some viewports)
        const brainDumpBtn = page.getByRole('button', { name: /Brain Dump/i });
        if (await brainDumpBtn.isHidden()) {
            await page.getByRole('button', { name: /More/i }).click();
        }
        await brainDumpBtn.click();

        // Verify modal opens
        await expect(page.getByRole('dialog', { name: /Brain Dump/i })).toBeVisible();

        // Paste paragraph
        const textarea = page.getByPlaceholder('Paste everything on your mind');
        await textarea.fill(`
      Need to buy groceries for the week.
      Call dentist to schedule cleaning.
      Finish Q1 report by Friday.
      Book flight to NYC for conference.
      Reply to Sarah's email about the project.
    `);

        // Submit
        await page.getByRole('button', { name: 'Extract tasks' }).click();

        // Verify preview of extracted tasks (from MSW Mock)
        await expect(page.getByText('Task 1')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Task 2')).toBeVisible();
        await expect(page.getByText('Task 3')).toBeVisible();

        // Add all tasks
        await page.getByRole('button', { name: 'Add all to inbox' }).click();

        // Verify tasks in inbox
        await expect(page.getByRole('listitem').filter({ hasText: 'Task 1' })).toBeVisible();
        await expect(page.getByRole('listitem').filter({ hasText: 'Task 2' })).toBeVisible();
    });
});
