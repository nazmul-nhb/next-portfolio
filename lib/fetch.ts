import type { ApiResponse } from "./types"

interface FetchOptions<T> extends RequestInit {
  body?: T
}

export async function apiCall<TReq, TRes>(
  endpoint: string,
  options: FetchOptions<TReq> = {},
): Promise<ApiResponse<TRes>> {
  const { body, ...fetchOptions } = options

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "An error occurred",
      }
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
