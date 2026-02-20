## Variables & Functions
- camelCase for variables and functions: `filteredStars`, `handleFavoriteToggle`, `fetchWikipediaSummary`
- `use`-prefix for all hooks: `useStars`, `useFavorites`, `useUser`, `useWikipediaSummary`
- SCREAMING_SNAKE_CASE for module-level constants: `PARSEC_TO_LIGHTYEAR`, `WIKIPEDIA_API`

## Files & Directories
- PascalCase for React component files: `StarCard.tsx`, `HomeCarousel.tsx`, `Profile.tsx`
- camelCase for hook files: `useStars.ts`, `useFavorites.ts`
- Feature directories are lowercase kebab-case: `galactic-map/`, `stars/`

## TypeScript
- PascalCase for interfaces and types: `interface Star`, `type SortField`, `type HomeFeature`
- Use `import type` for type-only imports (required by verbatimModuleSyntax tsconfig setting)

## Exports
- React components: default export (`export default function StarCard()`)
- Hooks and utilities: named exports (`export function useStars()`)
