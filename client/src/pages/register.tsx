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

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  language: z.enum(['en', 'hr'], { required_error: 'Please select a language' }),
  mathLevel: z.string().min(1, 'Please select your current math level'),
  parentEmail: z.string().email('Please enter a valid parent/guardian email').optional().or(z.literal('')),
  goals: z.string().min(10, 'Please describe your math learning goals (at least 10 characters)'),
});

type RegisterData = z.infer<typeof registerSchema>;

export default function Register() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      language: 'en',
      mathLevel: '',
      parentEmail: '',
      goals: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: 'Registration Successful!',
        description: 'Welcome to LukaMath! Please check your email for next steps.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Registration Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Thank you for joining LukaMath! Your registration has been submitted successfully.
            </p>
            <p className="text-sm text-gray-500">
              Luka will review your registration and contact you within 24 hours to schedule your first tutoring session.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/api/login">Login to Your Account</Link>
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
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-blue-900">Join LukaMath</CardTitle>
          <p className="text-gray-600 mt-2">
            Start your personalized math tutoring journey with expert guidance
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
                  onValueChange={(value) => form.setValue('mathLevel', value)}
                >
                  <SelectTrigger className="hover:scale-105 transition-transform">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">Elementary Math</SelectItem>
                    <SelectItem value="middle">Middle School Math</SelectItem>
                    <SelectItem value="algebra">Algebra I & II</SelectItem>
                    <SelectItem value="geometry">Geometry</SelectItem>
                    <SelectItem value="precalculus">Pre-Calculus</SelectItem>
                    <SelectItem value="calculus">Calculus</SelectItem>
                    <SelectItem value="sat">SAT/ACT Prep</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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