'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Map,
  CheckCircle2,
  Lock,
  PlayCircle,
  BookOpen,
  Clock,
  ArrowRight,
  Trophy,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type CourseStatus = 'completed' | 'in-progress' | 'available' | 'locked';

function getCourseStatus(
  courseId: string,
  enrollments: { userId: string; courseId: string; status: string }[],
  lessonProgress: { lessonId: string; completed: boolean; userId: string }[],
  userId: string | undefined,
  allCourses: { id: string; lessons: { id: string }[] }[]
): CourseStatus {
  if (!userId) return 'locked';
  const enrollment = enrollments.find(
    (e) => e.userId === userId && e.courseId === courseId && e.status === 'active'
  );
  if (!enrollment) return 'available';
  const course = allCourses.find((c) => c.id === courseId);
  if (!course) return 'available';
  const totalLessons = course.lessons.length;
  const completedLessons = course.lessons.filter((l) =>
    lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === userId)
  ).length;
  if (completedLessons === 0) return 'in-progress';
  if (completedLessons >= totalLessons) return 'completed';
  return 'in-progress';
}

/** Roadmap node for horizontal timeline */
function RoadmapNode({
  courseId,
  title,
  category,
  difficulty,
  image,
  status,
  index,
  isLast,
  onClick,
}: {
  courseId: string;
  title: string;
  category: string;
  difficulty: string;
  image: string;
  status: CourseStatus;
  index: number;
  isLast: boolean;
  onClick: () => void;
}) {
  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center flex-shrink-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Node circle */}
      <button
        onClick={onClick}
        className="relative group"
        aria-label={`Navigate to ${title}`}
      >
        <div
          className={`
            relative h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center
            transition-all duration-300 border-2
            ${status === 'completed'
              ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20'
              : status === 'in-progress'
                ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                : status === 'available'
                  ? 'bg-card border-primary/30 hover:border-primary hover:shadow-md hover:shadow-primary/10'
                  : 'bg-muted border-muted-foreground/20 opacity-60'
            }
          `}
        >
          {status === 'completed' ? (
            <CheckCircle2 className="h-7 w-7 text-white" />
          ) : status === 'in-progress' ? (
            <Loader2 className="h-7 w-7 text-primary-foreground animate-spin" style={{ animationDuration: '3s' }} />
          ) : status === 'available' ? (
            <PlayCircle className="h-7 w-7 text-primary/60 group-hover:text-primary transition-colors" />
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground/50" />
          )}
        </div>
      </button>

      {/* Connecting line */}
      {!isLast && (
        <div className="absolute top-7 sm:top-8 left-[calc(50%+32px)] sm:left-[calc(50%+36px)] w-[calc(100%-64px)] sm:w-[calc(100%-72px)]">
          <div
            className={`h-0.5 w-full ${
              status === 'completed'
                ? 'bg-emerald-500'
                : status === 'in-progress'
                  ? 'bg-primary/40 border-t border-dashed border-primary'
                  : 'bg-muted-foreground/15 border-t border-dashed border-muted-foreground/20'
            }`}
          />
        </div>
      )}

      {/* Course info below node */}
      <div className="mt-3 text-center max-w-[120px] sm:max-w-[150px]">
        <p
          className={`text-xs sm:text-sm font-medium leading-tight line-clamp-2 ${
            status === 'locked' ? 'text-muted-foreground/50' : 'text-foreground'
          }`}
        >
          {title}
        </p>
        <Badge
          className={`mt-1.5 text-[9px] px-1.5 py-0 ${getDifficultyColor(difficulty)}`}
        >
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Badge>
      </div>
    </motion.div>
  );
}

/** Vertical timeline node for mobile */
function VerticalNode({
  courseId,
  title,
  category,
  difficulty,
  image,
  status,
  durationHours,
  index,
  isLast,
  onClick,
}: {
  courseId: string;
  title: string;
  category: string;
  difficulty: string;
  image: string;
  durationHours: number;
  status: CourseStatus;
  index: number;
  isLast: boolean;
  onClick: () => void;
}) {
  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  return (
    <motion.div
      className="flex gap-4 relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Left: Timeline node + line */}
      <div className="flex flex-col items-center">
        <button onClick={onClick} aria-label={`Navigate to ${title}`}>
          <div
            className={`
              h-10 w-10 rounded-full flex items-center justify-center
              transition-all duration-300 border-2 shrink-0
              ${status === 'completed'
                ? 'bg-emerald-500 border-emerald-500'
                : status === 'in-progress'
                  ? 'bg-primary border-primary'
                  : status === 'available'
                    ? 'bg-card border-primary/30'
                    : 'bg-muted border-muted-foreground/20 opacity-60'
              }
            `}
          >
            {status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-white" />
            ) : status === 'in-progress' ? (
              <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" style={{ animationDuration: '3s' }} />
            ) : status === 'available' ? (
              <PlayCircle className="h-5 w-5 text-primary/60" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground/50" />
            )}
          </div>
        </button>
        {/* Vertical connecting line */}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[40px] my-1 ${
              status === 'completed'
                ? 'bg-emerald-500'
                : status === 'in-progress'
                  ? 'bg-primary/40 border-l border-dashed border-primary'
                  : 'bg-muted-foreground/15 border-l border-dashed border-muted-foreground/20'
            }`}
          />
        )}
      </div>

      {/* Right: Course card */}
      <Card
        className={`flex-1 mb-2 cursor-pointer hover:border-primary/30 transition-all ${
          status === 'locked' ? 'opacity-60' : 'hover:shadow-md'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-3 flex items-center gap-3">
          <div className="h-12 w-12 relative rounded-lg overflow-hidden shrink-0">
            <Image src={image} alt={title} fill className="object-cover" sizes="48px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-[9px] px-1.5 py-0 ${getDifficultyColor(difficulty)}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {durationHours}h
              </span>
            </div>
          </div>
          {status !== 'locked' && (
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LearningRoadmap() {
  const { user, courses, enrollments, lessonProgress, navigate } = useAppStore();

  // Determine status for each published course
  const roadmapCourses = useMemo(() => {
    return courses
      .filter((c) => c.published)
      .map((course) => ({
        ...course,
        status: getCourseStatus(course.id, enrollments, lessonProgress, user?.id, courses),
      }));
  }, [enrollments, lessonProgress, user?.id]);

  // Calculate progress stats
  const completedCount = roadmapCourses.filter((c) => c.status === 'completed').length;
  const inProgressCount = roadmapCourses.filter((c) => c.status === 'in-progress').length;
  const availableCount = roadmapCourses.filter((c) => c.status === 'available').length;
  const totalCount = roadmapCourses.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Estimated time to finish remaining courses
  const remainingHours = roadmapCourses
    .filter((c) => c.status !== 'completed')
    .reduce((sum, c) => sum + c.durationHours, 0);

  // Recommended next course
  const nextCourse = roadmapCourses.find(
    (c) => c.status === 'in-progress'
  ) || roadmapCourses.find((c) => c.status === 'available');

  const handleCourseClick = (courseId: string, status: CourseStatus) => {
    if (status === 'locked') return;
    navigate('course-detail', courseId);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Map className="h-7 w-7 text-primary" />
          Learning Path
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Your recommended roadmap through the trucking dispatch curriculum
        </p>
      </div>

      {/* Your Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Your Progress
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {completedCount} of {totalCount} courses completed
                {remainingHours > 0 && ` · ~${remainingHours}h remaining`}
              </p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Overall completion</span>
                  <span className="font-medium text-foreground">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
              </div>
            </div>
            <div className="flex gap-3">
              {completedCount > 0 && (
                <div className="text-center px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-500">{completedCount}</p>
                  <p className="text-[10px] text-emerald-600">Completed</p>
                </div>
              )}
              {inProgressCount > 0 && (
                <div className="text-center px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-2xl font-bold text-primary">{inProgressCount}</p>
                  <p className="text-[10px] text-primary">In Progress</p>
                </div>
              )}
              <div className="text-center px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <p className="text-2xl font-bold text-foreground">{availableCount + (user ? 0 : totalCount)}</p>
                <p className="text-[10px] text-muted-foreground">{user ? 'Available' : 'Courses'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop: Horizontal Timeline */}
      <Card className="hidden md:block overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Course Roadmap
          </CardTitle>
          <CardDescription>Follow the path from beginner to advanced dispatch skills</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="relative overflow-x-auto pb-4">
            <div className="flex items-start gap-0 min-w-max px-4">
              {roadmapCourses.map((course, i) => (
                <div key={course.id} className="relative flex-1 min-w-[140px] sm:min-w-[160px]">
                  <RoadmapNode
                    courseId={course.id}
                    title={course.title}
                    category={course.category}
                    difficulty={course.difficulty}
                    image={course.image}
                    status={course.status}
                    index={i}
                    isLast={i === roadmapCourses.length - 1}
                    onClick={() => handleCourseClick(course.id, course.status)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 px-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-primary/30 bg-card" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-muted border border-muted-foreground/20" /> Locked</span>
          </div>
        </CardContent>
      </Card>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden space-y-0">
        <div className="flex items-center gap-2 mb-4">
          <Map className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Course Roadmap</h2>
        </div>
        {roadmapCourses.map((course, i) => (
          <VerticalNode
            key={course.id}
            courseId={course.id}
            title={course.title}
            category={course.category}
            difficulty={course.difficulty}
            image={course.image}
            durationHours={course.durationHours}
            status={course.status}
            index={i}
            isLast={i === roadmapCourses.length - 1}
            onClick={() => handleCourseClick(course.id, course.status)}
          />
        ))}
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Done</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Active</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full border-2 border-primary/30" /> Open</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-muted" /> Locked</span>
        </div>
      </div>

      {/* Recommended Next Card */}
      {nextCourse && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Recommended Next</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Continue your learning journey with this course
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-14 w-20 relative rounded-lg overflow-hidden shrink-0">
                    <Image src={nextCourse.image} alt={nextCourse.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{nextCourse.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{nextCourse.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                        {nextCourse.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {nextCourse.durationHours}h
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <BookOpen className="h-2.5 w-2.5" />
                        {nextCourse.lessons.length} lessons
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0"
                    onClick={() => navigate('course-detail', nextCourse.id)}
                  >
                    {nextCourse.status === 'in-progress' ? 'Continue' : 'Start'}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
