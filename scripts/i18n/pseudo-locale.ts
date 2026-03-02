/**
 * scripts/i18n/pseudo-locale.ts
 * 
 * Generates an 'en-PSEUDO' locale by expanding strings by 40% (to simulate German/Russian)
 * and wrapping them in brackets to easily spot untranslated strings in testing.
 * 
 * Layout Breaking Test Tool.
 */

import * as fs from 'fs';
import * as path from 'path';

const messagesDir = path.join(process.cwd(), 'messages');
const baseLocale = 'en';
const pseudoLocale = 'test-pseudo'; // Arbitrary test ID

function expandString(str: string): string {
    // Ignore ICU MessageFormat tokens like {count} or HTML tags
    if (str.includes('{') || str.includes('<')) return `[${str}]`;

    // Pad with x's to add 40% length simulating verbose languages
    const paddingLength = Math.ceil(str.length * 0.4);
    const padding = 'x'.repeat(paddingLength);

    return `[${str} ${padding}]`;
}

function processObject(obj: any): any {
    const result: any = {};
    for (const k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            result[k] = processObject(obj[k]);
        } else if (typeof obj[k] === 'string') {
            result[k] = expandString(obj[k]);
        } else {
            result[k] = obj[k];
        }
    }
    return result;
}

console.log('Generating Pseudo-Locale for Layout Stress Testing...\n');

const pseudoDir = path.join(messagesDir, pseudoLocale);
if (!fs.existsSync(pseudoDir)) {
    fs.mkdirSync(pseudoDir, { recursive: true });
}

const files = fs.readdirSync(path.join(messagesDir, baseLocale));

for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const basePath = path.join(messagesDir, baseLocale, file);
    const targetPath = path.join(pseudoDir, file);

    const baseJson = JSON.parse(fs.readFileSync(basePath, 'utf-8'));
    const pseudoJson = processObject(baseJson);

    fs.writeFileSync(targetPath, JSON.stringify(pseudoJson, null, 2));
    console.log(`Generated pseudo-locale file: ${pseudoLocale}/${file}`);
}

console.log(`\n\x1b[32mSuccess! Change i18nConfig defaultLocale to '${pseudoLocale}' to stress-test your layouts.\x1b[0m`);
