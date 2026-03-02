/**
 * scripts/i18n/extract-strings.ts
 * 
 * Scans all .tsx and .ts files for English string literals that aren't wrapped in t().
 * Outputs an inventory report to help developers identify missing translations.
 * 
 * Usage: npx ts-node scripts/i18n/extract-strings.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Simplified Regex to find unwrapped JSX text nodes
const jsxTextRegex = />([^<{}]+)</g;

function scanDirectory(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
                scanDirectory(fullPath, fileList);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

function extractUnwrappedStrings() {
    console.log('Scanning src directory for unwrapped strings...\n');
    const files = scanDirectory(path.join(process.cwd(), 'src'));

    let totalMissing = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        let match;
        const missing = [];

        // Check for raw JSX text
        while ((match = jsxTextRegex.exec(content)) !== null) {
            const text = match[1].trim();
            // Ignore empty strings, pure numbers, or common punctuation
            if (text && !/^[0-9\s.,!?-]+$/.test(text)) {
                missing.push(text);
            }
        }

        if (missing.length > 0) {
            const relPath = path.relative(process.cwd(), file);
            console.log(`\x1b[33m${relPath}\x1b[0m`);
            missing.forEach(str => console.log(`  - "${str}"`));
            totalMissing += missing.length;
        }
    }

    console.log(`\nFound \x1b[31m${totalMissing}\x1b[0m potential unwrapped strings.`);
    console.log('Review these instances to ensure they are either added to dictionaries or explicitly ignored.');
}

extractUnwrappedStrings();
