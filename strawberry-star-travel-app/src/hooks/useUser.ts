import { useContext } from "react";
import { AuthContext } from "../app/context/AuthContext";

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useUser must be used inside <AuthProvider>");
  }
  return { user: ctx.user, loading: ctx.loading, isDemoMode: ctx.isDemoMode };
}
