import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { ArrowLeft, UserPlus, GraduationCap, Globe, Target } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import { trackEvent } from '@/lib/analytics';

// Validation schemas
const nameSchema = z.string().min(1, 'This field is required').max(50, 'Name must be less than 50 characters');
const emailSchema = z.string().email('Please enter a valid email address');
const mathLevelSchema = z.enum(['middle-school', 'high-school', 'statistics', 'linear-algebra', 'sat-act'], { required_error: 'Please select a math level' });
const languageSchema = z.enum(['en', 'hr'], { required_error: 'Please select a language' });

const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  language: languageSchema,
  mathLevel: mathLevelSchema,
  parentEmail: emailSchema.optional().or(z.literal('')),
  goals: z.string().min(10, 'Please describe your math learning goals (at least 10 characters)'),
});

type RegisterData = z.infer<typeof registerSchema>;

export default function Register() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      language: 'en' as const,
      mathLevel: undefined,
      parentEmail: '',
      goals: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: () => {
      // Track registration conversion in Google Analytics
      trackEvent('registration_complete', 'conversion', 'student_registration', 1);
      
      setIsSubmitted(true);
      toast({
        title: language === 'en' ? 'Registration Successful!' : t('register.success_title'),
        description: language === 'en' ? 'Welcome to LukaMath! Please check your email for next steps.' : t('register.success_message'),
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'en' ? 'Registration Failed' : 'Registracija neuspješna',
        description: error.message || (language === 'en' ? 'Something went wrong. Please try again.' : 'Nešto je pošlo po zlu. Molimo pokušajte ponovo.'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    // Track registration attempt
    trackEvent('registration_attempt', 'engagement', data.mathLevel, 1);
    registerMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">
              {language === 'en' ? 'Registration Complete!' : t('register.success_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              {language === 'en' ? 
                'Thank you for joining LukaMath! Your registration has been submitted successfully.' :
                'Hvala što ste se pridružili LukaMath-u! Vaša registracija je uspješno poslana.'
              }
            </p>
            <p className="text-sm text-gray-500">
              {language === 'en' ?
                'Luka will review your registration and contact you within 24 hours to schedule your first tutoring session.' :
                'Luka će pregledati vašu registraciju i kontaktirati vas u roku od 24 sata za zakazivanje prve sesije podučavanja.'
              }
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">{language === 'en' ? 'Return to Home' : t('register.back_home')}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/api/login">{language === 'en' ? 'Login to Your Account' : 'Prijavite se na vaš račun'}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "hr" : "en")}
              className="text-blue-600 hover:text-blue-800"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language === "en" ? "HR" : "EN"}
            </Button>
          </div>
          <CardTitle className="text-3xl text-blue-900">
            {language === 'en' ? 'Join LukaMath' : t('register.title')}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {language === 'en' ? 
              'Start your personalized math tutoring journey with expert guidance' :
              t('register.subtitle')
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  placeholder="Enter your first name"
                  className="hover:scale-105 transition-transform"
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  placeholder="Enter your last name"
                  className="hover:scale-105 transition-transform"
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="student@example.com"
                className="hover:scale-105 transition-transform"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent/Guardian Email (if under 18)</Label>
              <Input
                id="parentEmail"
                type="email"
                {...form.register('parentEmail')}
                placeholder="parent@example.com"
                className="hover:scale-105 transition-transform"
              />
              {form.formState.errors.parentEmail && (
                <p className="text-red-500 text-sm">{form.formState.errors.parentEmail.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Language *</Label>
                <Select
                  value={form.watch('language')}
                  onValueChange={(value) => form.setValue('language', value as 'en' | 'hr')}
                >
                  <SelectTrigger className="hover:scale-105 transition-transform">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hr">Croatian (Hrvatski)</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.language && (
                  <p className="text-red-500 text-sm">{form.formState.errors.language.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Current Math Level *</Label>
                <Select
                  value={form.watch('mathLevel')}
                  onValueChange={(value) => form.setValue('mathLevel', value as 'middle-school' | 'high-school' | 'statistics' | 'linear-algebra' | 'sat-act')}
                >
                  <SelectTrigger className="hover:scale-105 transition-transform">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle-school">Middle School Math</SelectItem>
                    <SelectItem value="high-school">High School Math</SelectItem>
                    <SelectItem value="statistics">Statistics</SelectItem>
                    <SelectItem value="linear-algebra">Linear Algebra</SelectItem>
                    <SelectItem value="sat-act">SAT/ACT Prep</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.mathLevel && (
                  <p className="text-red-500 text-sm">{form.formState.errors.mathLevel.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Math Learning Goals *</Label>
              <textarea
                id="goals"
                {...form.register('goals')}
                placeholder="Describe your math learning goals, areas you want to improve, or specific topics you need help with..."
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-105 transition-transform"
              />
              {form.formState.errors.goals && (
                <p className="text-red-500 text-sm">{form.formState.errors.goals.message}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex-1 hover:scale-105 transition-transform"
              >
                {registerMutation.isPending ? 'Creating Account...' : 'Register for LukaMath'}
              </Button>
              <Button asChild variant="outline" className="flex-1 hover:scale-105 transition-transform">
                <Link href="/">← Back to Home</Link>
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/api/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}