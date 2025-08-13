import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get stored JWT token
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lukamath_auth_token');
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Clone the response before reading to avoid "body stream already read" error
    const clonedRes = res.clone();
    try {
      const text = (await clonedRes.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    } catch (parseError) {
      // If we can't parse the response, just use status text
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const token = getStoredToken();
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Check content type before any body consumption
  const contentType = res.headers.get('content-type');
  const hasJsonContent = contentType && contentType.includes('application/json');

  // If there's an error, handle it with proper cloning
  if (!res.ok) {
    let errorMessage;
    try {
      if (hasJsonContent) {
        const errorData = await res.clone().json();
        errorMessage = errorData?.message || res.statusText;
      } else {
        const errorText = await res.clone().text();
        errorMessage = errorText || res.statusText;
      }
    } catch (parseError) {
      errorMessage = res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }

  // Parse successful JSON response
  if (hasJsonContent) {
    return await res.json();
  }

  // For non-JSON responses, return null
  return null;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getStoredToken();
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
