# Spec 06 — Demo Mode

## Context
Users are hesitant to create accounts before experiencing the app. A "Try Demo Mode" button on the landing page gives instant, frictionless access to a fully-functional guest session. The session uses a generated identity (`guest_[timestamp]@demo.com`) stored entirely in the browser, auto-expires after 48 hours, and requires zero backend changes.

## Scope
Frontend-only. No backend changes. No new packages.

## The Hotel Key Card Model
- **Real user**: permanent account, JWT token, server-persisted favorites
- **Demo user**: ephemeral localStorage-based session, client-side favorites, 48h TTL — same full UI access

---

## Entry Point — `src/features/home/Home.tsx`
In the hero CTA section (currently shows "Begin Your Journey" when logged out), add a **"Try Demo Mode"** button **alongside** it:
- Only rendered when `!user`
- Calls `startDemo()` from `useAuth()` then `navigate('/dashboard')` immediately — **no countdown, no form**
- Styled as a secondary/ghost button so "Begin Your Journey" (primary CTA) remains visually dominant

---

## Auth State Extension — `src/app/context/AuthContext.tsx`
Add to context interface and implementation:
- `isDemoMode: boolean`
- `startDemo: () => void`

**`startDemo()` logic:**
1. Generate identity: `guest_${Date.now()}@demo.com`
2. Create user object: `{ id: 'demo_${timestamp}', email, username: 'Demo Explorer' }`
3. Write to localStorage: `demoSession = { user, demoCreatedAt: Date.now() }`
4. Set state: `setUser(user)`, `setToken(null)`, `setIsDemoMode(true)`

**On mount** (alongside existing token hydration):
- Check for `demoSession` in localStorage
- If found and `Date.now() - demoCreatedAt < 48 * 60 * 60 * 1000` → hydrate demo state (`setUser`, `setIsDemoMode`)
- If found and expired → `localStorage.removeItem('demoSession')` + `localStorage.removeItem('demoFavorites')` → user is null → home

**`logout()` update:** also clears `demoSession` and `demoFavorites` from localStorage

---

## User Hook — `src/hooks/useUser.ts`
Expose `isDemoMode` in the return value:
```typescript
return { user: ctx.user, loading: ctx.loading, isDemoMode: ctx.isDemoMode };
```

---

## Favorites — `src/hooks/useFavorites.ts`
When `isDemoMode` is `true`:
- **Load**: `JSON.parse(localStorage.getItem('demoFavorites') ?? '[]')`
- **Add**: Append star ID to array, write back to localStorage
- **Remove**: Filter array, write back to localStorage
- No backend calls at all

When `isDemoMode` is `false`: existing logic is completely unchanged.

---

## Navbar — `src/components/Navbar.tsx`
When `isDemoMode` is `true`:
- Username display shows "Demo Explorer" with a `[DEMO]` badge
- Hamburger menu includes **"Exit Demo"** item (calls `logout()`, navigates to `/`)
- "Log In" / "Sign Up" buttons are hidden (demo user is already "inside" the app)

---

## Profile — `src/features/profile/Profile.tsx`
When `isDemoMode` is `true`:
- Save/change-password buttons are disabled
- Show a small note: "Sign up for a free account to save your profile"

---

## 48-Hour Expiry
Checked passively on app mount (inside AuthContext `useEffect`). No active timer needed.

Expired demo → `user` stays `null` → `ProtectedRoute` redirects to home naturally. No special error page.

---

## Demo Experience by Feature
| Feature | Demo Behavior |
|---------|---------------|
| Dashboard | "Welcome, Demo Explorer!" — fully functional |
| Browse Stars | Full catalog; add/remove favorites via localStorage |
| Favorites | Displays localStorage-saved favorites |
| Galactic Map | Starter stars always visible; catalog stars = localStorage favorites |
| Profile | Shows demo email + username; save buttons disabled with "Sign up" note |
| WarpDrive | **Unchanged** — purely client-side, works for all users |
| Course Path | **Unchanged** — purely client-side, works for all users |

---

## Files to Modify (6 total, 0 new files)
1. `src/app/context/AuthContext.tsx` — add `isDemoMode`, `startDemo()`, demo localStorage hydration/cleanup
2. `src/hooks/useFavorites.ts` — add demo-mode localStorage branch
3. `src/hooks/useUser.ts` — expose `isDemoMode`
4. `src/features/home/Home.tsx` — add "Try Demo Mode" button in hero CTA section
5. `src/components/Navbar.tsx` — add DEMO badge + "Exit Demo" menu item
6. `src/features/profile/Profile.tsx` — disable save buttons in demo mode

## What Is NOT Changing
- `ProtectedRoute.tsx` — no changes needed (demo user has a non-null `user` object)
- `GalacticMap.tsx` — WarpDrive, CourseLine, FootReadout untouched
- `strawberry-star-server/` — zero backend changes
- Route structure — no new routes; demo users access all existing protected routes

---

## Verification
1. `npm run dev` in `strawberry-star-travel-app/`
2. Home page (logged out) → "Try Demo Mode" button visible → click → lands on `/dashboard` as "Demo Explorer" with `[DEMO]` badge
3. Browse Stars → add a favorite → navigate to Favorites → star appears
4. Galactic Map → that same favorited star is visible as a catalog star
5. Profile → shows demo email, save buttons disabled with "Sign up" message
6. Navbar hamburger → "Exit Demo" → redirects to home as unauthenticated
7. 48h expiry simulation: manually set `demoCreatedAt` to 49h ago in DevTools localStorage → refresh → session cleared, home shown unauthenticated
8. `npm test` — all existing tests pass (no behavior changed for real users)
