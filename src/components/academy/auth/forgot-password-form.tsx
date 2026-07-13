'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { isDemoMode } from '@/lib/config/runtime';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, ArrowLeft, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** Animated checkmark SVG component */
function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"
    >
      <motion.div
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </motion.div>
    </motion.div>
  );
}

export function ForgotPasswordForm() {
  const { navigate, resetPassword } = useAppStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);
    const success = await resetPassword(email);
    setIsLoading(false);
    if (!success) {
      toast.error('Password reset failed', {
        description: 'Please check the email address and try again.',
      });
      return;
    }
    setIsSent(true);

    toast.success('Password reset link sent', {
      description: isDemoMode ? 'Check your inbox for the local reset link.' : 'Check your inbox for the reset link.',
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md animate-fade-up">
        <CardHeader className="text-center">
          <AnimatePresence mode="wait">
            {isSent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="flex flex-col items-center"
              >
                <div className="mx-auto mb-3">
                  <AnimatedCheckmark />
                </div>
                <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                <CardDescription className="text-base mt-1">
                  We sent a reset link to <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10">
                  <KeyRound className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription className="text-base mt-1">
                  Enter your email and we&apos;ll send you a reset link
                </CardDescription>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        {!isSent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Link
              </Button>
              <button
                type="button"
                onClick={() => navigate('login')}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </button>
            </CardFooter>
          </form>
        ) : (
          <CardFooter className="flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full space-y-4"
            >
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  If an account exists with this email, you&apos;ll receive a password reset link within a few minutes.
                </p>
              </div>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => navigate('login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
              <button
                type="button"
                onClick={() => { setIsSent(false); setEmail(''); }}
                className="text-sm text-primary hover:underline"
              >
                Didn&apos;t receive the email? Send again
              </button>
            </motion.div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
