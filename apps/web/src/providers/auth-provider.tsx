"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { authControllerLogin, authControllerRegister, authControllerLogout } from "@/api/generated/endpoints/auth/auth";
import { getToken, setToken, removeToken } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  handleOAuthCallback: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

async function fetchSession(): Promise<{ user: User } | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch("/api/auth/get-session", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setTokenState(stored);
      fetchSession()
        .then((session) => {
          if (session?.user) {
            setUser(session.user);
          } else {
            removeToken();
            setTokenState(null);
          }
        })
        .catch(() => {
          removeToken();
          setTokenState(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authControllerLogin({ email, password });
    setToken(res.data.token);
    setTokenState(res.data.token);
    setUser(res.data.user as unknown as User);
    router.push("/");
  }, [router]);

  const register = useCallback(
    async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      const res = await authControllerRegister(data);
      setToken(res.data.token);
      setTokenState(res.data.token);
      setUser(res.data.user as unknown as User);
      router.push("/");
    },
    [router]
  );

  const handleOAuthCallback = useCallback(async (oauthToken: string) => {
    setToken(oauthToken);
    setTokenState(oauthToken);
    try {
      const session = await fetchSession();
      if (session?.user) {
        setUser(session.user);
      }
    } catch {
      // Session fetch failed - user will still be redirected and can retry
    }
    router.push("/");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authControllerLogout();
    } catch {
      // ignore
    }
    removeToken();
    setTokenState(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, handleOAuthCallback }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
