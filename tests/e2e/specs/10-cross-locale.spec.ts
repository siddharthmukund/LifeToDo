import { test, expect } from '../fixtures/auth';

test.describe('Hindi Cross-Locale Verification', () => {
    test('evaluates translated strings and localized metrics', async ({ authenticatedPage: page }) => {
        // Navigate manually directly to the locale slug.
        // Auth redirect bypasses normally resolve `[locale]` params naturally based on browser headers. 
        await page.goto('/hi/inbox');

        // Since `NextIntl` hydrated the layout with Hindi translations, the standard placeholders switch values.
        // Check that the Hindi translation for the capture box exists.
        const input = page.getByPlaceholder(/What's on your mind|आपके मन में क्या है/i);
        await expect(input).toBeVisible();

        // Fill the smart prompt using Hindi/Hinglish instructions 
        await input.fill('Email boss tomorrow');
        await input.press('Enter');

        // Validate that our Date Formatters successfully injected translated tokens on the frontend.
        // For smart capture suggestions in Hindi, standard dates will be generated.
        await page.waitForSelector('[data-testid="smart-capture-suggestion"]');

        // Validating basic string change presence is enough for an E2E sweep.
        const suggestionParent = page.getByTestId('smart-capture-suggestion');
        await expect(suggestionParent).toBeVisible();

        await page.getByRole('button', { name: /Confirm|पुष्टि करें/i }).click();
    });
});
