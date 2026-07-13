'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { instructors } from '@/lib/data/instructors';

export function Instructors() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
            Meet Your Instructors
          </h2>
          <p className="animate-fade-up stagger-1 mt-4 text-lg text-muted-foreground">
            Industry professionals with real dispatch and compliance experience
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((instructor, index) => (
            <Card
              key={instructor.id}
              className={`animate-fade-up stagger-${Math.min(index + 1, 6)} group border-border/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 overflow-hidden`}
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 h-24 w-24 overflow-hidden rounded-full ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                  <Image
                    src={instructor.avatar}
                    alt={instructor.name}
                    width={96}
                    height={96}
                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <h3 className="font-semibold text-lg">{instructor.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{instructor.specialization}</p>

                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {instructor.experience} experience
                  </Badge>
                </div>
                <div className="mt-1.5">
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {instructor.coursesTaught} courses
                  </Badge>
                </div>

                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                  {instructor.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
