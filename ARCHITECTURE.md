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
│  │                       │   │ *** ACTIVE — Phase 2 **│  │
│  │  Vite 7 + React 19   │   │                        │  │
│  │  TypeScript 5.9       │   │  Handles:              │  │
│  │  Tailwind CSS 4       │   │  - Auth (JWT)          │  │
│  └───────┬───────────────┘   │  - Favorites API       │  │
│          │                   │  - Business logic      │  │
│          │                   └──────────┬─────────────┘  │
│          │                              │               │
└──────────┼──────────────────────────────┼───────────────┘
           │                              │
           ▼                              ▼
   ┌───────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐
   │  Express API  │  │ Cloudinary │  │Wikipedia │  │  Vercel │
   │  (JWT Auth +  │  │  Avatars   │  │  API     │  │ Hosting │
   │   Favorites)  │  └────────────┘  └──────────┘  └─────────┘
   └───────────────┘
```

## Frontend Module Responsibilities

### Features (`src/features/`)

| Module | Responsibility |
|--------|---------------|
| **home/** | Landing page with hero section and `HomeCarousel` showcasing featured stars. Entry point for unauthenticated users. Includes Demo Mode ("Try as Guest") entry point. |
| **stars/** | Core catalog feature: star listing with Fuse.js search, filtering, sorting, pagination, and individual star detail views with Wikipedia summaries. Contains the HYG star data (`data/stars.json`), astronomy utilities, and Wikipedia service. |
| **favorites/** | Displays user's saved stars. In authenticated mode, reads from the Express API via `useFavorites`. In Demo Mode, reads from `localStorage` under `demoFavorites`. |
| **dashboard/** | Authenticated user dashboard providing an overview of activity and quick access to favorites and profile. |
| **profile/** | User profile management including Cloudinary-powered avatar upload (unsigned preset). Requires authentication. |
| **galactic-map/** | Interactive 3-D star map with multi-stop path plotting, warp-drive camera transitions, HUD target-locking, and manual camera override. |

### Shared Layers

| Module | Responsibility |
|--------|---------------|
| **hooks/** | Cross-cutting data hooks: `useStars` (Fuse.js search + filter + sort + paginate), `useFavorites` (Express API CRUD or localStorage in Demo Mode), `useWikipediaSummary` (Wikipedia REST API fetch), `useUser` (thin wrapper over `useAuth()`). |
| **components/** | Shared UI primitives used across features (e.g., `Starfield` background, `ProtectedRoute`). |
| **app/context/** | `AuthContext.tsx` manages auth state (JWT + user), Demo Mode state (`isDemoMode`), and exposes `useAuth()`. `useUser()` in `src/hooks/useUser.ts` is the approved public hook for components. |
| **lib/** | `supabaseClient.ts` — legacy Supabase client, retained for any remaining Supabase-backed operations (e.g., avatar storage). Not used for auth or favorites. |

## Data Flow

### Star Catalog (client-side only)
```
stars.json (HYG catalog, ~119K stars)
  → useStars hook
    → Fuse.js fuzzy search
    → Filter by constellation, spectral class
    → Sort by distance, magnitude, name
    → Paginate
  → StarsList / StarDetail / GalacticMap components
```

### Authentication
```
Real user:
  POST /api/auth/login  or  POST /api/auth/register  (Express API)
    → JWT token + AuthUser object returned
      → AuthContext.tsx stores token + user in localStorage
        → useUser() / useAuth() expose to components

Demo user ("Hotel Key"):
  startDemo() in AuthContext.tsx
    → Synthetic AuthUser created (id: demo_<timestamp>)
    → demoSession object (user + demoCreatedAt) written to localStorage
    → 48-hour TTL enforced on next mount; expired sessions auto-cleared
    → isDemoMode = true, token = null

ProtectedRoute wraps authenticated routes (routing guard only, not a security boundary)
```

### Favorites
```
Authenticated user:
  User action (toggle favorite)
    → useFavorites hook
      → POST /api/favorites/toggle (Bearer JWT)
      → Updates local state
    → FavoritesList component

Demo user:
  User action (toggle favorite)
    → useFavorites hook (isDemoMode branch)
      → Read/write localStorage['demoFavorites']
      → Updates local state
    → FavoritesList component
  (Cleared on logout or when demo session expires)
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
| strawberry-star-server | Auth (JWT) + Favorites API | `VITE_API_URL` | Bearer JWT |
| Cloudinary | Avatar image upload | `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned preset |
| Wikipedia | Star article summaries | Public REST API | None |
| Vercel | Static SPA hosting | `vercel.json` (catch-all rewrite) | Git integration |

> **Note:** Supabase is no longer used for auth or favorites. `supabaseClient.ts` is retained only for any remaining legacy operations and will be removed when fully deprecated.

## Dependency Rules (Frontend)

```
src/app/context/AuthContext.tsx    ← Auth state; no app imports
        ↓
src/hooks/useUser.ts               ← Thin public wrapper (exposes user, loading, isDemoMode)
src/hooks/useFavorites.ts          ← Branches on isDemoMode: API vs localStorage
src/hooks/useStars.ts              ← Pure client-side, no auth dependency
        ↓
src/features/**                    ← Leaf nodes — consume hooks + shared components
        ↑
src/components/*                   ← Shared UI, imported by any feature
```

**Rules:**
- Features MUST NOT import from other features
- Components MUST NOT import from features
- Components access auth ONLY via `useUser()` — never import `AuthContext` directly
- `useWikipediaSummary` is the only module that calls the Wikipedia API
- Never send `Authorization` headers when `isDemoMode` is true

## Backend: strawberry-star-server

```
strawberry-star-server/
  src/
    routes/       ← auth.ts (login, register), favorites.ts
    middleware/   ← authenticate.ts (JWT verification)
    types/        ← shared TypeScript interfaces
  app.ts          ← Express app, NO listen() — exported for testing
  server.ts       ← calls app.listen(); entry point for runtime
```

- `module: NodeNext`, `moduleResolution: NodeNext` — all imports use `.js` extensions
- Tests use supertest against `app` directly; no listen() in tests
- `jsonwebtoken` is CJS-only — import as `import jwt from "jsonwebtoken"`, then destructure

## 🐱 Appendix: Quality Control & Emotional Support

The project follows a strict dual-oversight protocol provided by the resident feline executives. Their presence is a core part of the development environment.

| Executive | Primary Responsibility | Behavior Pattern |
|-----------|-------------------------|------------------|
| **Strawberry** | VP of Happiness & Code Review | Sits in her soft warm cat bed daily; purring is a required background service for successful builds. |
| **PingFoot** | Director of Moral Support | Participates selectively; primary focus is on resource allocation (specifically ten meals a day). |

**Architectural Note:** The "visual breathing room" and "calm UI" philosophy is directly inspired by Strawberry's preference for peaceful, clutter-free environments.
