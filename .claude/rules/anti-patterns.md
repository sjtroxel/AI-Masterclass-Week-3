## Module Boundaries
- Features MUST NOT import from other features (`src/features/stars/` cannot import from `src/features/favorites/`)
- Access auth state ONLY via `useUser()` hook — never import `supabaseClient` directly in components
- The `supabaseClient` singleton is accessed only through hooks (`useFavorites`, etc.), never directly in UI

## Frontend
- Do not add business logic to `galactic-map/` — it is a placeholder stub awaiting design
- Do not fetch star data from a server — the HYG catalog is client-side only in `stars.json`
- Do not call the Wikipedia API outside of `useWikipediaSummary` hook

## Credentials
- Never hardcode Cloudinary cloud name, upload preset, Supabase URL, or Supabase keys
- All external service config belongs in `.env` as `VITE_*` variables

## Backend ESM Imports (strawberry-star-server)
- `jsonwebtoken` is CJS-only — NEVER use `import { sign } from "jsonwebtoken"` or `import { verify } from "jsonwebtoken"`
- Correct pattern: `import jwt from "jsonwebtoken"; const { sign } = jwt;` (matches NodeNext CJS interop)
- Same rule applies to any other CJS package that lacks named ESM exports

## Git
- Never commit automatically — always recommend the git command + Conventional Commits message for the user
- Never amend published commits
