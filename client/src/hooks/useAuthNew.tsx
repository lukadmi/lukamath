import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RegisterUser, LoginUser, User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginUser) => Promise<AuthResult>;
  register: (userData: RegisterUser) => Promise<AuthResult>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
  messageKey?: string;
  errors?: Array<{ field: string; message: string; code: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token management
const TOKEN_KEY = 'lukamath_auth_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// API functions
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api/auth${endpoint}`, {
    ...options,
    headers,
  });

  // Store response status before consuming body
  const status = response.status;
  const ok = response.ok;
  const contentType = response.headers.get('content-type');
  const hasJsonContent = contentType && contentType.includes('application/json');

  let data;

  // Only attempt to parse JSON if we have JSON content
  if (hasJsonContent) {
    try {
      data = await response.json();
    } catch (err) {
      console.error('Failed to parse response as JSON:', err);
      throw new Error(`Request failed with status ${status} - Invalid JSON response`);
    }
  } else {
    // For non-JSON responses, we don't need to read the body
    data = null;
  }

  if (!ok) {
    throw new Error(data?.message || `Request failed with status ${status}`);
  }

  return data;
}

async function loginUser(credentials: LoginUser): Promise<AuthResult> {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

async function registerUser(userData: RegisterUser): Promise<AuthResult> {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

async function getCurrentUser(): Promise<{ user: User }> {
  return apiRequest('/me');
}

async function logoutUser(): Promise<void> {
  // Don't use apiRequest for logout as it sends auth headers
  // Logout should work even with expired/invalid tokens
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Check if response has JSON content before trying to parse
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');

      if (hasJsonContent && response.body) {
        try {
          const data = await response.json();
          throw new Error(data.message || 'Logout failed');
        } catch (parseError) {
          // If JSON parsing fails, just use the status
          throw new Error(`Logout failed with status ${response.status}`);
        }
      } else {
        throw new Error(`Logout failed with status ${response.status}`);
      }
    }

    // Success - no need to read response body for logout
  } catch (error) {
    // Log the error but don't prevent logout from completing
    console.warn('Logout API call failed:', error);
    throw error;
  }
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query to get current user
  const { data: userData, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
    enabled: !!getStoredToken(),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      if (result.success && result.token) {
        setStoredToken(result.token);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        setError(null);
      } else {
        setError(result.message);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (result) => {
      if (result.success && result.token) {
        setStoredToken(result.token);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        setError(null);
      } else {
        setError(result.message);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear all authentication state
      removeStoredToken();

      // Clear all React Query cache
      queryClient.clear();

      // Clear any session storage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        // Clear any other potential auth-related localStorage items
        const keysToRemove = Object.keys(localStorage).filter(key =>
          key.includes('auth') || key.includes('token') || key.includes('user')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Reset error state
      setError(null);

      // Force a hard redirect to ensure complete state reset
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user: userData?.user || null,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!userData?.user,
    login: async (credentials) => {
      const result = await loginMutation.mutateAsync(credentials);
      return result;
    },
    register: async (userData) => {
      const result = await registerMutation.mutateAsync(userData);
      return result;
    },
    logout,
    error: error || loginMutation.error?.message || registerMutation.error?.message || null,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth(redirectTo: string = '/') {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);
  
  return { isAuthenticated, isLoading };
}
