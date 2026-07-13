'use client';

import { PlayCircle, Lock, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store/app-store';

export function FreePreview() {
  const { navigate } = useAppStore();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-primary/5">
          <CardContent className="flex flex-col items-center gap-8 p-8 text-center sm:p-12 md:flex-row md:text-left lg:p-16">
            {/* Icon / Visual */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <PlayCircle className="h-10 w-10 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Try Before You Commit
              </h2>
              <p className="mt-3 text-muted-foreground">
                The first lesson of every course is completely free. Experience our teaching
                style, explore the platform, and decide if it&apos;s right for you.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  <span>First lesson of every course is free</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>Full course requires a paid plan</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>Certificates require paid completion</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0">
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={() => navigate('courses')}
              >
                Browse Free Lessons
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
