# Spec: 03 — JWT Authentication System

## Context
The app uses Supabase for authentication today. Phase 2 migrates auth to a custom Node.js/Express backend backed by MongoDB. This spec replaces all Supabase auth calls with a JWT system: a Mongoose User model, bcrypt password hashing, and a new AuthContext in the React frontend. Supabase stays installed for now (favorites DB access is deferred to Phase 4).

---

## Prerequisites

### Backend (strawberry-star-server/)
```bash
npm install mongoose bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### Frontend
No new packages. Auth uses native `fetch` + `localStorage`.

---

## Backend Changes — strawberry-star-server/

### New files

**`src/types/auth.ts`**
Plain TS interfaces — no imports needed:
```ts
export interface AuthUser { id: string; email: string; username?: string; }
export interface LoginBody { email: string; password: string; }
export interface RegisterBody { email: string; password: string; username?: string; }
export interface AuthResponse { token: string; user: AuthUser; }
export interface JwtPayload { id: string; email: string; username?: string; }
```

**`src/models/User.ts`**
Mongoose schema. Key details:
- `password` field: `select: false` — login route MUST use `.select("+password")`
- `import type { Document, Model } from "mongoose"` (verbatimModuleSyntax)
- Export: `UserDocument` (extends Document), `UserModel`

**`src/middleware/authenticateJWT.ts`**
- Reads `Authorization: Bearer <token>`, calls `verify()` from jsonwebtoken
- Extends `Express.Request` via `declare global` to add `user?: AuthUser`
- On invalid/missing token → `res.status(401)` directly (do NOT call `next`)
- On JWT_SECRET missing → `next(new Error(...))` (let errorHandler handle it)

**`src/routes/auth.ts`**
Named export: `export const authRouter = Router()`

`POST /api/auth/register`:
- Validate `email` + `password` present → 400 if missing
- Check duplicate email → 409
- `hash(password, 10)` with bcryptjs, `UserModel.create(...)` → sign JWT → 201 `AuthResponse`

`POST /api/auth/login`:
- Validate body → 400
- `UserModel.findOne({ email }).select("+password")` → if null → 401
- `compare(password, user.password)` → if false → 401
- **Same error message for both 401 cases**: `"Invalid email or password"` (prevents user enumeration)
- Sign JWT → 200 `AuthResponse`

JWT signing helper: `sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" })`

**`src/routes/auth.test.ts`**
Use `vi.hoisted()` to mock both `../models/User.js` and `bcryptjs`:
- Mock `UserModel.findOne` returns object with `.select()` method (chained pattern)
- Mock `bcryptjs.hash` and `bcryptjs.compare`
- Set `process.env.JWT_SECRET = "test-secret"` at top level (before app import)

Tests (7):
- register 201 with token + user
- register 409 duplicate email
- register 400 missing email
- register 400 missing password
- login 200 with token
- login 401 wrong password
- login 401 unknown email (same message as wrong password)

### Modified files

**`src/app.ts`** — Add:
```ts
import { authRouter } from "./routes/auth.js";
app.use("/api/auth", authRouter);  // before errorHandler
```

**`src/server.ts`** — Wrap in async `startServer()`:
```ts
import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/strawberry-star";
async function startServer() {
  await mongoose.connect(MONGODB_URI);
  app.listen(PORT, ...);
}
startServer();
```
`mongoose.connect` lives ONLY in `server.ts` (excluded from test coverage) — `app.ts` stays pure.

**`.env.example`** (create):
```
PORT=3000
ALLOWED_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/strawberry-star
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=7d
```

---

## Frontend Changes — strawberry-star-travel-app/

### New file

**`src/app/context/AuthContext.tsx`**
Replaces `UserContext.tsx` as auth source of truth.

Interface:
```ts
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): void;
  register(email: string, password: string, username?: string): Promise<void>;
}
```

localStorage keys: `"authToken"`, `"authUser"` (JSON-stringified `AuthUser`)

On mount (`useEffect`): read both keys, parse `authUser`, hydrate state, `setLoading(false)`.

`login()` / `register()`: POST to `VITE_API_URL/api/auth/login` (or `/register`), store to localStorage, set state. **Throw errors** — callers display them.

`logout()`: clear both localStorage keys, null out state.

Export: `AuthContext`, `AuthProvider`, `useAuth()` hook, `AuthUser` interface.

### Modified files

**`src/hooks/useUser.ts`** — Switch from `UserContext` → `AuthContext`. Return only `{ user, loading }` (keeps existing consumer API intact). Update error string to `"useUser must be used inside <AuthProvider>"`.

**`src/auth/Login.tsx`** — Remove `supabase` import. Destructure `{ login }` from `useAuth()`. Replace `supabase.auth.signInWithPassword()` with `await login(email, password)` in a try/catch. Keep all UI logic (countdown, redirect) unchanged.

**`src/auth/Signup.tsx`** — Remove `supabase` import. Destructure `{ register }` from `useAuth()`. Replace `supabase.auth.signUp()` with `await register(email, password, username)`. Note: `firstName`/`lastName` stay in the UI form but are NOT sent to the backend this phase (deferred to Phase 4).

**`src/main.tsx`** — Replace `<UserProvider>` with `<AuthProvider>`. Remove `UserContext` import.

**`src/components/Navbar.tsx`**:
- Remove `supabase` import
- Destructure `{ logout }` from `useAuth()`
- Replace `async supabase.auth.signOut()` with synchronous `logout()`
- Replace `user?.user_metadata?.username` → `user?.username`
- Replace `user?.user_metadata?.avatar` → `undefined` (falls back to Strawberry image)

**`src/features/dashboard/Dashboard.tsx`**:
- Replace `user?.user_metadata?.username` → `user?.username`
- Replace `user?.user_metadata?.avatar` → `undefined`

**`src/features/profile/Profile.tsx`**:
- Fix all `user?.user_metadata?.*` paths for TypeScript: `username` → `user?.username`, `firstName`/`lastName`/`avatar` → `""`
- Stub `handleUpdateProfile` and `handleChangePassword` to show a `"Profile updates coming in Phase 4"` message (remove Supabase calls)

**`src/hooks/useUser.test.tsx`**:
- Replace `UserContext` mock with `AuthContext` mock
- Replace Supabase `User` mock object with `AuthUser`: `{ id: "user-123", email: "test@example.com" }`
- Mock context value must include full `AuthContextType` shape (login, logout, register, token)
- Update error assertion to match new message string

---

## Known Breakages (document in code comments)

**`useFavorites.ts`** — Add TODO comment:
> Phase 4: Supabase RLS rejects queries without a Supabase auth session. Favorites broken at runtime post-migration. Tests still pass (Supabase is fully mocked).

**`Profile.tsx`** — After stubbing Supabase calls: profile save/password change are no-ops until Phase 4 adds backend endpoints.

**`Avatar`** — Falls back to strawberry image for all users (Cloudinary upload deferred).

---

## Verification

### Backend
```bash
npx tsc --noEmit   # zero errors
npm test           # all tests pass (including 7 new auth tests)
npm run lint
```
Manual smoke test (with MongoDB running):
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d '{"email":"test@star.dev","password":"star1234","username":"voyager"}'
# → 201 { token, user }

curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"test@star.dev","password":"wrongpass"}'
# → 401 "Invalid email or password"
```

### Frontend
```bash
npx tsc --noEmit   # zero errors (catches all user_metadata path changes)
npm test           # all tests pass including updated useUser.test.tsx
npm run build      # clean build, no warnings
```
Manual E2E:
1. Sign Up → form submits → success + redirect to `/`
2. Log In → success → redirect to `/dashboard`, navbar shows username
3. Refresh while logged in → user persists from localStorage
4. Log Out → localStorage cleared → protected routes redirect to `/`

---

## File Summary

| File | Action | Project |
|------|--------|---------|
| `src/types/auth.ts` | Create | Server |
| `src/models/User.ts` | Create | Server |
| `src/middleware/authenticateJWT.ts` | Create | Server |
| `src/routes/auth.ts` | Create | Server |
| `src/routes/auth.test.ts` | Create | Server |
| `src/app.ts` | Modify | Server |
| `src/server.ts` | Modify | Server |
| `.env.example` | Create | Server |
| `src/app/context/AuthContext.tsx` | Create | Frontend |
| `src/hooks/useUser.ts` | Modify | Frontend |
| `src/hooks/useUser.test.tsx` | Modify | Frontend |
| `src/auth/Login.tsx` | Modify | Frontend |
| `src/auth/Signup.tsx` | Modify | Frontend |
| `src/main.tsx` | Modify | Frontend |
| `src/components/Navbar.tsx` | Modify | Frontend |
| `src/features/dashboard/Dashboard.tsx` | Modify | Frontend |
| `src/features/profile/Profile.tsx` | Modify | Frontend |
