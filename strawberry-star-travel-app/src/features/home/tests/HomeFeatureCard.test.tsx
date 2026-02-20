import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeFeatureCard from "../components/HomeFeatureCard";

const mockFeature = {
  id: "test",
  title: "Test Feature",
  description: "Test description",
  icon: "🚀",
};

describe("HomeFeatureCard", () => {
  it("renders feature content", () => {
    render(
      <HomeFeatureCard feature={mockFeature} onClick={() => {}} />
    );

    expect(screen.getByText("Test Feature")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("🚀")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <HomeFeatureCard feature={mockFeature} onClick={onClick} />
    );

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
