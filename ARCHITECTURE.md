# ARCHITECTURE.md

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ai-class-week-3/                      │
│                   (Workspace Root)                       │
│                                                         │
│  ┌──────────────────────┐   ┌────────────────────────┐  │
│  │ strawberry-star-      │   │ strawberry-star-       │  │
│  │ travel-app/           │   │ server/                │  │
│  │ (React Frontend)      │   │ (Node.js/Express)      │  │
│  │                       │   │ *** NOT YET BUILT ***  │  │
│  │  Vite 7 + React 19   │   │                        │  │
│  │  TypeScript 5.9       │   │  Will handle:          │  │
│  │  Tailwind CSS 4       │   │  - Auth                │  │
│  │                       │   │  - Data API            │  │
│  └───────┬───────────────┘   │  - Business logic      │  │
│          │                   └────────────────────────┘  │
│          │                                               │
└──────────┼───────────────────────────────────────────────┘
           │
           ▼
   ┌───────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐
   │   Supabase    │  │ Cloudinary │  │Wikipedia │  │  Vercel │
   │ Auth + DB     │  │  Avatars   │  │  API     │  │ Hosting │
   └───────────────┘  └────────────┘  └──────────┘  └─────────┘
```

## Frontend Module Responsibilities

### Features (`src/features/`)

| Module | Responsibility |
|--------|---------------|
| **home/** | Landing page with hero section and `HomeCarousel` showcasing featured stars. Entry point for unauthenticated users. |
| **stars/** | Core catalog feature: star listing with Fuse.js search, filtering, sorting, pagination, and individual star detail views with Wikipedia summaries. Contains the HYG star data (`data/stars.json`), astronomy utilities, and Wikipedia service. |
| **favorites/** | Displays user's saved stars. Reads from Supabase `user_favorites` table via `useFavorites` hook. Requires authentication. |
| **dashboard/** | Authenticated user dashboard providing an overview of activity and quick access to favorites and profile. |
| **profile/** | User profile management including Cloudinary-powered avatar upload (unsigned preset). Requires authentication. |
| **galactic-map/** | Placeholder stub. Route exists but no business logic implemented. Awaiting design and backend support. |

### Shared Layers

| Module | Responsibility |
|--------|---------------|
| **hooks/** | Cross-cutting data hooks: `useStars` (Fuse.js search + filter + sort + paginate), `useFavorites` (Supabase CRUD for saved stars), `useWikipediaSummary` (Wikipedia REST API fetch). |
| **components/** | Shared UI primitives used across features (e.g., `Starfield` background, `ProtectedRoute`). |
| **context/** | `UserContext.tsx` wraps the app with Supabase auth state, exposing the `useUser()` hook as the single public API for auth. |
| **lib/** | `supabaseClient.ts` — singleton Supabase client instance. Accessed only by hooks, never directly by components. |

## Data Flow

### Star Catalog (client-side only)
```
stars.json (HYG catalog, ~119K stars)
  → useStars hook
    → Fuse.js fuzzy search
    → Filter by constellation, spectral class
    → Sort by distance, magnitude, name
    → Paginate
  → StarsList / StarDetail components
```

### Authentication
```
Supabase Auth (email/password, OAuth)
  → UserContext.tsx (onAuthStateChange listener)
    → useUser() hook
      → All features that need auth state
ProtectedRoute wraps authenticated routes (routing guard only, not a security boundary)
```

### Favorites
```
User action (toggle favorite)
  → useFavorites hook
    → Supabase PostgreSQL: INSERT/DELETE on user_favorites table
    → Re-fetch user's favorites list
  → FavoritesList component
```

### Wikipedia Summaries
```
Star detail page loads
  → useWikipediaSummary hook
    → Wikipedia REST API (public, no auth)
    → Filters results to astronomy-relevant articles
  → StarDetail component
```

### Avatar Upload
```
Profile page
  → Cloudinary unsigned upload (VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET)
  → Returns image URL
  → Stored in user profile
```

## External Integrations

| Service | Purpose | Config Mechanism | Auth |
|---------|---------|-----------------|------|
| Supabase | Auth + PostgreSQL (user_favorites) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Anon key (RLS enforced) |
| Cloudinary | Avatar image upload | `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned preset |
| Wikipedia | Star article summaries | Public REST API | None |
| Vercel | Static SPA hosting | `vercel.json` (catch-all rewrite) | Git integration |

## Dependency Rules (Frontend)

```
src/lib/supabaseClient.ts          ← Lowest level, no app imports
        ↓
src/context/UserContext.tsx         ← Wraps Supabase auth, exports useUser()
        ↓
src/hooks/*                        ← Data layer (useStars, useFavorites, etc.)
        ↓
src/features/**                    ← Leaf nodes — consume hooks + shared components
        ↑
src/components/*                   ← Shared UI, imported by any feature
```

**Rules:**
- Features MUST NOT import from other features
- Components MUST NOT import from features
- Only hooks may access `supabaseClient` — components use `useUser()` for auth
- `useWikipediaSummary` is the only module that calls the Wikipedia API

## Upcoming Evolution

### Migration from Supabase to Node.js/Express Backend

The project is moving away from Supabase as the primary backend:

- **`strawberry-star-server/`** will be a Node.js/Express backend, built as a sibling directory to the frontend. It does not exist yet.
- The backend will eventually take over data and auth responsibilities currently handled by Supabase directly from the frontend.
- The frontend will call the Express API instead of Supabase directly. The migration path is TBD — expect a transitional period where both Supabase and the Express API coexist.
- **Galactic Map** is a planned feature awaiting backend support. The route exists as a stub in the frontend; do not add business logic to it without explicit instruction.
- The Supabase service role key must never be exposed to the frontend — it will live exclusively in the backend's server-side environment variables.

## 🐱 Appendix: Quality Control & Emotional Support

The project follows a strict dual-oversight protocol provided by the resident feline executives. Their presence is a core part of the development environment.

| Executive | Primary Responsibility | Behavior Pattern |
|-----------|-------------------------|------------------|
| **Strawberry** | VP of Happiness & Code Review | Sits in her soft warm cat bed daily; purring is a required background service for successful builds. |
| **PingFoot** | Director of Moral Support | Participates selectively; primary focus is on resource allocation (specifically ten meals a day). |

**Architectural Note:** The "visual breathing room" and "calm UI" philosophy is directly inspired by Strawberry’s preference for peaceful, clutter-free environments.