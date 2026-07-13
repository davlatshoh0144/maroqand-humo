'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Clock,
  BookOpen,
  Award,
  Lock,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type CategoryFilter = 'all' | string;
type CertFilter = 'all' | 'yes' | 'no';

/** Highlight matching text with bold */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="text-primary font-semibold">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/** Difficulty dots indicator (1-5 dots) */
function DifficultyDots({ difficulty }: { difficulty: string }) {
  const level = difficulty === 'beginner' ? 2 : difficulty === 'intermediate' ? 3 : 5;
  const color = difficulty === 'beginner' ? 'bg-emerald-500' : difficulty === 'intermediate' ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-0.5" title={`${difficulty} difficulty`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-all ${i < level ? color : 'bg-muted/30'}`}
        />
      ))}
    </div>
  );
}

/** Animated count for result number */
function AnimatedCount({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-semibold text-primary inline-block"
    >
      {value}
    </motion.span>
  );
}

/** Mini avatar stack showing this is a practice module */
function AvatarStack() {
  const colors = ['bg-primary/80', 'bg-emerald-500/80', 'bg-amber-500/80', 'bg-purple-500/80'];
  const initials = ['S', 'A', 'M', 'K'];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full ${colors[i % colors.length]} border-2 border-background flex items-center justify-center`}
          >
            <span className="text-[7px] font-bold text-white">{initials[i]}</span>
          </div>
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">Practice module</span>
    </div>
  );
}

/** Get color-coded category class */
function getCategoryClass(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('compliance') || lower.includes('dot') || lower.includes('fmcsa') || lower.includes('hos') || lower.includes('eld')) return 'category-compliance';
  if (lower.includes('operation') || lower.includes('dispatch') || lower.includes('load')) return 'category-operations';
  if (lower.includes('broker') || lower.includes('communication') || lower.includes('mail')) return 'category-communication';
  if (lower.includes('career') || lower.includes('resume') || lower.includes('interview')) return 'category-career';
  if (lower.includes('safety') || lower.includes('fleet')) return 'category-safety';
  if (lower.includes('accounting') || lower.includes('document') || lower.includes('rate')) return 'category-accounting';
  return 'category-default';
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function CourseCatalog() {
  const { user, courses, enrollments, lessonProgress, navigate, enrollCourse } = useAppStore();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [certFilter, setCertFilter] = useState<CertFilter>('all');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  // Get unique categories from courses
  const categories = useMemo(() => {
    const cats = [...new Set(courses.map((c) => c.category))];
    return ['all', ...cats.sort()];
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return courses.filter((course) => {
      if (!course.published) return false;
      if (q) {
        if (
          !course.title.toLowerCase().includes(q) &&
          !course.subtitle.toLowerCase().includes(q) &&
          !course.description.toLowerCase().includes(q) &&
          !course.instructorName.toLowerCase().includes(q) &&
          !course.category.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (difficulty !== 'all' && course.difficulty !== difficulty) return false;
      if (category !== 'all' && course.category !== category) return false;
      if (certFilter === 'yes' && !course.certificateAvailable) return false;
      if (certFilter === 'no' && course.certificateAvailable) return false;
      return true;
    });
  }, [courses, debouncedSearch, difficulty, category, certFilter]);

  const publishedCount = useMemo(() => courses.filter((c) => c.published).length, [courses]);

  const hasActiveFilters = debouncedSearch || difficulty !== 'all' || category !== 'all' || certFilter !== 'all';

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
    setDifficulty('all');
    setCategory('all');
    setCertFilter('all');
  }, []);

  // Get course state for current user
  const getCourseState = useCallback(
    (courseId: string) => {
      if (!user) return 'locked';
      const enrollment = enrollments.find(
        (e) => e.userId === user.id && e.courseId === courseId && e.status === 'active'
      );
      if (!enrollment) return 'new';
      const course = courses.find((c) => c.id === courseId);
      if (!course) return 'new';
      const totalLessons = course.lessons.length;
      const completedLessons = course.lessons.filter((l) =>
        lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user?.id)
      ).length;
      if (completedLessons === totalLessons) return 'completed';
      if (completedLessons > 0) return 'continue';
      return 'new';
    },
    [user, enrollments, lessonProgress]
  );

  // Get progress percent for enrolled courses
  const getProgressPercent = useCallback(
    (courseId: string) => {
      const course = courses.find((c) => c.id === courseId);
      if (!course || !user) return 0;
      const totalLessons = course.lessons.length;
      const completedLessons = course.lessons.filter((l) =>
        lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user?.id)
      ).length;
      return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    },
    [user, lessonProgress]
  );

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  const getStateBadge = (state: string, courseId: string) => {
    switch (state) {
      case 'completed':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs backdrop-blur-sm"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'continue': {
        const pct = getProgressPercent(courseId);
        return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs backdrop-blur-sm"><PlayCircle className="mr-1 h-3 w-3" />Continue · {pct}%</Badge>;
      }
      case 'new':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs backdrop-blur-sm"><BookOpen className="mr-1 h-3 w-3" />New</Badge>;
      default:
        return <Badge className="bg-muted/50 text-muted-foreground border-border text-xs backdrop-blur-sm"><Lock className="mr-1 h-3 w-3" />Locked</Badge>;
    }
  };

  const handleNavigate = (view: Parameters<typeof navigate>[0], id?: string) => {
    navigate(view, id);
  };

  // Difficulty pill filter data
  const difficultyPills = [
    { value: 'all' as DifficultyFilter, label: 'All Levels' },
    { value: 'beginner' as DifficultyFilter, label: 'Beginner', color: 'bg-emerald-500' },
    { value: 'intermediate' as DifficultyFilter, label: 'Intermediate', color: 'bg-amber-500' },
    { value: 'advanced' as DifficultyFilter, label: 'Advanced', color: 'bg-red-500' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Course Catalog</h1>
        <p className="text-muted-foreground mt-2 text-base">
          Browse our comprehensive trucking dispatch curriculum
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses, topics, instructors..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10 h-11 bg-card border-border/70 shadow-sm focus-visible:border-primary/50"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setDebouncedSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={certFilter} onValueChange={(v) => setCertFilter(v as CertFilter)}>
          <SelectTrigger className="w-full sm:w-44 h-11">
            <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Certificate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Certificate</SelectItem>
            <SelectItem value="yes">Certificate Available</SelectItem>
            <SelectItem value="no">No Certificate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter Pills - with color coding */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = category === cat;
          const catClass = cat === 'all' ? '' : getCategoryClass(cat);
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : cat !== 'all'
                    ? `${catClass} border hover:opacity-80`
                    : 'bg-card text-muted-foreground border-border/70 hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          );
        })}
      </div>

      {/* Difficulty Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {difficultyPills.map((pill) => {
          const isActive = difficulty === pill.value;
          return (
            <button
              key={pill.value}
              onClick={() => setDifficulty(pill.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border/70 hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {pill.color && (
                <span className={`h-1.5 w-1.5 rounded-full ${pill.color}`} />
              )}
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Results count with animated number and clear filters */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <AnimatedCount value={filteredCourses.length} /> of {publishedCount} courses
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, i) => {
            const state = getCourseState(course.id);
            const progressPct = state === 'continue' ? getProgressPercent(course.id) : 0;
            const isFeatured = i === 0;
            const isCoreTrack = i < 3;
            return (
              <motion.div
                key={course.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
              >
                <Card
                  className="group cursor-pointer hover:border-primary/30 transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-xl relative card-glow hover:-translate-y-1"
                  onClick={() => handleNavigate('course-detail', course.id)}
                >
                  {/* Featured ribbon */}
                  {isFeatured && (
                    <div className="absolute top-4 -left-8 z-20 rotate-[-35deg] bg-primary text-primary-foreground px-10 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md">
                      Featured
                    </div>
                  )}

                  {/* Shimmer overlay on hover */}
                  <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:animate-[shimmer_1.2s_ease-in-out_forwards]" />
                    </div>
                  </div>

                  {/* Course Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                    {/* Badges overlaid on image */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={`${getDifficultyColor(course.difficulty)} text-xs backdrop-blur-sm`}>
                        {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                      </Badge>
                      <DifficultyDots difficulty={course.difficulty} />
                    </div>
                    <div className="absolute top-3 right-3">
                      {getStateBadge(state, course.id)}
                    </div>
                    {course.certificateAvailable && (
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-amber-500/90 text-white border-amber-600/50 text-xs backdrop-blur-sm">
                          <Award className="mr-1 h-3 w-3" />Certificate
                        </Badge>
                      </div>
                    )}
                    {/* Core track tag with shimmer */}
                    {isCoreTrack && (
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-primary/90 text-primary-foreground text-xs backdrop-blur-sm gap-1 shimmer-badge">
                          <BookOpen className="h-3 w-3" />Core Track
                        </Badge>
                      </div>
                    )}
                    {/* New tag with shimmer */}
                    {state === 'new' && !isCoreTrack && (
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-emerald-500/90 text-white text-xs backdrop-blur-sm gap-1 shimmer-badge">
                          <BookOpen className="h-3 w-3" />New
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Progress peek bar at bottom of image */}
                  {state === 'continue' && (
                    <div className="h-1 bg-muted/30 relative overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/80"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  )}

                  <CardContent className="flex-1 flex flex-col gap-3 p-5">
                    {/* Category - with color coding */}
                    <Badge variant="secondary" className={`w-fit text-xs border ${getCategoryClass(course.category)}`}>
                      <HighlightText text={course.category} query={debouncedSearch} />
                    </Badge>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors text-foreground">
                        <HighlightText text={course.title} query={debouncedSearch} />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        <HighlightText text={course.subtitle} query={debouncedSearch} />
                      </p>
                    </div>

                    {/* Progress bar for continue state */}
                    {state === 'continue' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{progressPct}%</span>
                        </div>
                        <Progress value={progressPct} className="h-1.5" />
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-auto">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="h-3 w-3" />
                        {course.durationHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.lessons.length} lessons
                      </span>
                    </div>

                    {/* Practice module label */}
                    <AvatarStack />

                    {/* Instructor */}
                    <p className="text-xs text-muted-foreground">
                      by <HighlightText text={course.instructorName} query={debouncedSearch} />
                    </p>

                    {/* CTA Button with arrow micro-interaction */}
                    <Button
                      size="sm"
                      className="w-full mt-1 group/btn group-hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate('course-detail', course.id);
                      }}
                    >
                      {state === 'locked' ? (
                        <>
                          <Lock className="mr-1.5 h-3.5 w-3.5" />
                          Unlock Course
                        </>
                      ) : state === 'continue' ? (
                        <>
                          <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                          Continue Learning
                        </>
                      ) : (
                        <>
                          View Course
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-foreground">No courses found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {debouncedSearch
              ? `No results for "${debouncedSearch}". Try a different search term or adjust your filters.`
              : 'Try adjusting your filters to find what you\'re looking for.'}
          </p>
          <Button
            variant="outline"
            className="mt-6 gap-1.5"
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4" />
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
