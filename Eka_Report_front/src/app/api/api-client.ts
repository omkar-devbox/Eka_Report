/// <reference types="vite/client" />

const BASE_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "http://localhost:8000") : "";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export const apiClient = async <T>(
  endpoint: string,
  { body, ...customConfig }: RequestOptions = {},
): Promise<T> => {
  const headers: HeadersInit = {};

  // Only set Content-Type if body is present and not FormData
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    (headers as any)["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Try to parse as JSON or Blob depending on Content-Type
  let data;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (e) {
      data = { message: "Unexpected response format" };
    }
  } else {
    try {
      data = await response.blob();
    } catch (e) {
      data = response;
    }
  }

  if (response.ok) {
    return data as T;
  } else {
    const errorMessage =
      data && typeof data === "object" && "message" in data
        ? (data as any).message
        : "Something went wrong";
    throw new Error(errorMessage);
  }
};
