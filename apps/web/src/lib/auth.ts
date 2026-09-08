import { API_BASE_URL } from "@/lib/env";

interface SessionResponse {
  session?: { token?: string | null } | null;
}

export async function fetchSessionToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as SessionResponse | null;
    return body?.session?.token ?? null;
  } catch {
    return null;
  }
}
