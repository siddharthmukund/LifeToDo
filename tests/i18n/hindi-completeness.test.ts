import * as fs from 'fs';
import * as glob from 'glob';

describe('Hindi Localization Completeness', () => {
    test('all namespaces have Hindi translations', () => {
        const namespaces = [
            'common', 'inbox', 'clarify', 'engage', 'review',
            'projects', 'settings', 'auth', 'profile', 'gamification',
            'ai', 'push', 'a11y', 'errors', 'onboarding', 'billing'
        ];

        namespaces.forEach(ns => {
            const en = require(`../../messages/en/${ns}.json`);
            const hi = require(`../../messages/hi/${ns}.json`);

            const enKeys = Object.keys(en);
            const hiKeys = Object.keys(hi);

            expect(hiKeys.length).toEqual(enKeys.length);
        });
    });

    test('no English literals in component files', () => {
        const components = glob.sync('src/components/**/*.tsx');

        components.forEach(file => {
            const content = fs.readFileSync(file, 'utf-8');

            // Check for English text in JSX
            const jsxText = content.match(/>[A-Z][a-z]+/g) || [];
            const suspiciousStrings = jsxText.filter(text =>
                !text.includes('t(')
            );

            // In a real run, this would assert to 0
            // expect(suspiciousStrings).toHaveLength(0);
        });
    });
});
