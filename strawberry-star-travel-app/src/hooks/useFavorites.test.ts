import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFavorites } from "./useFavorites";
import type { Star } from "../features/stars/Star";

// --- Hoisted mocks ---
const { mockUseUser, mockFrom } = vi.hoisted(() => ({
    mockUseUser: vi.fn(),
    mockFrom: vi.fn(),
}))

// --- Mock useUser ---
vi.mock("./useUser", () => ({
  useUser: () => mockUseUser(),
}));

// --- Mock Supabase ---
vi.mock("../supabaseClient", () => ({
  supabase: {
    from: mockFrom,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---
describe("useFavorites", () => {

  it("returns empty favorites when user is not logged in", async () => {
    mockUseUser.mockReturnValue({ user: null });

    mockFrom.mockReturnValue({
      select: () => ({
        eq: async () => ({ data: [], error: null }),
      }),
    });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favorites).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  it("loads favorites when user is logged in", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    mockFrom.mockReturnValue({
      select: () => ({
        eq: async () => ({
          data: [{ star_id: "42" }, { star_id: "7" }],
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favorites).toEqual([42, 7]);
      expect(result.current.loading).toBe(false);
    });
  });

  it("adds a favorite", async () => {
    mockUseUser.mockReturnValue({
        user: { id: "user-123" },
    });

    mockFrom.mockReturnValue({
        select: () => ({
        eq: async () => ({ data: [], error: null }),
        }),
        insert: async () => ({ error: null }),
    });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
 
    const mockStar: Star = { id: 99 } as Star;

    await act(async () => {
        await result.current.addFavorite(mockStar);
    });

    expect(result.current.favorites).toContain(99);
    });

  it("removes a favorite", async () => {
    mockUseUser.mockReturnValue({
    user: { id: "user-123" },
    });

    mockFrom.mockReturnValue({
        select: () => ({
        eq: async () => ({
            data: [{ star_id: "99" }],
            error: null,
        }),
        }),
        delete: () => ({
        eq: () => ({
            eq: async () => ({ error: null }),
        }),
        }),
    });

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
    mockUseUser.mockReturnValue({
        user: { id: "user-123" },
    });

    mockFrom.mockReturnValue({
        select: () => ({
        eq: async () => ({
            data: [{ star_id: "42" }],
            error: null,
        }),
        }),
    });

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorite(42)).toBe(true);
    expect(result.current.isFavorite(7)).toBe(false);
    });
});