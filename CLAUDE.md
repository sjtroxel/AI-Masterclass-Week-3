# CLAUDE.md

## Project Overview

Strawberry Star Travel App is a React-based interactive star catalog for exploring astronomical data from the HYG star database. Users can search, filter, and sort stars, save favorites to their profile, and upload avatars. This is a monorepo workspace: the React frontend lives in `strawberry-star-travel-app/` and an upcoming Node.js/Express backend will live in `strawberry-star-server/` (not yet built).

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript (strict mode) | ~5.9.3 |
| UI Framework | React | ^19.2.0 |
| Build Tool | Vite | ^7.2.4 |
| Routing | react-router-dom | ^7.10.1 |
| Styling | Tailwind CSS (PostCSS) | ^4.1.18 |
| Backend/Auth | Supabase | ^2.86.2 |
| Search | Fuse.js | ^7.1.0 |
| Icons | lucide-react | ^0.561.0 |
| Testing | Vitest + @testing-library/react | ^4.0.16 / ^16.3.1 |
| Linting | ESLint 9 + typescript-eslint | ^9.39.1 |
| Formatting | Prettier | ^3.5.1 |
| Deployment | Vercel | vercel.json |

## Architecture

```
ai-class-week-3/                          # Workspace root (git root)
├── CLAUDE.md                             # This file
├── ARCHITECTURE.md                       # System architecture doc
├── .claude/                              # Claude Code config + rules
├── strawberry-star-travel-app/           # React frontend (active)
│   ├── src/
│   │   ├── features/
│   │   │   ├── home/                     # Landing page + carousel
│   │   │   ├── stars/                    # Star catalog, search, detail
│   │   │   │   ├── components/
│   │   │   │   ├── data/stars.json       # HYG star catalog (client-side)
│   │   │   │   ├── services/wikipedia.ts
│   │   │   │   ├── utils/astronomy.ts
│   │   │   │   └── tests/
│   │   │   ├── favorites/                # Supabase-backed saved stars
│   │   │   ├── dashboard/                # User dashboard
│   │   │   ├── profile/                  # Profile + Cloudinary avatar
│   │   │   └── galactic-map/             # Stub — not yet implemented
│   │   ├── hooks/                        # Shared hooks
│   │   │   ├── useStars.ts
│   │   │   ├── useFavorites.ts
│   │   │   └── useWikipediaSummary.ts
│   │   ├── components/                   # Shared UI components
│   │   ├── context/UserContext.tsx        # Auth state via useUser()
│   │   ├── lib/supabaseClient.ts         # Singleton Supabase client
│   │   └── main.tsx                      # Entry point + router
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
└── strawberry-star-server/               # Node.js/Express backend (planned)
```

## Development Commands

All commands run from `strawberry-star-travel-app/` directory:

```bash
npm install                    # Install dependencies (run first)
npm run dev                    # Vite dev server (localhost:5173)
npm run build                  # Production build (outputs to dist/)
npm test                       # Run all tests (vitest run)
npm run test:watch             # Watch mode (vitest)
npm run lint                   # ESLint
npm run format                 # Prettier — write fixes
npm run format:check           # Prettier — check only
npx vitest run src/hooks/useFavorites.test.ts  # Single test file
```

## Code Style & Conventions

### Naming

| Item | Convention | Example |
|------|-----------|---------|
| Variables/functions | camelCase | `filteredStars`, `handleFavoriteToggle`, `fetchWikipediaSummary` |
| Hooks | camelCase + `use` prefix | `useStars`, `useFavorites`, `useUser` |
| Constants | SCREAMING_SNAKE_CASE | `PARSEC_TO_LIGHTYEAR`, `WIKIPEDIA_API` |
| Components/files | PascalCase | `StarCard.tsx`, `HomeCarousel.tsx`, `Profile.tsx` |
| Interfaces/types | PascalCase | `interface Star`, `type SortField`, `type HomeFeature` |
| Feature dirs | lowercase kebab-case | `galactic-map/`, `stars/` |

### File Organization

- Feature-sliced layout: each feature owns its components, data, utils, services, tests
- Shared hooks in `src/hooks/`, shared UI in `src/components/`
- `import type` required for type-only imports (enforced by `verbatimModuleSyntax` in tsconfig)
- Default exports for components; named exports for hooks and utilities

### Prettier Config

2 spaces, double quotes, semicolons, ES5 trailing commas, 100 char print width.

## Testing

- **Framework**: Vitest 4 + @testing-library/react + jsdom
- **Hook/service tests**: sibling to source (`src/hooks/useFavorites.test.ts`)
- **Component/integration tests**: feature `tests/` subdirectory (`src/features/stars/tests/StarsList.integration.test.tsx`)
- **Integration tests**: use `.integration.test.tsx` suffix
- **Mocking**: `vi.hoisted()` for module-level mocks, `vi.stubGlobal()` for browser APIs

Run tests after every non-trivial change. Treat failing tests as the highest priority signal.

## Git Conventions

### Commit Messages — Conventional Commits

```
feat: add star distance sorting to catalog
fix: resolve favorites not persisting after logout
chore: update Tailwind to v4.1.18
docs: add architecture diagram to ARCHITECTURE.md
style: format Profile.tsx with Prettier
refactor: extract Wikipedia fetch into dedicated hook
test: add integration tests for StarsList filtering
```

### Branch Naming

```
feature/<short-description>
fix/<short-description>
chore/<short-description>
```

## Guardrails

- **Never read `.env` file contents** — Claude Code settings deny access to `.env*` files
- **Never hardcode API keys**, Cloudinary config, or Supabase credentials — use `import.meta.env.VITE_*`
- **Features must NOT import from other features** — `src/features/stars/` cannot import from `src/features/favorites/`
- **`useUser()` is the only approved way to access auth state** — never import `supabaseClient` directly in components
- **Do NOT commit automatically** — always recommend the git command + Conventional Commits message for the user to run
- **Galactic Map is a stub** — do not add business logic to it without explicit instruction

## Maintenance

When Claude makes a mistake in this codebase, add a rule to `.claude/rules/` to prevent it. Quarterly: audit this file for accuracy.
