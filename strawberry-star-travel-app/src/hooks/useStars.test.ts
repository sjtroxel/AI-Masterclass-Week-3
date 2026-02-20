import { renderHook, act } from "@testing-library/react";
import { useStars } from "./useStars";
import { vi, describe, it, expect } from "vitest";

describe("useStars", () => {
  it("starts in loading state", () => {
    const { result } = renderHook(() => useStars());

    expect(result.current.loading).toBe(true);
  });

  it("stops loading after timeout", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useStars());

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.loading).toBe(false);

    vi.useRealTimers();
  });

  it("filters stars by search query", () => {
    const { result } = renderHook(() => useStars());

    act(() => {
      result.current.setSearchQuery("Sirius");
    });

    expect(result.current.visibleStars.length).toBeGreaterThan(0);
    expect(result.current.totalStars).toBeLessThan(1000);
  });

  it("loads more stars when handleLoadMore is called", () => {
    const { result } = renderHook(() => useStars());

    const initialCount = result.current.visibleStars.length;

    act(() => {
      result.current.handleLoadMore();
    });

    expect(result.current.visibleStars.length).toBeGreaterThan(initialCount);
  });

  it("resets filters and pagination", () => {
    const { result } = renderHook(() => useStars());

    act(() => {
      result.current.setSearchQuery("Sirius");
      result.current.handleLoadMore();
    });

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.searchQuery).toBe("");
    expect(result.current.visibleStars.length).toBe(50);
  });
});
