import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../src/app.js";

// Integration test: exercises the full middleware stack (cors, json, routing, error handling)
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
