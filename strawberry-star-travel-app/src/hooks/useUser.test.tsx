import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUser } from "./useUser";
import { AuthContext } from "../app/context/AuthContext";
import type { ReactNode } from "react";
import type { AuthUser } from "../app/context/AuthContext";

describe("useUser", () => {
  it("returns user and loading when used inside AuthProvider", () => {
    const mockUser: AuthUser = { id: "user-123", email: "test@example.com" };
    const mockContextValue = {
      user: mockUser,
      token: "fake-token",
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toBe(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it("throws an error when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useUser());
    }).toThrow("useUser must be used inside <AuthProvider>");
  });
});
