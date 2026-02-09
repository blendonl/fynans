import { getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type HeadersInit = Record<string, string>;

async function handleResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();

  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    throw new Error(`Invalid JSON response: ${text}`);
  }

  if (!response.ok) {
    const msg =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null;
    throw new Error(msg || response.statusText || `Request failed with status ${response.status}`);
  }

  return data;
}

export const apiClient = {
  async get(endpoint: string, params?: Record<string, string | undefined | null>) {
    const token = getToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let url = `${BASE_URL}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
        .join("&");
      if (queryString) url += `?${queryString}`;
    }

    const response = await fetch(url, { method: "GET", headers });
    return handleResponse(response);
  },

  async post(endpoint: string, body: unknown, options?: { headers?: HeadersInit }) {
    const token = getToken();
    const headers: HeadersInit = { ...(options?.headers || {}) };

    const isFormData = body instanceof FormData;
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async put(endpoint: string, body: unknown, options?: { headers?: HeadersInit }) {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async patch(endpoint: string, body: unknown, options?: { headers?: HeadersInit }) {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async delete(endpoint: string) {
    const token = getToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(response);
  },
};
