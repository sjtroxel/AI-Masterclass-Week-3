## Test Commands
- Full suite: `npm test` (from strawberry-star-travel-app/)
- Watch mode: `npm run test:watch`
- Single file: `npx vitest run src/hooks/useFavorites.test.ts`

## Tests as Specifications
- Run tests after every non-trivial change — treat failing tests as the highest priority signal
- Tests define "correct" behavior — write failing tests before implementation
- Test names should read as requirements: `test('filters Wikipedia results to astronomy articles only')`
- Coverage below 70% for components limits AI effectiveness for UI work

## Test Structure
- Framework: Vitest 4 + @testing-library/react in jsdom environment
- Hook/service tests: sibling to source — `src/hooks/useFavorites.test.ts`
- Component/integration tests: in feature `tests/` subdirectory — `src/features/stars/tests/StarsList.integration.test.tsx`
- Integration tests use `.integration.test.tsx` suffix

## Mocking Patterns
- Use `vi.hoisted()` to hoist module-level mocks (Supabase, useUser)
- Use `vi.stubGlobal()` for browser APIs (matchMedia, fetch)
- Wrap hooks with React context using `renderHook`'s `wrapper` option
