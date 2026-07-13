'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

export function SignOutPage() {
  const { logout, navigate } = useAppStore();
  const didSignOut = useRef(false);

  useEffect(() => {
    if (didSignOut.current) return;
    didSignOut.current = true;
    void logout('signout');
  }, [logout]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md animate-fade-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10">
            <LogOut className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Signed Out</CardTitle>
          <CardDescription className="text-base">
            Your academy session has ended.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            Sign in again when you are ready to continue your courses.
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button className="w-full" onClick={() => navigate('login')}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          <Button className="w-full" variant="outline" onClick={() => navigate('landing')}>
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
