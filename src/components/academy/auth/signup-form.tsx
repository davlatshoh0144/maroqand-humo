'use client';

import { useState, useMemo } from 'react';
import { z } from 'zod/v4';
import { useAppStore } from '@/lib/store/app-store';
import { getDefaultViewForRole } from '@/lib/auth/access-control';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Loader2, Eye, EyeOff, Truck, ShieldCheck } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function getPasswordStrength(password: string): { label: string; score: number; color: string } {
  if (!password) return { label: '', score: 0, color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', score: 1, color: 'bg-red-500' };
  if (score <= 3) return { label: 'Medium', score: 2, color: 'bg-amber-500' };
  return { label: 'Strong', score: 3, color: 'bg-emerald-500' };
}

export function SignupForm() {
  const { signup, navigate } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    const result = signupSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    const success = await signup(name, email, password);
    setIsLoading(false);

    if (success) {
      // Set onboarding flag so dashboard shows welcome modal
      localStorage.setItem('marokand_onboarding', 'true');
      toast.success('Account created!', { description: 'Welcome to Marokand Humo Academy.' });
      navigate(getDefaultViewForRole(useAppStore.getState().user?.role));
    } else {
      toast.error('Signup failed', { description: 'An account with this email already exists.' });
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 relative">
      {/* Operations background pattern */}
      <div className="absolute inset-0 trucking-pattern-bg opacity-50" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
        {/* Left side: Truck illustration (desktop only) */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/5 rounded-l-xl border border-border/50 p-8 relative overflow-hidden">
          <div className="absolute inset-0 route-map-pattern opacity-30" />
          <div className="relative z-10 text-center space-y-6">
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                <Truck className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Start Your Journey</h2>
              <p className="text-sm text-muted-foreground mt-1">Practice dispatch skills with guided lessons</p>
            </div>
            <div className="space-y-3 text-left max-w-xs mx-auto">
              {[
                'Learn dispatch workflows',
                'Practice with simulated load boards',
                'Build course completion evidence',
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

        {/* Right side: Signup form with glass-card effect and gradient border */}
        <Card className="glass-card-gradient animate-fade-up rounded-l-none lg:rounded-l-none rounded-xl lg:rounded-r-xl">
          <CardHeader className="text-center relative z-10">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10 lg:hidden">
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">Join Marokand Humo Academy and start learning</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                    className="pl-10"
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
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
                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-muted'}`} />
                      <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-muted'}`} />
                      <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-muted'}`} />
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength.score === 1 ? 'text-red-500' :
                      passwordStrength.score === 2 ? 'text-amber-500' :
                      'text-emerald-500'
                    }`}>
                      {passwordStrength.label}
                      {passwordStrength.score === 3 && <ShieldCheck className="inline h-3 w-3 ml-1" />}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                New public accounts are created as student accounts. Instructors and admins are assigned by an administrator.
              </div>

              {/* Terms/Privacy checkbox */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <button type="button" onClick={() => navigate('terms')} className="text-primary hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" onClick={() => navigate('privacy')} className="text-primary hover:underline">Privacy Policy</button>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 relative z-10">
              <Button type="submit" className="w-full" disabled={isLoading || !agreedToTerms}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('login')} className="text-primary hover:underline font-medium">
                  Sign In
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
