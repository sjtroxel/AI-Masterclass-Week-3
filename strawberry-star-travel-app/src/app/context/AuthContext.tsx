import { createContext, useState, useEffect, useContext, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, username?: string) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
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

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
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
