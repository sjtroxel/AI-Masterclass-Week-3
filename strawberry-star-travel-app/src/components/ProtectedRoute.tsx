import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  // Still loading user data — show nothing or a spinner
  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // Not logged in → redirect to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User is logged in — allow access
  return children;
}
