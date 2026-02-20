import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchStarWikipediaSummary } from "./wikipedia";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

describe("fetchStarWikipediaSummary", () => {
  it("returns the first astronomy-related summary", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        extract: "Sirius is the brightest star in the night sky.",
        title: "Sirius",
        pageid: 123,
      }),
    });

    const result = await fetchStarWikipediaSummary(["Sirius"]);

    expect(result.title).toBe("Sirius");
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("skips non-astronomy articles", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          extract: "Sirius is a record label.",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          extract: "Sirius is a star system.",
          title: "Sirius",
        }),
      });

    const result = await fetchStarWikipediaSummary([
      "Sirius (record label)",
      "Sirius star",
    ]);

    expect(result.title).toBe("Sirius");
  });

  it("throws when no suitable article is found", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        extract: "Totally unrelated topic.",
      }),
    });

    await expect(
      fetchStarWikipediaSummary(["Nonsense"])
    ).rejects.toThrow("No suitable astronomy article found");
  });

  it("throws when fetch fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });

    await expect(
      fetchStarWikipediaSummary(["Sirius"])
    ).rejects.toThrow("No suitable astronomy article found");
  });
});
