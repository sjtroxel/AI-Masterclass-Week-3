import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";

const request = supertest(app);

describe("GET /api/status", () => {
  it("returns 200 with message and version", async () => {
    const response = await request.get("/api/status");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Hello from Strawberry Server");
    expect(response.body.version).toBe("1.0.0");
  });

  it("returns JSON content-type", async () => {
    const response = await request.get("/api/status");

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("includes CORS header for the allowed origin", async () => {
    const response = await request
      .get("/api/status")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });
});
