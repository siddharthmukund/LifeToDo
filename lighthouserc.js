module.exports = {
    ci: {
        collect: {
            numberOfRuns: 1,
            startServerCommand: 'npm run build && npm run start',
            url: ['http://localhost:3000/inbox', 'http://localhost:3000/today'],
            // Fast setup for local CLI tests without overwhelming ports
            settings: {
                chromeFlags: '--no-sandbox --headless --disable-gpu',
            },
        },
        assert: {
            assertions: {
                'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
                'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'total-blocking-time': ['warn', { maxNumericValue: 300 }],
                'interactive': ['warn', { maxNumericValue: 3500 }],
            },
        },
        upload: {
            target: 'temporary-public-storage', // Upload to public Lighthouse temp storage for CI artifact views
        },
    },
};
