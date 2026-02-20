import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUser } from "./useUser";
import { UserContext } from "../app/context/UserContext";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js"

describe("useUser", () => {
  it("returns user context when used inside UserProvider", () => {
    const mockContextValue = {
      user: { id: "user-123" } as User,
      loading: false,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <UserContext.Provider value={mockContextValue}>
        {children}
      </UserContext.Provider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current).toBe(mockContextValue);
  });

  it("throws an error when used outside UserProvider", () => {
    expect(() => {
      renderHook(() => useUser());
    }).toThrow("useUser must be used inside <UserProvider>");
  });
});