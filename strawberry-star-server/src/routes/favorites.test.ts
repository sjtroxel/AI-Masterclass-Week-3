import { describe, it, expect, vi, beforeEach } from "vitest";
import supertest from "supertest";

const { mockFind, mockFindOne, mockDeleteOne, mockCreate, mockAuthenticateJWT } = vi.hoisted(
  () => ({
    mockFind: vi.fn(),
    mockFindOne: vi.fn(),
    mockDeleteOne: vi.fn(),
    mockCreate: vi.fn(),
    mockAuthenticateJWT: vi.fn(),
  }),
);

vi.mock("../models/Favorite.js", () => ({
  FavoriteModel: {
    find: mockFind,
    findOne: mockFindOne,
    deleteOne: mockDeleteOne,
    create: mockCreate,
  },
}));

vi.mock("../middleware/authenticateJWT.js", () => ({
  authenticateJWT: mockAuthenticateJWT,
}));

process.env.JWT_SECRET = "test-secret-do-not-use-in-prod";

import app from "../app.js";

const request = supertest(app);

beforeEach(() => {
  vi.clearAllMocks();
  // Default: pass auth and inject req.user
  mockAuthenticateJWT.mockImplementation((req: Express.Request, _res: unknown, next: () => void) => {
    (req as { user?: { id: string; email: string } }).user = { id: "user1", email: "test@example.com" };
    next();
  });
});

describe("GET /api/favorites", () => {
  it("returns 401 when no token is provided", async () => {
    mockAuthenticateJWT.mockImplementationOnce((_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }, _next: unknown) => {
      res.status(401).json({ status: "error", message: "No token provided" });
    });

    const res = await request.get("/api/favorites");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No token provided");
  });

  it("returns 200 with star IDs for an authenticated user", async () => {
    mockFind.mockReturnValue({
      select: vi.fn().mockResolvedValue([{ starId: 42 }, { starId: 7 }]),
    });

    const res = await request.get("/api/favorites").set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(200);
    expect(res.body.starIds).toEqual([42, 7]);
  });

  it("returns 200 with empty array when user has no favorites", async () => {
    mockFind.mockReturnValue({
      select: vi.fn().mockResolvedValue([]),
    });

    const res = await request.get("/api/favorites").set("Authorization", "Bearer fake-token");

    expect(res.status).toBe(200);
    expect(res.body.starIds).toEqual([]);
  });
});

describe("POST /api/favorites/toggle", () => {
  it("returns 400 when starId is missing", async () => {
    const res = await request
      .post("/api/favorites/toggle")
      .set("Authorization", "Bearer fake-token")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/starId/i);
  });

  it("returns 400 when starId is not a number", async () => {
    const res = await request
      .post("/api/favorites/toggle")
      .set("Authorization", "Bearer fake-token")
      .send({ starId: "forty-two" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/starId/i);
  });

  it("adds a favorite when it does not yet exist", async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ userId: "user1", starId: 42 });

    const res = await request
      .post("/api/favorites/toggle")
      .set("Authorization", "Bearer fake-token")
      .send({ starId: 42 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ favorited: true, starId: 42 });
  });

  it("removes a favorite when it already exists", async () => {
    mockFindOne.mockResolvedValue({ userId: "user1", starId: 42 });
    mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

    const res = await request
      .post("/api/favorites/toggle")
      .set("Authorization", "Bearer fake-token")
      .send({ starId: 42 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ favorited: false, starId: 42 });
  });
});
