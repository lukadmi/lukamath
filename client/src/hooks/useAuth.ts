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

  return response.json();
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
