'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { toast } from 'sonner';

type SortOption = 'recent' | 'title' | 'category';

function getDifficultyColor(d: string) {
  switch (d) {
    case 'beginner':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'intermediate':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'advanced':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return '';
  }
}

function getCategoryColor(cat: string) {
  switch (cat) {
    case 'Dispatch':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'Business':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'Operations':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'Compliance':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'Safety':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export function CourseBookmarks() {
  const { courses, bookmarkedCourseIds, toggleBookmark, navigate } = useAppStore();
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  // Get bookmarked course objects
  const bookmarkedCourses = useMemo(() => {
    return bookmarkedCourseIds
      .map((id) => courses.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => !!c);
  }, [bookmarkedCourseIds]);

  // Sort bookmarked courses
  const sortedCourses = useMemo(() => {
    const sorted = [...bookmarkedCourses];
    switch (sortOption) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'recent':
      default:
        // Keep in bookmark order (most recent first)
        break;
    }
    return sorted;
  }, [bookmarkedCourses, sortOption]);

  const handleRemove = (courseId: string, courseTitle: string) => {
    toggleBookmark(courseId);
    toast.success('Bookmark removed', {
      description: `"${courseTitle}" has been removed from your bookmarks.`,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <BookmarkCheck className="h-7 w-7 text-primary" />
            Bookmarks
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Your saved courses for quick access
          </p>
        </div>
        {bookmarkedCourses.length > 0 && (
          <div className="flex items-center gap-3">
            <Select
              value={sortOption}
              onValueChange={(v) => setSortOption(v as SortOption)}
            >
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Bookmarked Courses Grid */}
      {sortedCourses.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {sortedCourses.map((course) => {
              const savedIndex = bookmarkedCourseIds.indexOf(course.id);
              const savedDate = savedIndex >= 0
                ? new Date(Date.now() - savedIndex * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';
              return (
                <motion.div
                  key={course.id}
                  variants={cardVariants}
                  layout
                  exit="exit"
                >
                  <Card className="group hover:border-primary/30 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-lg hover-lift flex flex-col">
                    {/* Course Image */}
                    <div
                      className="relative aspect-video overflow-hidden cursor-pointer"
                      onClick={() => navigate('course-detail', course.id)}
                    >
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                      {/* Category badge */}
                      <Badge
                        className={`absolute top-3 left-3 text-xs backdrop-blur-sm ${getCategoryColor(course.category)}`}
                      >
                        {course.category}
                      </Badge>

                      {/* Difficulty badge */}
                      <Badge
                        className={`absolute top-3 right-3 text-xs backdrop-blur-sm ${getDifficultyColor(course.difficulty)}`}
                      >
                        {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                      </Badge>
                    </div>

                    <CardContent className="flex-1 flex flex-col gap-3 p-5">
                      {/* Title */}
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate('course-detail', course.id)}
                      >
                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors text-foreground">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {course.subtitle}
                        </p>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.durationHours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course.lessons.length} lessons
                        </span>
                        {savedDate && (
                          <span className="text-muted-foreground/60">
                            Saved {savedDate}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate('course-detail', course.id)}
                        >
                          View Course
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                          onClick={() => handleRemove(course.id, course.title)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {sortedCourses.length === 0 && (
        <div className="text-center py-20">
          <div className="mx-auto h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
            <Bookmark className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-foreground">
            No bookmarks yet
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Browse courses and click the bookmark icon to save them here for quick access.
          </p>
          <Button
            className="mt-6 gap-2"
            onClick={() => navigate('courses')}
          >
            <BookOpen className="h-4 w-4" />
            Browse Courses
          </Button>
        </div>
      )}
    </div>
  );
}
