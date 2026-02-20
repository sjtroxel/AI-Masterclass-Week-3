# `02-frontend-backend-bridge.md` — CORS & Connectivity

**Status:** Approved
**Phase:** 2 — Express.js Backend
**Date:** 2026-02-20

---

## Overview

The backend is initialized but uses `cors()` with no origin restriction. The frontend has no
mechanism to talk to it. This task connects the two: tightens CORS to an explicit origin, adds
a `/api/status` route, and proves the live connection via a `ServerStatusBadge` component on
the Dashboard.

---

## Changes

### Backend

| File | Change |
|------|--------|
| `src/app.ts` | Restrict CORS to `ALLOWED_ORIGIN` env var + register `/api/status` |
| `src/routes/status.ts` | New: `GET /api/status` returns `{ message, version }` |
| `src/routes/status.test.ts` | New: 3 unit tests incl. CORS header assertion |
| `.env.example` | Add `ALLOWED_ORIGIN=http://localhost:5173` |

### Frontend

| File | Change |
|------|--------|
| `src/hooks/useServerStatus.ts` | New: fetch hook for `/api/status` |
| `src/hooks/useServerStatus.test.ts` | New: 3 unit tests (mock fetch) |
| `src/features/dashboard/components/ServerStatusBadge.tsx` | New: displays server status |
| `src/features/dashboard/Dashboard.tsx` | Update: render `<ServerStatusBadge />` |
| `.env.example` | Add `VITE_API_URL=http://localhost:3000` |

---

## Key Decisions

### CORS — explicit origin over wildcard

`cors()` with no options allows any origin (`*`). Using `cors({ origin: ALLOWED_ORIGIN })` with
an env variable means the same binary works in both environments:

- Development: env var defaults to `http://localhost:5173`
- Production: set `ALLOWED_ORIGIN=https://your-app.vercel.app` in hosting config

### `/api/status` route prefix

Mounted directly: `app.use("/api/status", statusRouter)`. When multiple `/api/*` routes exist,
extract them into a `src/routes/api/index.ts` aggregator router.

### `useServerStatus` hook pattern

Mirrors `useWikipediaSummary` — state triad `{ data, loading, error }`, fetches on mount,
errors surfaced via boolean flag. Uses `import.meta.env.VITE_API_URL ?? "http://localhost:3000"`.

### `ServerStatusBadge` — 3-state display

- Loading: gray pulsing dot + "Connecting to server..."
- Error: red dot + "Server offline"
- Success: green pulsing dot + server message

---

## Source Files

### `strawberry-star-server/src/app.ts`

```typescript
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { statusRouter } from "./routes/status.js";
import { errorHandler } from "./middleware/errorHandler.js";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";

const app = express();

// --- Middleware ---
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// --- Routes ---
app.use("/health", healthRouter);
app.use("/api/status", statusRouter);

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
```

### `strawberry-star-server/src/routes/status.ts`

```typescript
import { Router } from "express";
import type { Request, Response } from "express";

export interface StatusResponse {
  message: string;
  version: string;
}

export const statusRouter = Router();

statusRouter.get("/", (_req: Request, res: Response) => {
  const body: StatusResponse = {
    message: "Hello from Strawberry Server",
    version: "1.0.0",
  };
  res.json(body);
});
```

### `strawberry-star-travel-app/src/hooks/useServerStatus.ts`

```typescript
import React from "react";

interface ServerStatus {
  message: string;
  version: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function useServerStatus() {
  const [data, setData] = React.useState<ServerStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    fetch(`${API_URL}/api/status`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ServerStatus>;
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

---

## Verification

```bash
# Backend (from strawberry-star-server/)
npm test                                      # 8 tests passing
curl http://localhost:3000/api/status         # {"message":"Hello from Strawberry Server","version":"1.0.0"}
curl -H "Origin: http://localhost:5173" -v http://localhost:3000/api/status 2>&1 | grep access-control
# access-control-allow-origin: http://localhost:5173

# Frontend (from strawberry-star-travel-app/)
npm test                                      # all existing + 3 new tests pass
npm run build                                 # zero TypeScript errors

# End-to-end
# Terminal 1: npm run dev (from strawberry-star-server/)
# Terminal 2: npm run dev (from strawberry-star-travel-app/)
# Open http://localhost:5173/dashboard → log in → see green dot + "Hello from Strawberry Server"
```

---

## Commit Recommendation

```bash
git add strawberry-star-server/src/app.ts \
        strawberry-star-server/src/routes/status.ts \
        strawberry-star-server/src/routes/status.test.ts \
        strawberry-star-server/.env.example \
        strawberry-star-travel-app/src/hooks/useServerStatus.ts \
        strawberry-star-travel-app/src/hooks/useServerStatus.test.ts \
        strawberry-star-travel-app/src/features/dashboard/components/ServerStatusBadge.tsx \
        strawberry-star-travel-app/src/features/dashboard/Dashboard.tsx \
        strawberry-star-travel-app/.env.example
git commit -m "feat: connect frontend to backend with CORS config and /api/status route"
```
