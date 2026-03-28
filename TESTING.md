# Testing

## Philosophy

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

**Vitest** v4 + **React Testing Library** + **jsdom**

## Running Tests

```bash
npm test           # run all tests once
npm run test:watch # watch mode (re-runs on file changes)
```

## Test Layers

### Unit tests
- What: Pure logic, utility functions, prompt builders
- Where: `test/*.test.ts`
- When: Every time you change a function in `lib/`

### Integration tests (future)
- What: API route behavior, Supabase interactions (mocked)
- Where: `test/*.integration.test.ts`

### E2E / smoke tests (via /qa)
- What: Full user flows in the browser
- Where: Run with `npx claude /qa`

## Conventions

- Test files: `test/{name}.test.ts`
- Mock external SDKs (Anthropic, Supabase) with `vi.mock()` at the top of the file
- Use `class` syntax for constructor mocks (Vitest requires constructable mocks)
- Assert behavior, not just existence: `expect(prompt).toContain(...)` not `expect(prompt).toBeDefined()`
- Add a `vi.mock("@anthropic-ai/sdk", ...)` block whenever a test file imports from `lib/claude.ts`
