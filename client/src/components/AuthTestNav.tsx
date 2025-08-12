import { useState } from 'react';
import { useAuth } from '@/hooks/useAuthNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, LogIn, UserPlus, Shield, User, Globe, CheckCircle, AlertCircle } from 'lucide-react';

export function AuthTestNav() {
  const { user, isAuthenticated, isLoading, login, register, logout, error, clearError } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [testResults, setTestResults] = useState<Array<{type: 'success' | 'error', message: string}>>([]);

  const addTestResult = (type: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { type, message }]);
  };

  const clearTests = () => {
    setTestResults([]);
    clearError();
  };

  const testAdminLogin = async () => {
    try {
      clearError();
      const result = await login({
        email: 'olovka0987@gmail.com',
        password: 'Admin123!'
      });
      
      if (result.success) {
        addTestResult('success', 'Admin login successful');
      } else {
        addTestResult('error', `Admin login failed: ${result.message}`);
      }
    } catch (err) {
      addTestResult('error', `Admin login error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testStudentLogin = async () => {
    try {
      clearError();
      const result = await login({
        email: 'student@test.com',
        password: 'Student123!'
      });
      
      if (result.success) {
        addTestResult('success', 'Student login successful');
      } else {
        addTestResult('error', `Student login failed: ${result.message}`);
      }
    } catch (err) {
      addTestResult('error', `Student login error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testNewRegistration = async () => {
    try {
      clearError();
      const timestamp = Date.now();
      const result = await register({
        email: `test${timestamp}@example.com`,
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        language: 'en'
      });
      
      if (result.success) {
        addTestResult('success', 'New user registration successful');
      } else {
        addTestResult('error', `Registration failed: ${result.message}`);
      }
    } catch (err) {
      addTestResult('error', `Registration error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addTestResult('success', 'Logout successful');
    } catch (err) {
      addTestResult('error', `Logout error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hr' : 'en';
    setLanguage(newLang);
    addTestResult('success', `Language switched to ${newLang === 'en' ? 'English' : 'Croatian'}`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Authentication Testing Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isAuthenticated ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            <div>
              <div className="font-medium">
                {isLoading ? 'Loading...' : 
                 isAuthenticated ? `Authenticated as: ${user?.firstName} ${user?.lastName}` : 
                 'Not authenticated'}
              </div>
              {isAuthenticated && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.email}
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role}
                  </Badge>
                  <Globe className="w-4 h-4" />
                  {user?.language?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleLanguage}>
              <Globe className="w-4 h-4 mr-1" />
              {language === 'en' ? 'Switch to HR' : 'Switch to EN'}
            </Button>
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={testAdminLogin} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Test Admin Login
          </Button>
          
          <Button 
            onClick={testStudentLogin} 
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Test Student Login
          </Button>
          
          <Button 
            onClick={testNewRegistration} 
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Test Registration
          </Button>
        </div>

        {/* Manual Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/login'}>
            Login Page
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/register-new'}>
            Register Page
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin'}>
            Admin Dashboard
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/app'}>
            Student App
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Test Results:</h4>
              <Button variant="ghost" size="sm" onClick={clearTests}>
                Clear
              </Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded text-sm ${
                    result.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.type === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {result.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <h4 className="font-medium">Testing Instructions:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use "Test Admin Login" to authenticate as admin (olovka0987@gmail.com)</li>
            <li>Use "Test Student Login" to authenticate as test student</li>
            <li>Use "Test Registration" to create a new user account</li>
            <li>After admin login, navigate to Admin Dashboard to test admin features</li>
            <li>Switch languages to test multi-language support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
