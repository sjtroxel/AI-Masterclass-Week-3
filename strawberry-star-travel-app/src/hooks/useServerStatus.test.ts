import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useServerStatus } from "./useServerStatus";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

describe("useServerStatus", () => {
  it("returns data on successful fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: "Hello from Strawberry Server",
        version: "1.0.0",
      }),
    });

    const { result } = renderHook(() => useServerStatus());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.message).toBe("Hello from Strawberry Server");
    expect(result.current.data?.version).toBe("1.0.0");
    expect(result.current.error).toBe(false);
  });

  it("sets error when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useServerStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("sets error when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const { result } = renderHook(() => useServerStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
  });
});
