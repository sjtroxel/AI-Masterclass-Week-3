import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFavorites } from "./useFavorites";
import type { Star } from "../features/stars/Star";

// --- Hoisted mocks ---
const { mockUseAuth, mockFetch } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockFetch: vi.fn(),
}));

// --- Mock useAuth ---
vi.mock("../app/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// --- Tests ---
describe("useFavorites", () => {
  it("returns empty favorites when user is not logged in", async () => {
    mockUseAuth.mockReturnValue({ user: null, token: null, loading: false });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favorites).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("loads favorites from GET /api/favorites on mount", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "a@b.com" },
      token: "fake-token",
      loading: false,
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ starIds: [42, 7] }),
    });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favorites).toEqual([42, 7]);
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/favorites"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer fake-token" }) }),
    );
  });

  it("adds a favorite via POST /api/favorites/toggle", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "a@b.com" },
      token: "fake-token",
      loading: false,
    });

    // First call: initial GET load → empty favorites
    // Second call: POST toggle → favorited: true
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ starIds: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ favorited: true, starId: 99 }) });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const mockStar: Star = { id: 99 } as Star;

    await act(async () => {
      await result.current.addFavorite(mockStar);
    });

    expect(result.current.favorites).toContain(99);
  });

  it("removes a favorite via POST /api/favorites/toggle", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "a@b.com" },
      token: "fake-token",
      loading: false,
    });

    // First call: initial GET load → [99]
    // Second call: POST toggle → favorited: false
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ starIds: [99] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ favorited: false, starId: 99 }) });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favorites).toEqual([99]);
    });

    await act(async () => {
      await result.current.removeFavorite(99);
    });

    expect(result.current.favorites).toEqual([]);
  });

  it("correctly reports whether a star is a favorite", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "a@b.com" },
      token: "fake-token",
      loading: false,
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ starIds: [42] }),
    });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorite(42)).toBe(true);
    expect(result.current.isFavorite(7)).toBe(false);
  });
});
