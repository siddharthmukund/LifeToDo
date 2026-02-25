# Contributing to Life To Do

## Development Setup

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev

# Type-check without emitting
npx tsc --noEmit

# Production build
npm run build
```

## Code Style

- **TypeScript strict mode** is enforced. The compiler options `strict: true` and `noImplicitAny: true` are set. Never use `any`; prefer `unknown` and narrow explicitly.
- **Prefer `const`** over `let`. Avoid `var` entirely.
- **No default exports** from utility modules; named exports only. Default exports are acceptable for Next.js page components.
- **Imports** are sorted: built-ins → external packages → internal aliases (`@/`).

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `ActionCard.tsx` |
| Hooks | camelCase, `use` prefix | `useTaskStore.ts` |
| Utilities | camelCase | `formatDuration.ts` |
| Stores | camelCase, `Store` suffix | `taskStore.ts` |
| Types | PascalCase | `Task.ts` |

## Commit Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(inbox): add bulk-clarify action
fix(dexie): handle migration v3 on Safari
chore(deps): update next to 16.x
```

## Pull Request Checklist

Before opening a PR, confirm all of the following:

- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] `npm run build` completes successfully.
- [ ] No `gtd-*` design tokens are used (use semantic tokens like `primary`, `accent`).
- [ ] New Dexie tables include a migration in `src/db/migrations/`.
- [ ] Feature-flagged code is wrapped in `<FeatureGate>` or `useFeatureFlag`.
- [ ] Tests added for any new utility functions.
