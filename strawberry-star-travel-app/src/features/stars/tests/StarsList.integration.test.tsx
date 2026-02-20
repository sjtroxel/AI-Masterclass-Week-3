import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import StarsList from "../StarsList";
import { AuthProvider } from "../../../app/context/AuthContext";

describe("StarsList integration", () => {
  it("renders the stars list and search input", async () => {
    render(
      <AuthProvider>
        <StarsList />
      </AuthProvider>
    );

    // Search input should exist
    const searchInput = screen.getByPlaceholderText("Search stars...");
    expect(searchInput).toBeInTheDocument();

    // After loading finishes, at least one star should appear
    const starCountText = await screen.findByText(/stars found/i);
    expect(starCountText).toBeInTheDocument();
  });

  it("filters stars when typing in search input", async () => {
    render(
      <AuthProvider>
        <StarsList />
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search stars...");

    // Type a known star name
    await userEvent.type(searchInput, "Sirius");

    // Sirius should appear
    expect(await screen.findByText(/Sirius/i)).toBeInTheDocument();
  });
});
