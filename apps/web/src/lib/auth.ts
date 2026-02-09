import Cookies from "js-cookie";

const TOKEN_KEY = "token";

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) ?? null;
}

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 30, sameSite: "lax" });
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}
