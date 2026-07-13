'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { studentOutcomes } from '@/lib/data/outcomes';

export function StudentOutcomes() {
  return (
    <section className="py-20 sm:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
            Student Learning Paths
          </h2>
          <p className="animate-fade-up stagger-1 mt-4 text-lg text-muted-foreground">
            Learning goals and portfolio outcomes tracked during academy training
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studentOutcomes.map((outcome, index) => {
            const initials = outcome.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card
                key={outcome.id}
                className={`animate-fade-up stagger-${Math.min(index + 1, 6)} border-border/50 bg-card/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={outcome.avatar} alt={outcome.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{outcome.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {outcome.city}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {outcome.track}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Learning path
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {outcome.outcome}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
