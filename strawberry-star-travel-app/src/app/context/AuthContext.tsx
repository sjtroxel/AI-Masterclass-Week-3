import { createContext, useState, useEffect, useContext, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

interface DemoSession {
  user: AuthUser;
  demoCreatedAt: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, username?: string) => Promise<void>;
  startDemo: () => void;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";
const DEMO_SESSION_KEY = "demoSession";
const DEMO_FAVORITES_KEY = "demoFavorites";
const DEMO_TTL_MS = 48 * 60 * 60 * 1000;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as AuthUser;
        setToken(storedToken);
        setUser(parsed);
      } catch {
        // Corrupted storage — clear it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } else {
      // No real auth — check for a demo session
      const storedDemo = localStorage.getItem(DEMO_SESSION_KEY);
      if (storedDemo) {
        try {
          const session = JSON.parse(storedDemo) as DemoSession;
          if (Date.now() - session.demoCreatedAt < DEMO_TTL_MS) {
            setUser(session.user);
            setIsDemoMode(true);
          } else {
            // Expired — clean up
            localStorage.removeItem(DEMO_SESSION_KEY);
            localStorage.removeItem(DEMO_FAVORITES_KEY);
          }
        } catch {
          localStorage.removeItem(DEMO_SESSION_KEY);
          localStorage.removeItem(DEMO_FAVORITES_KEY);
        }
      }
    }

    setLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      throw new Error(data.message ?? "Login failed");
    }

    const { token: newToken, user: newUser } = (await res.json()) as {
      token: string;
      user: AuthUser;
    };

    // Clear any active demo session
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(DEMO_FAVORITES_KEY);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsDemoMode(false);
  }

  function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(DEMO_FAVORITES_KEY);
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
  }

  async function register(email: string, password: string, username?: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      throw new Error(data.message ?? "Registration failed");
    }

    const { token: newToken, user: newUser } = (await res.json()) as {
      token: string;
      user: AuthUser;
    };

    // Clear any active demo session
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(DEMO_FAVORITES_KEY);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsDemoMode(false);
  }

  function startDemo(): void {
    const timestamp = Date.now();
    const demoUser: AuthUser = {
      id: `demo_${timestamp}`,
      email: `guest_${timestamp}@demo.com`,
      username: "Demo Explorer",
    };
    const session: DemoSession = { user: demoUser, demoCreatedAt: timestamp };
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    setUser(demoUser);
    setToken(null);
    setIsDemoMode(true);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isDemoMode, login, logout, register, startDemo }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
