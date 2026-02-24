import { getToken } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const customInstance = async <T>(
  url: string,
  init: RequestInit,
): Promise<T> => {
  const token = getToken();
  const requestHeaders: Record<string, string> = {};

  if (init.headers) {
    const h = init.headers;
    if (h instanceof Headers) {
      h.forEach((value, key) => { requestHeaders[key] = value; });
    } else if (Array.isArray(h)) {
      h.forEach(([key, value]) => { requestHeaders[key] = value; });
    } else {
      Object.assign(requestHeaders, h);
    }
  }

  const isFormData = init.body instanceof FormData;
  if (isFormData) {
    delete requestHeaders['Content-Type'];
  }
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = `${BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...init,
    headers: requestHeaders,
  });

  if (response.status === 204) {
    return { data: undefined, status: 204, headers: response.headers } as T;
  }

  const text = await response.text();
  let parsed: unknown = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    throw new Error(`Invalid JSON response: ${text}`);
  }

  if (!response.ok) {
    const msg =
      parsed && typeof parsed === 'object' && 'message' in parsed
        ? String((parsed as { message: unknown }).message)
        : null;
    throw new Error(
      msg || response.statusText || `Request failed with status ${response.status}`
    );
  }

  return { data: parsed, status: response.status, headers: response.headers } as T;
};
