import { describe, it, expect, vi, beforeEach } from "vitest";
import supertest from "supertest";

const { mockFindOne, mockCreate, mockHash, mockCompare } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
  mockCreate: vi.fn(),
  mockHash: vi.fn(),
  mockCompare: vi.fn(),
}));

vi.mock("../models/User.js", () => ({
  UserModel: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

vi.mock("bcryptjs", () => ({
  hash: mockHash,
  compare: mockCompare,
}));

process.env.JWT_SECRET = "test-secret-do-not-use-in-prod";
process.env.JWT_EXPIRES_IN = "1h";

import app from "../app.js";

const request = supertest(app);

beforeEach(() => {
  vi.clearAllMocks();
  mockHash.mockResolvedValue("$hashed$");
});

describe("POST /api/auth/register", () => {
  it("returns 201 with token and user on success", async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      _id: "abc123",
      email: "new@example.com",
      username: "star",
    });

    const res = await request
      .post("/api/auth/register")
      .send({ email: "new@example.com", password: "pass1234", username: "star" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("new@example.com");
    expect(res.body.user.username).toBe("star");
    expect(res.body.user.id).toBeDefined();
  });

  it("returns 409 when email is already registered", async () => {
    mockFindOne.mockResolvedValue({ email: "taken@example.com" });

    const res = await request
      .post("/api/auth/register")
      .send({ email: "taken@example.com", password: "pass1234" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request.post("/api/auth/register").send({ password: "pass1234" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request.post("/api/auth/register").send({ email: "new@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });
});

describe("POST /api/auth/login", () => {
  const mockUserDoc = {
    _id: "abc456",
    email: "login@example.com",
    username: "traveler",
    password: "$hashed$",
  };

  it("returns 200 with token on valid credentials", async () => {
    mockFindOne.mockReturnValue({ select: vi.fn().mockResolvedValue(mockUserDoc) });
    mockCompare.mockResolvedValue(true);

    const res = await request
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "correct" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("login@example.com");
    expect(res.body.user.username).toBe("traveler");
  });

  it("returns 401 when password is wrong", async () => {
    mockFindOne.mockReturnValue({ select: vi.fn().mockResolvedValue(mockUserDoc) });
    mockCompare.mockResolvedValue(false);

    const res = await request
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("returns 401 when email is unknown", async () => {
    mockFindOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

    const res = await request
      .post("/api/auth/login")
      .send({ email: "ghost@example.com", password: "any" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });
});
