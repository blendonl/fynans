"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { authControllerLogin, authControllerRegister, authControllerLogout, authControllerMe } from "@/api/generated/endpoints/auth/auth";
import { fetchSessionToken } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  completeOAuthSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const sessionToken = await fetchSessionToken();

      if (!active) return;

      if (!sessionToken) {
        setIsLoading(false);
        return;
      }

      setTokenState(sessionToken);

      try {
        const res = await authControllerMe();
        if (active) setUser(res.data);
      } catch {
        if (active) setTokenState(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authControllerLogin({ email, password });
    setTokenState(res.data.token);
    setUser(res.data.user as unknown as User);
    router.push("/");
  }, [router]);

  const register = useCallback(
    async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      const res = await authControllerRegister(data);
      setTokenState(res.data.token);
      setUser(res.data.user as unknown as User);
      router.push("/");
    },
    [router]
  );

  const completeOAuthSignIn = useCallback(async () => {
    const sessionToken = await fetchSessionToken();

    if (!sessionToken) {
      throw new Error("Sign-in did not establish a session");
    }

    const res = await authControllerMe();
    setTokenState(sessionToken);
    setUser(res.data);
    router.push("/");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authControllerLogout();
    } catch { /* non-critical */ }
    setTokenState(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout, completeOAuthSignIn }),
    [user, token, isLoading, login, register, logout, completeOAuthSignIn],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
