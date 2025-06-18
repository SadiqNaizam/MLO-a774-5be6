import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

// Define the Zod schema for form validation
const registrationFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  // confirmPassword: z.string() // Optional: if confirm password is needed
})
// .refine((data) => data.password === data.confirmPassword, { // Optional: if confirm password is needed
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

const RegistrationPage: React.FC = () => {
  console.log('RegistrationPage loaded');
  const navigate = useNavigate();
  const [registrationStatus, setRegistrationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      email: '',
      password: '',
      // confirmPassword: '', // Optional
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setRegistrationStatus(null); // Clear previous status
    console.log('Registration form submitted:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example success/error handling
    const isSuccess = Math.random() > 0.3; // Simulate success/failure
    if (isSuccess) {
      setRegistrationStatus({ type: 'success', message: 'Registration successful! Redirecting to login...' });
      // In a real app, you might also use toast from sonner here
      // toast.success("Registration successful!");
      setTimeout(() => {
        navigate('/login'); // Navigate to login page as per App.tsx routes
      }, 2000);
    } else {
      setRegistrationStatus({ type: 'error', message: 'Registration failed. Please try again.' });
      // In a real app, you might also use toast from sonner here
      // toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Simple Header */}
      <header className="py-4 sm:py-6 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Easy Web File Workbench
          </Link>
          <Button variant="outline" asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center pt-1">
              Join EWFW to manage your files easily.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registrationStatus && (
              <Alert variant={registrationStatus.type === 'error' ? 'destructive' : 'default'} className={registrationStatus.type === 'success' ? 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700' : ''}>
                {registrationStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>{registrationStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{registrationStatus.message}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                       <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Optional: Confirm Password Field
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                */}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Log in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 sm:py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} Easy Web File Workbench. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default RegistrationPage;