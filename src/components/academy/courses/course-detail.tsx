'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Users,
  Award,
  Lock,
  Unlock,
  PlayCircle,
  CheckCircle2,
  Star,
  AlertTriangle,
  Target,
  Lightbulb,
  ChevronRight,
  User,
  FileText,
  HelpCircle,
  ArrowUp,
  Share2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumbs } from '@/components/academy/shared/breadcrumbs';
import { CourseReviews } from '@/components/academy/courses/course-reviews';
import { shouldUseSupabase } from '@/lib/config/runtime';

/** Animated section wrapper — fades in when scrolled into view */
function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/** Floating back-to-top button */
function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow focus-ring"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function CourseDetail() {
  const { user, courses, selectedCourseId, enrollments, lessonProgress, navigate, enrollCourse, bookmarkedCourseIds, toggleBookmark, recordAnalyticsEvent } = useAppStore();
  const [showEnrollSuccess, setShowEnrollSuccess] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroOffset, setHeroOffset] = useState(0);

  const course = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || courses[0],
    [courses, selectedCourseId]
  );

  useEffect(() => {
    if (!course) return;
    recordAnalyticsEvent({ type: 'course_view', userId: user?.id, courseId: course.id });
  }, [course, recordAnalyticsEvent, user?.id]);

  // Parallax effect on hero image
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        // Only apply parallax while hero is visible
        if (rect.bottom > 0) {
          setHeroOffset(window.scrollY * 0.3);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-dismiss enrollment success after 10 seconds
  useEffect(() => {
    if (showEnrollSuccess) {
      const timer = setTimeout(() => setShowEnrollSuccess(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showEnrollSuccess]);

  // Enrollment status
  const enrollment = enrollments.find(
    (e) => e.userId === user?.id && e.courseId === course?.id && e.status === 'active'
  );
  const isEnrolled = !!enrollment;

  // Progress calculation
  const completedLessons = (course?.lessons ?? []).filter((l) =>
    lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user?.id)
  ).length;
  const totalLessons = course?.lessons.length ?? 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalDuration = (course?.lessons ?? []).reduce((sum, l) => sum + l.durationMin, 0);

  // Estimated reading time (avg 200 wpm, ~150 words per minute of content)
  const estimatedReadingTime = useMemo(() => {
    if (!course) return '0 min read';
    const totalWords = course.lessons.reduce((sum, l) => {
      return sum + l.content.split(/\s+/).length;
    }, 0);
    const minutes = Math.ceil(totalWords / 200);
    if (minutes < 60) return `${minutes} min read`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m read`;
  }, [course]);

  // Recommended courses (other courses excluding current)
  const recommendedCourses = useMemo(() => {
    if (!course) return courses.filter((c) => c.published).slice(0, 3);
    return courses
      .filter((c) => c.id !== course.id && c.published)
      .slice(0, 3);
  }, [course, courses]);

  const handleShareCourse = useCallback(() => {
    if (!course) return;
    const url = `${window.location.origin}?view=course-detail&course=${course.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied!', { description: 'Course link has been copied to your clipboard.' });
      }).catch(() => {
        toast.error('Failed to copy', { description: 'Please copy the URL from the address bar.' });
      });
    }
  }, [course]);

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  const handleEnroll = useCallback(() => {
    if (!course) return;
    if (!user) {
      toast.error('Please sign in', { description: 'You need an account to enroll in courses.' });
      navigate('login');
      return;
    }
    if (shouldUseSupabase()) {
      navigate('pricing');
      return;
    }
    enrollCourse(course.id);
    setShowEnrollSuccess(true);
  }, [user, course, enrollCourse, navigate]);

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">Course not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('courses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>
    );
  }

  const handleStartFreeLesson = () => {
    const freeLesson = course.lessons.find((l) => l.isFree);
    if (freeLesson) {
      navigate('lesson', course.id, freeLesson.id);
    }
  };

  const handleLessonClick = (lessonId: string, isFree: boolean) => {
    if (isEnrolled || isFree) {
      navigate('lesson', course.id, lessonId);
    } else {
      toast.error('Enrollment required', { description: 'Sign up or enroll to access this lesson.' });
    }
  };

  return (
    <div className="space-y-0">
      {/* Enrollment Success Overlay */}
      <AnimatePresence>
        {showEnrollSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEnrollSuccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-[340px] sm:w-[400px] border-primary/20 shadow-xl">
                <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center text-center space-y-4">
                  {/* Checkmark icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2, damping: 15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500"
                  >
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </motion.div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">You&apos;re Enrolled!</h3>
                    <p className="text-sm font-medium text-primary">{course.title}</p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Start with your first free lesson
                  </p>

                  <div className="flex flex-col gap-2 w-full pt-2">
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        setShowEnrollSuccess(false);
                        handleStartFreeLesson();
                      }}
                    >
                      <PlayCircle className="h-4 w-4" />
                      Start Learning
                    </Button>
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                      onClick={() => setShowEnrollSuccess(false)}
                    >
                      I&apos;ll start later
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Width Hero Image Section with parallax */}
      <div ref={heroRef} className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          style={{ transform: `translateY(${heroOffset * 0.15}px)` }}
        >
          <Image
            src={course.image}
            alt={course.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content overlaid on hero */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('courses')}
              className="mb-4 text-white/90 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`${getDifficultyColor(course.difficulty)} text-xs backdrop-blur-sm`}>
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </Badge>
              <Badge variant="secondary" className="backdrop-blur-sm bg-white/20 text-white border-white/20 text-xs">
                {course.category}
              </Badge>
              {course.certificateAvailable && (
                <Badge className="bg-amber-500/90 text-white border-amber-600/50 text-xs backdrop-blur-sm">
                  <Award className="mr-1 h-3 w-3" />Certificate
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{course.title}</h1>
            <p className="text-lg text-white/80 mt-2 max-w-2xl">{course.subtitle}</p>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-sm text-white/70 mt-3">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {course.durationHours} hours
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {estimatedReadingTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Guided training
              </span>
            </div>
            {/* Share + Bookmark buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 border-white/20 backdrop-blur-sm gap-1.5"
                onClick={handleShareCourse}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share this course
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`backdrop-blur-sm gap-1.5 ${
                  bookmarkedCourseIds.includes(course.id)
                    ? 'bg-primary/90 text-primary-foreground hover:bg-primary border-primary'
                    : 'bg-white/20 text-white hover:bg-white/30 border-white/20'
                }`}
                onClick={() => toggleBookmark(course.id)}
              >
                {bookmarkedCourseIds.includes(course.id) ? (
                  <>
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" />
                    Bookmark
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', onClick: () => navigate('landing') },
            { label: 'Courses', onClick: () => navigate('courses') },
            { label: course.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <AnimatedSection>
              <p className="text-muted-foreground leading-relaxed text-base">{course.description}</p>
            </AnimatedSection>

            {/* Progress bar if enrolled */}
            {isEnrolled && (
              <AnimatedSection delay={0.05}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Your Progress</span>
                      <span className="text-sm text-muted-foreground">{completedLessons}/{totalLessons} lessons · {progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2.5" />
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* What You'll Learn */}
            <AnimatedSection delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <Target className="h-5 w-5 text-primary" />
                    What You&apos;ll Learn
                  </CardTitle>
                  <CardDescription>Key skills and knowledge you&apos;ll gain from this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learningOutcomes.map((outcome, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-primary/5">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Prerequisites */}
            {course.prerequisites.length > 0 && (
              <AnimatedSection delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <FileText className="h-5 w-5 text-amber-500" />
                      Prerequisites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.prerequisites.map((prereq, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{prereq}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Common Mistakes */}
            {course.commonMistakes.length > 0 && (
              <AnimatedSection delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Common Mistakes
                    </CardTitle>
                    <CardDescription>Avoid these pitfalls that trip up new dispatchers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.commonMistakes.map((mistake, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5">
                          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{mistake}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* What You Will Actually Do */}
            <AnimatedSection delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    What You Will Actually Do
                  </CardTitle>
                  <CardDescription>Practical exercises and real-world applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.lessons.filter((l) => l.isRequired).slice(0, 4).map((lesson) => (
                      <div key={lesson.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                        <PlayCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">{lesson.checklist[0]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Lesson List */}
            <AnimatedSection delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Course Curriculum
                  </CardTitle>
                  <CardDescription>{totalLessons} lessons · {totalDuration} minutes total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border/50">
                    {course.lessons.map((lesson, i) => {
                      const isCompleted = lessonProgress.some(
                        (p) => p.lessonId === lesson.id && p.completed && p.userId === user?.id
                      );
                      const canAccess = isEnrolled || lesson.isFree;
                      const lessonNumber = String(i + 1).padStart(2, '0');

                      return (
                        <button
                          key={lesson.id}
                          className="w-full text-left py-4 first:pt-0 last:pb-0 flex items-center gap-4 group transition-colors"
                          onClick={() => handleLessonClick(lesson.id, lesson.isFree)}
                        >
                          {/* Lesson number indicator */}
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-sm font-mono font-semibold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : canAccess ? (
                              lessonNumber
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">{lesson.title}</p>
                              {lesson.isFree && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                  <Unlock className="mr-0.5 h-2.5 w-2.5" />
                                  Free
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge className="text-[10px] px-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shrink-0">
                                  <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                                  Done
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {lesson.description}
                            </p>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {lesson.durationMin}m
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Instructor Spotlight Card */}
            <AnimatedSection delay={0.1}>
              <Card className="instructor-spotlight">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
                      {course.instructorAvatar ? (
                        <Image
                          src={course.instructorAvatar}
                          alt={course.instructorName}
                          width={64}
                          height={64}
                          className="h-auto w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{course.instructorName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Lead Instructor</p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{course.instructorBio}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <a href="#" className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 social-link-hover transition-all" aria-label="LinkedIn">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#" className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 social-link-hover transition-all" aria-label="Twitter">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Course Reviews */}
            <AnimatedSection delay={0.1}>
              <CourseReviews courseId={course.id} />
            </AnimatedSection>

            {/* FAQ Section */}
            <AnimatedSection delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="faq-1">
                      <AccordionTrigger className="text-sm">How long do I have access to this course?</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Once you start a course, you have access to the available lessons, including future updates for that course.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-2">
                      <AccordionTrigger className="text-sm">Can I get a certificate after completing this course?</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {course.certificateAvailable
                          ? "Yes. Certificates unlock after all required lessons are complete, quiz thresholds are met, and required assignments are approved."
                          : "This course does not currently offer a certificate, but it still includes practical training material."}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-3">
                      <AccordionTrigger className="text-sm">What if I need help during the course?</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        You can ask questions in the course discussion board. Instructor response times may vary, and Pro students receive priority support.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-4">
                      <AccordionTrigger className="text-sm">Is this course suitable for complete beginners?</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {course.difficulty === 'beginner'
                          ? 'Absolutely! This course is designed for people with no prior experience in truck dispatch.'
                          : 'We recommend completing foundational courses first, but motivated beginners can still follow along.'}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-5">
                      <AccordionTrigger className="text-sm">Can I try before enrolling?</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Yes! The first lesson of every course is completely free. Try it out and see if the course is right for you.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Sidebar: CTA + Instructor + Stats — sticky on desktop */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* CTA Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                {isEnrolled ? (
                  <>
                    {/* Mini progress bar in sidebar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-1.5" />
                    </div>
                    <Button className="w-full" size="lg" onClick={handleStartFreeLesson}>
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Continue Learning
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      {completedLessons}/{totalLessons} lessons completed
                    </p>
                  </>
                ) : (
                  <>
                    <Button className="w-full" size="lg" onClick={handleEnroll}>
                      Get Full Access
                    </Button>
                    {course.lessons.some((l) => l.isFree) && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleStartFreeLesson}
                      >
                        <Unlock className="mr-2 h-4 w-4" />
                        Start Free Lesson
                      </Button>
                    )}
                    <p className="text-center text-xs text-muted-foreground">
                      First lesson is free — no credit card required
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Instructor Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full">
                    {course.instructorAvatar ? (
                      <Image
                        src={course.instructorAvatar}
                        alt={course.instructorName}
                        width={48}
                        height={48}
                        className="h-auto w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{course.instructorName}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{course.instructorBio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-foreground">{totalDuration}</p>
                    <p className="text-xs text-muted-foreground">Total Minutes</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{totalLessons}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{course.lessons.filter((l) => l.isRequired).length}</p>
                    <p className="text-xs text-muted-foreground">Required</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{course.lessons.filter((l) => l.isFree).length}</p>
                    <p className="text-xs text-muted-foreground">Free</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        {!isEnrolled && (
          <AnimatedSection delay={0.1}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Ready to Start Learning?</h3>
                    <p className="text-muted-foreground mt-1">
                      Start with the free lesson, then continue when you are ready.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button size="lg" onClick={handleEnroll}>
                      Get Full Access
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleStartFreeLesson}>
                      Try Free Lesson
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}
      </div>

      {/* Related courses */}
      {recommendedCourses.length > 0 && (
        <AnimatedSection delay={0.1}>
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Related Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCourses.map((rc) => (
                <Card
                  key={rc.id}
                  className="hover-lift cursor-pointer overflow-hidden group"
                  onClick={() => {
                    useAppStore.getState().navigate('course-detail', rc.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={rc.image}
                      alt={rc.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className={`absolute top-2 left-2 text-[10px] ${
                      rc.difficulty === 'beginner' ? 'bg-emerald-500/90 text-white' :
                      rc.difficulty === 'intermediate' ? 'bg-amber-500/90 text-white' :
                      'bg-red-500/90 text-white'
                    }`}>
                      {rc.difficulty.charAt(0).toUpperCase() + rc.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{rc.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rc.subtitle}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rc.durationHours}h</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{rc.lessons.length} lessons</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Sticky Enrollment CTA Bar - shows on scroll */}
      {!isEnrolled && (
        <div className="sticky-cta-bar fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 border-border/50 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{course.title}</p>
              <p className="text-xs text-muted-foreground">{course.durationHours}h · {totalLessons} lessons · Free preview</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button size="sm" className="flex-1 sm:flex-none gap-1.5" onClick={handleEnroll}>
                Get Full Access
              </Button>
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none gap-1.5" onClick={handleStartFreeLesson}>
                <Unlock className="h-3.5 w-3.5" /> Try Free Lesson
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating back-to-top button */}
      <BackToTopButton />
    </div>
  );
}
