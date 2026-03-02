import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e/specs',

    // Run tests in parallel
    fullyParallel: true,

    // Fail fast on CI
    forbidOnly: !!process.env.CI,

    // Retry on CI
    retries: process.env.CI ? 2 : 0,

    // Reporters
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        process.env.CI ? ['github'] as any : ['list'] as any,
    ],

    // Global timeout
    timeout: 30000,

    use: {
        // Base URL for tests
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

        // Collect trace on first retry
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on first retry
        video: 'retain-on-failure',

        // Locale for tests
        locale: 'en-US',

        // Timezone
        timezoneId: 'America/New_York',
    },

    // Projects for different browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        // Mobile
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 13'] },
        },
    ],

    // Web server (start Next.js dev server for tests)
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
