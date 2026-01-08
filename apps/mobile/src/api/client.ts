import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.17:3000";

export const apiClient = {
  async get(endpoint: string, params?: Record<string, any>) {
    const token = await AsyncStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Build query string from params
    let url = `${BASE_URL}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join("&");
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    console.log(`GET ${url}`);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  async post(endpoint: string, body: any, options?: { headers?: HeadersInit }) {
    const token = await AsyncStorage.getItem("token");
    const headers: HeadersInit = {
      ...(options?.headers || {}),
    };

    const isFormData = body instanceof FormData;

    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`POST ${BASE_URL}${endpoint}`, isFormData ? "FormData" : body);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: isFormData ? body : JSON.stringify(body),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`POST ${BASE_URL}${endpoint} failed:`, error);
      throw error;
    }
  },

  async put(endpoint: string, body: any, options?: { headers?: HeadersInit }) {
    const token = await AsyncStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`PUT ${BASE_URL}${endpoint}`, body);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`PUT ${BASE_URL}${endpoint} failed:`, error);
      throw error;
    }
  },

  async patch(
    endpoint: string,
    body: any,
    options?: { headers?: HeadersInit },
  ) {
    const token = await AsyncStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`PATCH ${BASE_URL}${endpoint}`, body);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`PATCH ${BASE_URL}${endpoint} failed:`, error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    const token = await AsyncStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`DELETE ${BASE_URL}${endpoint}`);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${BASE_URL}${endpoint} failed:`, error);
      throw error;
    }
  },
};

async function handleResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  return data;
}
