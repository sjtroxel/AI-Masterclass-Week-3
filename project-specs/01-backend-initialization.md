# `01-backend-initialization.md` — Express Backend Scaffold

**Status:** Approved
**Phase:** 2 — Express.js Backend
**Date:** 2026-02-20

---

## Overview

Initialize `strawberry-star-server/` as a Node.js/Express REST API with TypeScript and Vitest.
This is the foundation for migrating auth and data responsibilities away from Supabase. The
directory is a sibling to `strawberry-star-travel-app/` under the workspace root.

---

## Architecture Decision: Layered Architecture

The backend uses a **layered** architecture rather than feature-slice (used by the frontend).

**Why:** REST API concerns cut across features. A request flows through:
`cors → json → auth → route handler → service → response`

Feature-slice is appropriate for UI surfaces. Layered architecture is the standard Express
convention and scales cleanly as the server absorbs more responsibilities.

**Future layers to add as needed:**
- `src/services/` — business logic (add when first service is needed)
- `src/middleware/requireAuth.ts` — JWT/session guard
- `src/types/express.d.ts` — augment `Request` to include `req.user`

---

## Final Directory Structure

```
strawberry-star-server/
├── src/
│   ├── app.ts                        # Express app factory (NO listen call)
│   ├── server.ts                     # Entry point — calls app.listen()
│   ├── routes/
│   │   ├── health.ts                 # GET /health
│   │   └── health.test.ts            # Unit tests (supertest)
│   ├── middleware/
│   │   └── errorHandler.ts           # Global error handler (4-param signature)
│   └── test/
│       └── setup.ts                  # Vitest global setup (minimal)
├── tests/
│   └── health.integration.test.ts    # Integration test (full middleware stack)
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .prettierrc
```

---

## Tech Stack

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | LTS (22.x) | Runtime |
| Express | ^4.22.1 | v4, not v5 — more stable, better docs |
| TypeScript | ~5.9.3 | Pin-matched to frontend |
| Vitest | ^4.0.18 | Pin-matched to frontend |
| supertest | ^7.2.2 | HTTP assertions for Express in tests |
| tsx | ^4.21.0 | Dev TypeScript runner (replaces ts-node) |
| ESLint | ^9.39.1 | Pin-matched to frontend |
| Prettier | ^3.5.1 | Pin-matched to frontend |

---

## Key Configuration Decisions

### TypeScript: `module: NodeNext`

The backend uses `module: NodeNext` + `moduleResolution: NodeNext` (NOT the frontend's
`moduleResolution: bundler`). Node.js requires explicit `.js` extensions on ESM imports.
TypeScript enforces this at compile time with `NodeNext`.

```ts
// ✅ correct — .js extension required with NodeNext
import app from "./app.js";

// ❌ wrong — fails at Node.js runtime even if TypeScript accepts it
import app from "./app";
```

### Vitest: `environment: "node"`

The backend uses `environment: "node"`, NOT `jsdom`. There is no browser DOM on the server.

### `app.ts` / `server.ts` Split

`app.ts` exports the Express app with no `listen()` call. `server.ts` imports `app` and calls
`app.listen()`. This split is **required** for testing — see Testing Strategy below.

### Global Error Handler: 4 Parameters Required

Express identifies error-handling middleware by `function.length === 4`. The `_next` parameter
must be present even if unused. Removing it silently breaks error handling.

---

## Source Files

### `src/app.ts`

```typescript
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use("/health", healthRouter);

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
```

### `src/server.ts`

```typescript
import app from "./app.js";

const PORT = process.env.PORT ?? "3000";

app.listen(Number(PORT), () => {
  console.log(`strawberry-star-server running on port ${PORT}`);
});
```

### `src/routes/health.ts`

```typescript
import { Router } from "express";
import type { Request, Response } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
```

### `src/middleware/errorHandler.ts`

```typescript
import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: err.message ?? "Internal server error",
  });
}
```

---

## Testing Strategy

### Why `app.ts` / `server.ts` are split

If `app.listen()` lived in `app.ts`, importing `app` in any test file would immediately bind a
port. Running two test files in parallel → `EADDRINUSE` port conflict.

The split isolates the testable part (middleware + routes) from the untestable part (network
binding):

```
Tests:      import app  →  app.ts (no listen)
                                ↓
                        supertest wraps app in ephemeral HTTP server
                        → random port → request → response → closes
                        No port conflicts. No leaked servers.

Production: node dist/server.js  →  server.ts  →  app.listen(PORT)
```

### How `supertest` works

```ts
const response = await supertest(app).get("/health");
```

`supertest` wraps the Express app in a temporary HTTP server, sends the request on a random
available port, captures the response, and closes the server — all in one `await`. You never
call `app.listen()` in tests.

### Unit Test (`src/routes/health.test.ts`)

Sibling to source, `.test.ts` suffix — matches the frontend hook test convention.

```typescript
import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";

const request = supertest(app);

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const response = await request.get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns a valid ISO 8601 timestamp", async () => {
    const response = await request.get("/health");
    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("returns JSON content-type", async () => {
    const response = await request.get("/health");
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });
});
```

### Integration Test (`tests/health.integration.test.ts`)

Top-level `tests/` directory, `.integration.test.ts` suffix — matches the frontend pattern.

```typescript
import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../src/app.js";

describe("Health endpoint — integration", () => {
  it("returns 200 and a well-formed health payload", async () => {
    const response = await supertest(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      timestamp: expect.any(String),
    });
  });

  it("returns 404 for an unknown route", async () => {
    const response = await supertest(app).get("/nonexistent");
    expect(response.status).toBe(404);
  });
});
```

### Test File Placement

| Type | Location | Suffix |
|------|----------|--------|
| Unit (route/service) | Sibling to source: `src/routes/health.test.ts` | `.test.ts` |
| Integration | Top-level `tests/` directory | `.integration.test.ts` |

---

## Verification Checklist

After `npm install` in `strawberry-star-server/`:

```bash
npx tsc --noEmit          # TypeScript — expect zero errors
npm run lint              # ESLint — expect zero errors
npm run format:check      # Prettier — expect all files formatted
npm test                  # Vitest — expect 5 tests passing
npm run dev               # Dev server — expect port 3000
curl http://localhost:3000/health  # Expect {"status":"ok","timestamp":"..."}
```

---

## Commit Recommendation

After verification passes:

```bash
git add project-specs/ strawberry-star-server/
git commit -m "feat: initialize strawberry-star-server with Express, TypeScript, and Vitest"
```
