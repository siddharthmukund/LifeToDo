import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
    authenticatedPage: Page;
};

// Next.js Dev builds cache aggressive paths locally so we clear state first.
export const test = base.extend<AuthFixtures>({
    authenticatedPage: async ({ page }, use) => {
        // Navigate to login (respecting locale prefix and page module)
        await page.goto('/en/auth/signin');

        // Wait for anonymous auth payload to hit
        // The existing app mounts anonymous auth inside the `<AuthProvider>` instantly for unauthenticated routes. 
        await page.waitForTimeout(2000);

        // Once the token hydrates, test will auto-route users inside!
        await page.goto('/en/inbox');

        // Wait for the hydration to complete
        await page.waitForURL('**/inbox**', { timeout: 15_000 });

        // Pass authenticated page to the test block
        await use(page);
    },
});

export { expect } from '@playwright/test';
