import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({ email: data.email, password: data.password });
      toast.success('Welcome to Miav!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Arka plan tam ekran, form üstte — sol kenarda resmin ucu görünsün, form sağa yapışmasın */}
      <div
        className="absolute inset-0 z-0 hidden bg-no-repeat md:block"
        style={{
          backgroundImage: 'url(/login-bg.png)',
          backgroundPosition: 'right center',
          backgroundSize: 'cover',
        }}
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-md flex-shrink-0 flex-col justify-center bg-[#FDF8F5]/95 px-8 py-12 shadow-xl backdrop-blur-sm md:max-w-lg md:ml-8 md:mr-8 md:px-12 lg:ml-12 lg:mr-12 lg:px-16">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-2 px-0 text-left">
            <img 
              src="/logo.png" 
              alt="Miav Logo" 
              className="mb-2 h-16 w-16 object-contain"
            />
            <CardTitle className="text-2xl font-bold text-[#402E2A]">Create Account</CardTitle>
            <CardDescription className="text-[#402E2A]/80">Join Miav to start caring for your pets</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#402E2A]">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="hello@example.com"
                          className="border-[#402E2A]/20 bg-white focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#402E2A]">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="border-[#402E2A]/20 bg-white focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#402E2A]">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="border-[#402E2A]/20 bg-white focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-[#E67E66] hover:bg-[#E67E66]/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col gap-4 px-0 text-left">
            <div className="text-sm text-[#402E2A]/80">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#E67E66] hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
