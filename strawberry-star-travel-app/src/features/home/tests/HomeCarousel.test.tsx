import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeCarousel from "../components/HomeCarousel";
import { homeFeatures } from "../data/homeFeatures";

/**
 * Mock matchMedia so the component thinks it's on desktop
 */
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false, // 👈 desktop
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("HomeCarousel (desktop)", () => {
  it("renders feature cards", () => {
    render(<HomeCarousel onFeatureClick={() => {}} />);

    // At least the first feature title should appear
    expect(
      screen.getByText(homeFeatures[0].title)
    ).toBeInTheDocument();
  });

  it("rotates right when clicking the R button", async () => {
    const user = userEvent.setup();

    render(<HomeCarousel onFeatureClick={() => {}} />);

    // Initial feature
    expect(
      screen.getByText(homeFeatures[0].title)
    ).toBeInTheDocument();

    // Rotate right
    await user.click(screen.getByText("R"));

    // Next feature should now be visible
    expect(
      screen.getByText(homeFeatures[1].title)
    ).toBeInTheDocument();
  });

  it("calls onFeatureClick when a card is clicked", async () => {
    const user = userEvent.setup();
    const onFeatureClick = vi.fn();

    render(<HomeCarousel onFeatureClick={onFeatureClick} />);

    await user.click(
      screen.getByText(homeFeatures[0].title)
    );

    expect(onFeatureClick).toHaveBeenCalledTimes(1);
    expect(onFeatureClick).toHaveBeenCalledWith(
      homeFeatures[0].title
    );
  });
});
