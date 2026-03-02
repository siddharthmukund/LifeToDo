# Life To Do — Testing Infrastructure

This comprehensive testing ecosystem is designed around 5 layers of verification guaranteeing that business logic perfectly reflects user journeys efficiently across multi-lingual distributions. 

## Test Layers

1. **Unit Tests (Vitest)**
   - Validate functions, standalone APIs, Hooks, calculation reducers `(src/gamification/xpEngine.ts)`, AI snapshot prompts natively off Javascript nodes.
   - Run via: `npm run test:unit`

2. **Component Tests (React Testing Library + Vitest)**
   - Evaluates UI mount lifecycles with mock data stores and interactions simulating button presses for standalone DOM segments.
   - Run via: `npm run test:component`

3. **End-to-End Tests (Playwright)**
   - Executes multi-step workflows like Capturing, Smart Prompts processing, or Gamification integrations inside full headless Chromium/Webkit engines mimicking real humans.
   - Run via: `npm run test:e2e`

4. **Visual Regression Tests (Percy + Playwright)**
   - Takes multi-viewport image snapshots per feature/action across Emulated Light/Dark Themes, guaranteeing CSS layouts never silently drift.
   - Run via: `npm run test:visual` *(Note: requires Percy token bound to PERCY_TOKEN)*

5. **Performance Budgets (Lighthouse CI)**
   - Mounts and asserts sub-1s load boundaries alongside Core Web Vitals checking FCP, layout-shifts, and main-thread blocking timeouts.
   - Run via: `npm run test:lighthouse`

## GitHub Actions CI/CD
Automatically executing `.github/workflows/test.yml` blocks merges inside `main` until tests pass cleanly. 
Coverage uploads to Codecov natively — missing threshold ratios by 5% breaks Pull Requests globally.

### Test Environment Structure
- Mock responses intercepting Stripe, Firebase, Anthropic endpoints are declared globally via `tests/mocks/handlers.ts`.
- `vitest.config.ts` loads `@/` path resolution mapping directly alongside `tsconfig.json`.
- When writing RTL Tests, always use `tests/setup/test-utils.tsx` default exports instead of `@testing-library/react` to auto-shim contexts like User/Language.
