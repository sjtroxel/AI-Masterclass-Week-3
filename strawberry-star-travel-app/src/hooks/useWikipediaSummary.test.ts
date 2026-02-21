import { describe, it, expect, vi, type MockedFunction } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { Star } from "../features/stars/Star";
import { useWikipediaSummary } from "./useWikipediaSummary";
import { fetchStarWikipediaSummary } from "../features/stars/services/wikipedia";

// mock the service module
vi.mock("../features/stars/services/wikipedia", () => ({
  fetchStarWikipediaSummary: vi.fn(),
}));

// proper Vitest mock typing
const mockFetch =
  fetchStarWikipediaSummary as MockedFunction<
    typeof fetchStarWikipediaSummary
  >;

// star object (what the hook needs)
const mockStar: Star = {
  id: 32263,
  name: "Sirius",
  designation: "32349",
  distanceLy: 8.6,
  spectralType: "A1V",
};

describe("useWikipediaSummary", () => {
  it("does not fetch when enabled is false", () => {
    const { result } = renderHook(() => useWikipediaSummary(mockStar, false));

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it("loads wikipedia summary successfully when enabled", async () => {
    mockFetch.mockResolvedValue({
      title: "Sirius",
      pageid: 123,
      extract: "Sirius is a star...",
    });

    const { result } = renderHook(() => useWikipediaSummary(mockStar, true));

    // loading starts synchronously once the effect fires
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(false);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.title).toBe("Sirius");
    expect(result.current.error).toBe(false);
  });

  it("sets error when wikipedia fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("No article"));

    const { result } = renderHook(() => useWikipediaSummary(mockStar, true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(true);
    expect(result.current.data).toBe(null);
  });
});
