import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuthNew';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthTestNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 bg-white/95 backdrop-blur-sm border shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          🔐 Auth Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hr' : 'en')}
          >
            {language === 'en' ? '🇭🇷 HR' : '🇺🇸 EN'}
          </Button>
        </div>
        
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <div className="text-xs bg-green-50 p-2 rounded">
              <div className="font-semibold text-green-800">✅ Logged In</div>
              <div className="text-green-700">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-green-600 text-xs">{user.email}</div>
            </div>
            <Button size="sm" onClick={logout} variant="outline">
              {t('auth.logout')}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs bg-gray-50 p-2 rounded">
              <div className="font-semibold text-gray-800">❌ Not Logged In</div>
            </div>
            <div className="flex gap-1">
              <Link href="/login">
                <Button size="sm" variant="outline">
                  {t('auth.login')}
                </Button>
              </Link>
              <Link href="/register-new">
                <Button size="sm" variant="outline">
                  {t('auth.register')}
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        <div className="border-t pt-2 text-xs space-y-1">
          <div>Test Links:</div>
          <div className="flex flex-wrap gap-1">
            <Link href="/register-new">
              <Button size="sm" variant="ghost" className="h-6 text-xs">
                📝 Register
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" variant="ghost" className="h-6 text-xs">
                🔐 Login
              </Button>
            </Link>
            <Link href="/app">
              <Button size="sm" variant="ghost" className="h-6 text-xs">
                📱 App
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
