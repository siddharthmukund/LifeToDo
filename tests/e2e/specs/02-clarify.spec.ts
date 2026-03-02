import { test, expect } from '../fixtures/auth';

test.describe('Clarify Flow', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
        await page.goto('/inbox');

        // Add a task to clarify globally across this suite
        const input = page.getByPlaceholder('What\'s on your mind?');
        await input.fill('Website redesign');
        await input.press('Enter');

        // Navigate to clarify
        await page.goto('/clarify');
    });

    test('completes full clarify flow with "Do it" outcome', async ({ authenticatedPage: page }) => {
        // Verify task appears active
        await expect(page.getByText('Website redesign').first()).toBeVisible();

        // Step 1: What is it?
        await expect(page.getByText('What is it?')).toBeVisible();
        const whatInput = page.getByPlaceholder('Describe what this is');
        await whatInput.fill('Update company website with new branding');
        await page.getByRole('button', { name: 'Next' }).click();

        // Step 2: Is it actionable?
        await expect(page.getByText('Is it actionable?')).toBeVisible();
        await page.getByRole('button', { name: 'Yes' }).click();

        // Step 3: What's the next action?
        await expect(page.getByText('What\'s the next action?')).toBeVisible();
        const actionInput = page.getByPlaceholder('Be specific and actionable');
        await actionInput.fill('Draft wireframes for homepage');
        await page.getByRole('button', { name: 'Next' }).click();

        // Step 4: Can you do it in <2 minutes?
        await expect(page.getByText('Can you do this in under 2 minutes?')).toBeVisible();
        await page.getByRole('button', { name: 'No' }).click();

        // Step 5: Will this take multiple steps?
        await expect(page.getByText('Will this take multiple steps?')).toBeVisible();
        await page.getByRole('button', { name: 'Yes, create project' }).click();

        // Project creation
        await expect(page.getByText('Create Project')).toBeVisible();
        const projectInput = page.getByPlaceholder('Project name');
        await expect(projectInput).toHaveValue('Website redesign'); // Assert Pre-filled

        await page.getByRole('button', { name: 'Create' }).click();

        // Verify redirected to projects view
        await page.waitForURL('/projects');

        // Verify project exists
        await expect(page.getByRole('heading', { name: 'Website redesign' })).toBeVisible();

        // Verify next action was nested in the newly built container
        await expect(page.getByText('Draft wireframes for homepage')).toBeVisible();
    });

    test('defers item to Someday/Maybe', async ({ authenticatedPage: page }) => {
        // Wait for Wizard
        await expect(page.getByText('What is it?')).toBeVisible();
        await page.getByRole('button', { name: 'Next' }).click();

        // Answer "Is it actionable?" with No (Not right now)
        await expect(page.getByText('Is it actionable?')).toBeVisible();
        await page.getByRole('button', { name: 'Not right now' }).click();

        // Verify success banner/toast (dependent on internal component mappings - relying on standard text strings initially)
        await expect(page.getByText('Moved to Someday/Maybe')).toBeVisible();

        // Navigate to Someday/Maybe
        await page.goto('/someday');

        // Verify item is cleanly preserved
        await expect(page.getByText('Website redesign')).toBeVisible();
    });

    test('creates single next action (not project)', async ({ authenticatedPage: page }) => {
        await expect(page.getByText('What is it?')).toBeVisible();
        await page.getByRole('button', { name: 'Next' }).click();

        await page.getByRole('button', { name: 'Yes' }).click(); // Actionable

        const actionInput = page.getByPlaceholder('Be specific and actionable');
        await actionInput.fill('Call John about website redesign');
        await page.getByRole('button', { name: 'Next' }).click();

        await page.getByRole('button', { name: 'No' }).click(); // Not <2 min
        await page.getByRole('button', { name: 'No, single action' }).click(); // Not multi-step

        // Assert visual feedback
        await expect(page.getByText('Added to Next Actions')).toBeVisible();

        await page.goto('/today');
        await expect(page.getByText('Call John about website redesign')).toBeVisible();
    });
});
