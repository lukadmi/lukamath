import { useQuery } from "@tanstack/react-query";

// Get stored JWT token
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lukamath_auth_token');
}

// API request with JWT token
async function apiRequestWithAuth(url: string): Promise<any> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { headers, credentials: "include" });
  } catch (fetchError: any) {
    // Handle network errors and FullStory interference
    console.error('Fetch error in apiRequestWithAuth:', fetchError);
    if (fetchError.message === 'Failed to fetch' || fetchError.name === 'TypeError') {
      throw new Error('Network error: Unable to connect to server');
    }
    throw fetchError;
  }

  // Check content type before any body consumption
  const contentType = response.headers.get('content-type');
  const hasJsonContent = contentType && contentType.includes('application/json');

  // Always handle the response body only once
  if (!response.ok) {
    // For error responses, read the body to get error details
    let errorMessage;
    try {
      if (hasJsonContent) {
        const errorData = await response.json(); // Read from original response
        errorMessage = errorData?.message || response.statusText;
      } else {
        const errorText = await response.text(); // Read from original response
        errorMessage = errorText || response.statusText;
      }
    } catch (parseError) {
      errorMessage = response.statusText;
    }
    throw new Error(`${response.status}: ${errorMessage}`);
  }

  // For successful responses, read the body
  if (hasJsonContent) {
    try {
      return await response.json();
    } catch (err) {
      console.error('Failed to parse response as JSON (useAuth):', err);
      throw new Error(`Request failed - invalid JSON response`);
    }
  }

  return null;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequestWithAuth("/api/auth/user"),
    retry: false,
    enabled: !!getStoredToken(),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
