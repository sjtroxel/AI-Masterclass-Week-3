# Spec: 04 — Favorites Migration to MongoDB + Signup Redirect Fix

## Context
Favorites are currently fetched from Supabase (`user_favorites` table via `useFavorites.ts`). Phase 4 migrates them to the custom Node.js/MongoDB backend. JWT auth (from Phase 3) protects the new endpoints, and `req.user.id` from the decoded token serves as the userId. A small co-located fix changes the post-signup redirect from `/` to `/dashboard`, matching the post-login behavior.

---

## Prerequisites

### Backend
No new npm packages needed — `mongoose` and `jsonwebtoken` are already installed.

### Frontend
No new packages. Uses native `fetch` + `useAuth()` hook (already in `AuthContext.tsx`).

---

## Goal 1 — Small Fix: Signup Redirect

**File:** `strawberry-star-travel-app/src/auth/Signup.tsx`

Change line 84:
```diff
- navigate("/");
+ navigate("/dashboard");
```

---

## Goal 2 — Backend: Favorite Model & Routes

### New file: `strawberry-star-server/src/models/Favorite.ts`

```ts
import mongoose from "mongoose";
import type { Document, Model } from "mongoose";

export interface FavoriteDocument extends Document {
  userId: string;   // JWT payload id (MongoDB ObjectId stringified)
  starId: number;   // HYG catalog numeric star ID
  createdAt: Date;
}

const favoriteSchema = new mongoose.Schema<FavoriteDocument>({
  userId: { type: String, required: true },
  starId: { type: Number, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

favoriteSchema.index({ userId: 1, starId: 1 }, { unique: true });

export const FavoriteModel: Model<FavoriteDocument> =
  mongoose.model<FavoriteDocument>("Favorite", favoriteSchema);
```

### New file: `strawberry-star-server/src/routes/favorites.ts`

Both routes are protected by the existing `authenticateJWT` middleware.

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/favorites` | Returns `{ starIds: number[] }` for the authenticated user |
| `POST` | `/api/favorites/toggle` | Body `{ starId: number }` → insert or delete, returns `{ favorited: boolean, starId: number }` |

Toggle logic: find `{ userId: req.user.id, starId }` — if found delete it (favorited: false), else create it (favorited: true).

Return 400 if `starId` is missing or not a finite number.

```ts
import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { FavoriteModel } from "../models/Favorite.js";
// ... route implementations
export { favoritesRouter };
```

### Update: `strawberry-star-server/src/app.ts`

```diff
+ import { favoritesRouter } from "./routes/favorites.js";
  // ...
  app.use("/api/auth", authRouter);
+ app.use("/api/favorites", favoritesRouter);
```

### New file: `strawberry-star-server/src/routes/favorites.test.ts`

Follow patterns from `auth.test.ts`:
- `vi.hoisted()` to mock `FavoriteModel` (`.find()`, `.create()`, `.findOne()`, `.deleteOne()`) and `authenticateJWT`
- Mock `authenticateJWT` to inject `req.user = { id: "user1", email: "a@b.com" }` and call `next()`
- `supertest` for HTTP assertions

**Test cases:**
- `GET /api/favorites` → 401 with no token
- `GET /api/favorites` → 200 `{ starIds: [42, 7] }` when favorites exist
- `GET /api/favorites` → 200 `{ starIds: [] }` when no favorites
- `POST /api/favorites/toggle` → 400 if `starId` missing
- `POST /api/favorites/toggle` with new starId → 200 `{ favorited: true, starId: 42 }`
- `POST /api/favorites/toggle` with existing starId → 200 `{ favorited: false, starId: 42 }`

---

## Goal 3 — Frontend: Migrate `useFavorites`

### Update: `strawberry-star-travel-app/src/hooks/useFavorites.ts`

Replace all Supabase calls with `fetch()` to the Express backend.

**Key changes:**
- Import `useAuth` from `../app/context/AuthContext.js` instead of `useUser` — `useAuth()` exposes the JWT `token` needed for the `Authorization: Bearer` header
- `useUser()` only exposes `{ user, loading }` — not the token — so `useAuth()` is required here
- Use `import.meta.env.VITE_API_URL` as the base URL (same constant used in `AuthContext.tsx`)
- Keep the identical exported API surface:
  ```ts
  { favorites: number[], loading: boolean, addFavorite(star: Star): void, removeFavorite(starId: number): void, isFavorite(starId: number): boolean }
  ```

**Load favorites (on mount, when token changes):**
```
GET /api/favorites
Authorization: Bearer <token>
→ { starIds: number[] }
```

**`addFavorite(star)`:**
```
POST /api/favorites/toggle
Authorization: Bearer <token>
{ starId: star.id }
→ { favorited: true, starId: number }
```
On success: add `star.id` to local `favorites` array.

**`removeFavorite(starId)`:**
```
POST /api/favorites/toggle
Authorization: Bearer <token>
{ starId }
→ { favorited: false, starId: number }
```
On success: filter `starId` out of local `favorites` array.

**If no token** (user logged out): return `{ favorites: [], loading: false, ... }` immediately — no fetch.

### Update: `strawberry-star-travel-app/src/hooks/useFavorites.test.ts`

Replace Supabase mocks with `vi.hoisted()` + `vi.stubGlobal("fetch", ...)` pattern. Mock `useAuth` to return `{ user, token, loading: false, ... }`. Cover same scenarios as the current test suite.

---

## Critical Files

| File | Change |
|------|--------|
| `strawberry-star-travel-app/src/auth/Signup.tsx:84` | `navigate("/")` → `navigate("/dashboard")` |
| `strawberry-star-server/src/models/Favorite.ts` | **New** — Mongoose model |
| `strawberry-star-server/src/routes/favorites.ts` | **New** — GET + POST toggle routes |
| `strawberry-star-server/src/app.ts` | Mount `favoritesRouter` at `/api/favorites` |
| `strawberry-star-server/src/routes/favorites.test.ts` | **New** — supertest tests |
| `strawberry-star-travel-app/src/hooks/useFavorites.ts` | Replace Supabase with fetch |
| `strawberry-star-travel-app/src/hooks/useFavorites.test.ts` | Replace Supabase mocks with fetch mocks |

---

## Verification

1. **Signup redirect:** Register a new account → confirm redirect to `/dashboard`.
2. **Backend — no token:** `GET /api/favorites` without Authorization header → 401.
3. **Backend — manual toggle:**
   - `POST /api/favorites/toggle` `{ starId: 42 }` → `{ favorited: true, starId: 42 }`
   - Repeat → `{ favorited: false, starId: 42 }`
4. **Backend tests:** `npm test` from `strawberry-star-server/` — all pass.
5. **Frontend tests:** `npm test` from `strawberry-star-travel-app/` — all pass.
6. **End-to-end:** Log in → browse stars → star a favorite → navigate to `/favorites` — starred star appears; unstar — it disappears.
