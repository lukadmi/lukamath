import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { registerSchema, type RegisterUser } from '@shared/schema';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuthNew';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterNew() {
  const { t, language, setLanguage } = useLanguage();
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      language: language,
    },
  });

  const onSubmit = async (data: RegisterUser) => {
    try {
      clearError();
      const result = await registerUser(data);
      
      if (result.success) {
        setRegistrationSuccess(true);
        // Redirect to dashboard or home after successful registration
        setTimeout(() => {
          window.location.href = '/app';
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('auth.registration_success')}
              </h2>
              <p className="text-gray-600 mb-4">
                {t('auth.redirecting')} Redirecting to your dashboard...
              </p>
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t('auth.register')} - LukaMath
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Create your account to start learning
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  className={form.formState.errors.firstName ? 'border-red-500' : ''}
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  className={form.formState.errors.lastName ? 'border-red-500' : ''}
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                className={form.formState.errors.email ? 'border-red-500' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                  className={form.formState.errors.password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {t('auth.password_requirements')}
              </p>
            </div>

            <div>
              <Label htmlFor="language">Language / Jezik</Label>
              <Select
                value={form.watch('language')}
                onValueChange={(value) => {
                  form.setValue('language', value as 'en' | 'hr');
                  setLanguage(value as 'en' | 'hr');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hr">Hrvatski</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.register_button')}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">{t('auth.have_account')} </span>
              <Link href="/login" className="text-blue-600 hover:underline">
                {t('auth.sign_in_here')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
