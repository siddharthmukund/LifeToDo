/**
 * Post-build script for Capacitor (native) builds.
 *
 * next-intl with localePrefix:'as-needed' generates page files under out/en/
 * but generates hrefs WITHOUT the /en/ prefix (e.g. /inbox, /projects).
 * Capacitor's WebView resolves those as out/inbox/ which doesn't exist,
 * causing every tab to fall back to out/index.html (Today page).
 *
 * Fix: copy every page directory from out/en/ into out/ so both
 *   https://localhost/en/inbox/  AND  https://localhost/inbox/
 * resolve to the same Inbox page HTML.
 */

import { cpSync, readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

// fileURLToPath decodes %20 → space so the path works on macOS/Windows
const outDir = fileURLToPath(new URL('../out', import.meta.url))
const enDir  = join(outDir, 'en')

if (!existsSync(enDir)) {
  console.error('[copy-locale-pages] out/en/ not found — run next build first')
  process.exit(1)
}

const entries = readdirSync(enDir)

for (const entry of entries) {
  const src  = join(enDir, entry)
  const dest = join(outDir, entry)

  if (!statSync(src).isDirectory()) continue   // skip files (index.html etc.)

  cpSync(src, dest, { recursive: true, force: true })
  console.log(`[copy-locale-pages] Copied out/en/${entry} → out/${entry}`)
}

// Also ensure out/index.html exists (Capacitor requires a root entry point)
const enIndex  = join(enDir, 'index.html')
const outIndex = join(outDir, 'index.html')
if (existsSync(enIndex)) {
  cpSync(enIndex, outIndex, { force: true })
  console.log('[copy-locale-pages] Copied out/en/index.html → out/index.html')
}

console.log('[copy-locale-pages] Done.')
