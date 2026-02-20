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
