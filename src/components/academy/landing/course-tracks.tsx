'use client';

import Image from 'next/image';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store/app-store';

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

export function CourseTracks() {
  const { navigate, courses } = useAppStore();

  // Show first 9 courses
  const displayCourses = courses.slice(0, 9);

  return (
    <section className="py-20 sm:py-28 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
            Course Tracks
          </h2>
          <p className="animate-fade-up stagger-1 mt-4 text-lg text-muted-foreground">
            Structured learning paths covering every aspect of USA truck dispatch
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCourses.map((course, index) => (
            <Card
              key={course.id}
              className={`animate-fade-up stagger-${Math.min(index + 1, 6)} group overflow-hidden border-border/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20`}
            >
              {/* Course Image */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                {/* Category Badge */}
                <Badge
                  variant="secondary"
                  className="absolute left-3 top-3 bg-background/90 text-xs backdrop-blur-sm"
                >
                  {course.category}
                </Badge>
                {/* Duration badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-white/90">
                  <Clock className="h-3 w-3" />
                  {course.durationHours}h
                </div>
              </div>

              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${difficultyColors[course.difficulty]}`}
                  >
                    {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {course.lessons.length} lessons
                  </span>
                </div>

                <h3 className="mb-2 font-semibold leading-tight group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {course.subtitle}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-primary hover:bg-transparent"
                  onClick={() => navigate('course-detail', course.id)}
                >
                  Learn More
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
