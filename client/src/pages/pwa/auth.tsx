import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Calculator, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';

type Language = 'en' | 'hr';

const translations = {
  en: {
    signIn: "Sign In",
    register: "Create Account",
    email: "Email Address",
    password: "Password", 
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    phone: "Phone Number",
    mathLevel: "Math Level",
    middleSchool: "Middle School (Grades 6-8)",
    highSchool: "High School (Grades 9-12)", 
    university: "University Level",
    satAct: "SAT/ACT Prep",
    signInButton: "Sign In",
    registerButton: "Create Account",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signUp: "Sign Up",
    backToLanguage: "Back to Language Selection",
    loading: "Loading...",
    errors: {
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email",
      passwordRequired: "Password is required", 
      passwordMin: "Password must be at least 8 characters",
      passwordMatch: "Passwords must match",
      nameRequired: "Full name is required",
      mathLevelRequired: "Please select your math level"
    },
    success: {
      accountCreated: "Account created successfully!",
      signedIn: "Signed in successfully!"
    }
  },
  hr: {
    signIn: "Prijavite se",
    register: "Stvorite račun", 
    email: "Email adresa",
    password: "Lozinka",
    confirmPassword: "Potvrdite lozinku",
    fullName: "Puno ime",
    phone: "Broj telefona",
    mathLevel: "Razina matematike",
    middleSchool: "Osnovna škola (5.-8. razred)",
    highSchool: "Srednja škola (1.-4. razred)",
    university: "Sveučilišna razina", 
    satAct: "Priprema za državnu maturu",
    signInButton: "Prijavite se",
    registerButton: "Stvorite račun",
    forgotPassword: "Zaboravili ste lozinku?",
    noAccount: "Nemate račun?",
    haveAccount: "Već imate račun?",
    signUp: "Registrirajte se", 
    backToLanguage: "Povratak na odabir jezika",
    loading: "Učitavanje...",
    errors: {
      emailRequired: "Email je obavezan",
      emailInvalid: "Molimo unesite valjani email",
      passwordRequired: "Lozinka je obavezna",
      passwordMin: "Lozinka mora imati najmanje 8 znakova", 
      passwordMatch: "Lozinke se moraju poklapati",
      nameRequired: "Puno ime je obavezno",
      mathLevelRequired: "Molimo odaberite vašu razinu matematike"
    },
    success: {
      accountCreated: "Račun je uspješno stvoren!",
      signedIn: "Uspješno ste se prijavili!"
    }
  }
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(), 
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  phone: z.string().optional(),
  mathLevel: z.string().min(1)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function PWAAuth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get language from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as Language;
    const storedLang = localStorage.getItem('pwa-language') as Language;
    
    setLanguage(langParam || storedLang || 'en');
  }, []);

  const t = translations[language];

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      mathLevel: ''
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      // Store response status before consuming body
      const status = response.status;
      const ok = response.ok;
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');

      if (!ok) {
        let errorMessage = 'Login failed';
        if (hasJsonContent) {
          try {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, use default message
          }
        }
        throw new Error(`${errorMessage} (status ${status})`);
      }

      // Parse successful JSON response
      if (hasJsonContent) {
        return await response.json();
      }
      return null;
    },
    onSuccess: () => {
      toast({
        title: t.success.signedIn,
        description: "Welcome to LukaMath!"
      });
      setLocation(`/pwa/dashboard?lang=${language}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive"
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) => {
      const response = await apiRequest('POST', '/api/students', {
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        mathLevel: data.mathLevel,
        language: language
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t.success.accountCreated,
        description: "You can now sign in to your account"
      });
      setMode('login');
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create account. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Helmet>
        <title>{mode === 'login' ? t.signIn : t.register} - LukaMath Student App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/pwa">
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Calculator className="w-6 h-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-slate-800">LukaMath</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {mode === 'login' ? t.signIn : t.register}
          </h2>
          <p className="text-slate-600">
            {mode === 'login' 
              ? "Welcome back to your math learning journey"
              : "Start your personalized math learning journey"
            }
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {mode === 'login' ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.email}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input {...field} type="email" className="pl-10" placeholder="student@example.com" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.password}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                              {...field} 
                              type={showPassword ? "text" : "password"} 
                              className="pl-10 pr-10"
                              placeholder="••••••••"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? t.loading : t.signInButton}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.fullName}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input {...field} className="pl-10" placeholder="John Doe" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.email}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input {...field} type="email" className="pl-10" placeholder="student@example.com" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.phone} ({language === 'en' ? 'Optional' : 'Neobavezno'})</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input {...field} type="tel" className="pl-10" placeholder="+1 (555) 123-4567" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="mathLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.mathLevel}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.mathLevel} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="middle-school">{t.middleSchool}</SelectItem>
                            <SelectItem value="high-school">{t.highSchool}</SelectItem>
                            <SelectItem value="university">{t.university}</SelectItem>
                            <SelectItem value="sat-act">{t.satAct}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.password}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                              {...field} 
                              type={showPassword ? "text" : "password"} 
                              className="pl-10 pr-10"
                              placeholder="••••••••"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.confirmPassword}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input {...field} type="password" className="pl-10" placeholder="••••••••" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? t.loading : t.registerButton}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-sm"
              >
                {mode === 'login' ? (
                  <>
                    {t.noAccount} <span className="text-blue-600 ml-1">{t.signUp}</span>
                  </>
                ) : (
                  <>
                    {t.haveAccount} <span className="text-blue-600 ml-1">{t.signInButton}</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
