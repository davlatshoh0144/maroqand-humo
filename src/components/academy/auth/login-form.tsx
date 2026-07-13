'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { getDefaultViewForRole } from '@/lib/auth/access-control';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, Eye, EyeOff, Truck } from 'lucide-react';

export function LoginForm() {
  const { login, navigate } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      toast.success('Welcome back!', { description: 'You have been signed in successfully.' });
      navigate(getDefaultViewForRole(useAppStore.getState().user?.role));
    } else {
      toast.error('Sign in failed', { description: 'Invalid credentials. Please try again.' });
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 relative">
      {/* Operations background pattern */}
      <div className="absolute inset-0 trucking-pattern-bg opacity-50" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
        {/* Left side: Truck illustration (desktop only) */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/5 rounded-l-xl border border-border/50 p-8 relative overflow-hidden">
          {/* Static route planning overlay */}
          <div className="absolute inset-0 route-map-pattern opacity-30" />
          <div className="relative z-10 text-center space-y-6">
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                <Truck className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Marokand Humo Academy</h2>
              <p className="text-sm text-muted-foreground mt-1">Master the art of trucking dispatch</p>
            </div>
            <div className="space-y-3 text-left max-w-xs mx-auto">
              {[
                'Industry-leading curriculum',
                'Real-world load board practice',
                'Certificate on completion',
              ].map((text) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Login form with glass-card effect and gradient border */}
        <Card className="glass-card-gradient animate-fade-up rounded-l-none lg:rounded-l-none rounded-xl lg:rounded-r-xl">
          <CardHeader className="text-center relative z-10">
            {/* Mobile-only truck icon */}
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10 lg:hidden">
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">Sign in to your Marokand Humo Academy account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember-me" className="text-xs text-muted-foreground cursor-pointer">Remember me</Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('forgot-password')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 relative z-10">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => navigate('signup')} className="text-primary hover:underline font-medium">
                  Sign Up
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
