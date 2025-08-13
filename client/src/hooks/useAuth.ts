import { useQuery } from "@tanstack/react-query";

// Get stored JWT token
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lukamath_auth_token');
}

// API request with JWT token
async function apiRequestWithAuth(url: string): Promise<any> {
  const token = getStoredToken();
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  // Check if response has JSON content before parsing
  const contentType = response.headers.get('content-type');
  const hasJsonContent = contentType && contentType.includes('application/json');

  if (hasJsonContent && response.body) {
    try {
      return await response.json();
    } catch (err) {
      console.error('Failed to parse response as JSON:', err);
      throw new Error(`Request failed - invalid JSON response`);
    }
  } else {
    throw new Error('Response does not contain JSON data');
  }
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
