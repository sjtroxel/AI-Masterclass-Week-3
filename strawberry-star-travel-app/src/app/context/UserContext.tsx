// src/context/UserContext.tsx
import { createContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../../supabaseClient";

// Use Supabase's built-in type for the user instead of "any"
import type { User } from "@supabase/supabase-js";

interface UserContextType {
  user: User | null;
  loading: boolean;
}

// Create the context with proper typing (no "any")
const UserContext = createContext<UserContextType | null>(null);

// This is a component, so Fast Refresh is happy
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session user on first load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}


export { UserContext, UserProvider }