/**
 * scripts/i18n/check-translations.ts
 * 
 * Validates that all target locales have 100% key parity with the base `en` locale.
 * Recursively checks nested objects within each JSON file.
 * 
 * Usage: npx ts-node scripts/i18n/check-translations.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const messagesDir = path.join(process.cwd(), 'messages');
const baseLocale = 'en';
const targetLocales = ['hi', 'es', 'ar', 'pt-BR', 'de', 'ja', 'zh-CN'];
const namespaces = [
    'common', 'inbox', 'clarify', 'engage', 'review', 'projects',
    'settings', 'auth', 'profile', 'gamification', 'ai', 'push',
    'a11y', 'errors', 'onboarding', 'billing'
];

function getKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    for (const k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            keys = keys.concat(getKeys(obj[k], `${prefix}${k}.`));
        } else {
            keys.push(`${prefix}${k}`);
        }
    }
    return keys;
}

let hasErrors = false;

console.log('Validating Translation Key Parity...\n');

for (const ns of namespaces) {
    const basePath = path.join(messagesDir, baseLocale, `${ns}.json`);
    if (!fs.existsSync(basePath)) continue;

    const baseJson = JSON.parse(fs.readFileSync(basePath, 'utf-8'));
    const baseKeys = getKeys(baseJson);

    for (const loc of targetLocales) {
        const targetPath = path.join(messagesDir, loc, `${ns}.json`);
        if (!fs.existsSync(targetPath)) {
            console.log(`\x1b[31m[ERROR]\x1b[0m Missing file: ${loc}/${ns}.json`);
            hasErrors = true;
            continue;
        }

        const targetJson = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
        const targetKeys = getKeys(targetJson);

        const missingKeys = baseKeys.filter(k => !targetKeys.includes(k));
        const extraKeys = targetKeys.filter(k => !baseKeys.includes(k));

        if (missingKeys.length > 0) {
            console.log(`\x1b[31m[ERROR]\x1b[0m ${loc}/${ns}.json is missing keys:`);
            missingKeys.forEach(k => console.log(`  - ${k}`));
            hasErrors = true;
        }

        if (extraKeys.length > 0) {
            console.log(`\x1b[33m[WARNING]\x1b[0m ${loc}/${ns}.json has unused keys:`);
            extraKeys.forEach(k => console.log(`  + ${k}`));
        }
    }
}

if (hasErrors) {
    console.log('\n\x1b[31mValidation failed. Missing keys detected.\x1b[0m');
    process.exit(1);
} else {
    console.log('\n\x1b[32mAll 8 locales have 100% key parity across all 16 namespaces!\x1b[0m');
}
