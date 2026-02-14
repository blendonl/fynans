"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@fynans/shared";
import { apiClient } from "@/lib/api-client";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setTokenState(stored);
      apiClient
        .get("/api/auth/get-session")
        .then((data) => {
          const session = data as { user: User } | null;
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
    const res = (await apiClient.post("/auth/login", { email, password })) as {
      token: string;
      user: User;
    };
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    router.push("/");
  }, [router]);

  const register = useCallback(
    async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      const res = (await apiClient.post("/auth/register", data)) as {
        token: string;
        user: User;
      };
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      router.push("/");
    },
    [router]
  );

  const handleOAuthCallback = useCallback(async (oauthToken: string) => {
    setToken(oauthToken);
    setTokenState(oauthToken);
    try {
      const data = await apiClient.get("/api/auth/get-session");
      const session = data as { user: User } | null;
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
      await apiClient.post("/auth/logout", {});
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
