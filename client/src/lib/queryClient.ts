import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get stored JWT token
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lukamath_auth_token');
}

// Store reference to native fetch in case FullStory or other scripts override it
const nativeFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : fetch;

// Helper function to make fetch requests with fallback
async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    // Try the current fetch first (might be wrapped by FullStory)
    return await fetch(input, init);
  } catch (error: any) {
    if (error.message === 'Failed to fetch' && nativeFetch !== fetch) {
      console.warn('Fetch failed, trying with native fetch as fallback');
      // Fallback to native fetch if available
      return await nativeFetch(input, init);
    }
    throw error;
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

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  } catch (fetchError: any) {
    // Handle network errors and FullStory interference
    console.error('Fetch error in apiRequest:', fetchError);
    if (fetchError.message === 'Failed to fetch' || fetchError.name === 'TypeError') {
      throw new Error('Network error: Unable to connect to server');
    }
    throw fetchError;
  }

  // Check content type before any body consumption
  const contentType = res.headers.get('content-type');
  const hasJsonContent = contentType && contentType.includes('application/json');

  // Always handle the response body only once
  if (!res.ok) {
    // For error responses, read the body to get error details
    let errorMessage;
    try {
      if (hasJsonContent) {
        const errorData = await res.json(); // Read from original response
        errorMessage = errorData?.message || res.statusText;
      } else {
        const errorText = await res.text(); // Read from original response
        errorMessage = errorText || res.statusText;
      }
    } catch (parseError) {
      errorMessage = res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }

  // For successful responses, read the body
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

    let res: Response;
    try {
      res = await fetch(queryKey.join("/") as string, {
        headers,
        credentials: "include",
      });
    } catch (fetchError: any) {
      // Handle network errors and FullStory interference
      console.error('Fetch error in getQueryFn:', fetchError);
      if (fetchError.message === 'Failed to fetch' || fetchError.name === 'TypeError') {
        throw new Error('Network error: Unable to connect to server');
      }
      throw fetchError;
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Check content type before any body consumption
    const contentType = res.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');

    // Always handle the response body only once
    if (!res.ok) {
      // For error responses, read the body to get error details
      let errorMessage;
      try {
        if (hasJsonContent) {
          const errorData = await res.json(); // Read from original response
          errorMessage = errorData?.message || res.statusText;
        } else {
          const errorText = await res.text(); // Read from original response
          errorMessage = errorText || res.statusText;
        }
      } catch (parseError) {
        errorMessage = res.statusText;
      }
      throw new Error(`${res.status}: ${errorMessage}`);
    }

    // For successful responses, read the body
    if (hasJsonContent) {
      return await res.json();
    }

    return null;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error: any) => {
        // Retry up to 2 times for network errors
        if (error?.message?.includes('Network error') && failureCount < 2) {
          return true;
        }
        // Don't retry for other errors (like 401, 404, etc.)
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Only retry network errors for mutations, not auth or validation errors
        if (error?.message?.includes('Network error') && failureCount < 1) {
          return true;
        }
        return false;
      },
    },
  },
});
