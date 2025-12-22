import AsyncStorage from "@react-native-async-storage/async-storage";

// Android emulator localhost
const BASE_URL = "http://192.168.0.24:3000";

export const apiClient = {
  async get(endpoint: string) {
    const token = await AsyncStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`GET ${BASE_URL}${endpoint}`);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`GET ${BASE_URL}${endpoint} failed:`, error);
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
