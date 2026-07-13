'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store/app-store';
import { getRoleLabel } from '@/lib/auth/access-control';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Clock,
  Award,
  Flame,
  TrendingUp,
  PlayCircle,
  FileCheck,
  PenTool,
  Star,
  Zap,
  Target,
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Trophy,
  Calendar,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Quote,
  ListChecks,
  Truck,
  Flame as FlameIcon,
} from 'lucide-react';
import { OnboardingModal } from '@/components/academy/shared/onboarding-modal';
import { motion } from 'framer-motion';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Progress ring SVG component */
function ProgressRing({ value, size = 48, strokeWidth = 4, className = '' }: { value: number; size?: number; strokeWidth?: number; className?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary transition-all duration-700"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/** Static LMS metric display */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return <span>{value}{suffix}</span>;
}

/** Weekly streak visual with fire icons */
function WeeklyStreakVisual({ streak }: { streak: number }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const activeDays = Math.min(streak, 7);
  const todayIndex = new Date().getDay();
  const adjustedToday = todayIndex === 0 ? 6 : todayIndex - 1; // Mon=0

  return (
    <div className="flex items-center gap-1">
      {days.map((day, i) => {
        const isActive = i < activeDays;
        const isToday = i === adjustedToday;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
            className={`flex flex-col items-center gap-0.5 ${isToday ? 'scale-110' : ''}`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm'
                  : 'bg-muted/30 text-muted-foreground/50'
              } ${isToday ? 'ring-2 ring-orange-400/40' : ''}`}
            >
              {isActive ? (
                <FlameIcon className="h-3.5 w-3.5" />
              ) : (
                day
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function StudentDashboard() {
  const { user, courses, enrollments, lessonProgress, certificates, navigate } = useAppStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const flag = localStorage.getItem('marokand_onboarding');
      if (flag === 'true') {
        queueMicrotask(() => setShowOnboarding(true));
      }
    }
  }, []);

  if (!user) return null;

  // Compute stats
  const activeEnrollments = enrollments.filter(
    (e) => e.userId === user.id && e.status === 'active'
  );
  const completedLessons = lessonProgress.filter(
    (p) => p.userId === user.id && p.completed
  );
  const userLessonProgress = lessonProgress.filter((p) => p.userId === user.id);
  const totalSecondsSpent = userLessonProgress.reduce((sum, progress) => sum + (progress.timeSpentSeconds ?? 0), 0);
  const hoursLearned = totalSecondsSpent > 0 ? Math.round(totalSecondsSpent / 3600) : Math.round(completedLessons.length * 0.75);
  const userCerts = certificates.filter((c) => c.userId === user.id);
  const lastActivity = userLessonProgress
    .filter((progress) => progress.updatedAt || progress.completedAt)
    .sort((a, b) => new Date(b.updatedAt || b.completedAt || 0).getTime() - new Date(a.updatedAt || a.completedAt || 0).getTime())[0];
  const streak = (() => {
    const activityDates = new Set(
      userLessonProgress
        .filter((progress) => progress.updatedAt || progress.completedAt)
        .map((progress) => new Date(progress.updatedAt || progress.completedAt || '').toDateString())
    );
    let count = 0;
    const cursor = new Date();
    while (activityDates.has(cursor.toDateString())) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  // Continue Learning — enrolled courses with progress
  const enrolledCourses = activeEnrollments
    .map((enrollment) => {
      const course = courses.find((c) => c.id === enrollment.courseId);
      if (!course) return null;
      const courseLessons = course.lessons;
      const completed = courseLessons.filter((l) =>
        lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user.id)
      ).length;
      const progress = courseLessons.length > 0 ? Math.round((completed / courseLessons.length) * 100) : 0;
      return { course, enrollment, completed, total: courseLessons.length, progress };
    })
    .filter(Boolean) as { course: typeof courses[0]; enrollment: typeof enrollments[0]; completed: number; total: number; progress: number }[];

  const hasEnrollments = enrolledCourses.length > 0;

  // Find recommended next lesson
  const recommendedNext = (() => {
    for (const item of enrolledCourses) {
      const nextLesson = item.course.lessons.find((l) =>
        !lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user.id)
      );
      if (nextLesson) {
        return { course: item.course, lesson: nextLesson, progress: item.progress };
      }
    }
    const firstCourse = courses[0];
    if (firstCourse) {
      const freeLesson = firstCourse.lessons.find((l) => l.isFree);
      if (freeLesson) {
        return { course: firstCourse, lesson: freeLesson, progress: 0 };
      }
    }
    return null;
  })();

  // Estimated time to complete for recommended next
  const estimatedTimeToComplete = recommendedNext
    ? (() => {
        const course = recommendedNext.course;
        const totalLessons = course.lessons.length;
        const completedCount = course.lessons.filter((l) =>
          lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user.id)
        ).length;
        const remaining = totalLessons - completedCount;
        const avgMinutesPerLesson = course.durationHours * 60 / totalLessons;
        const totalRemainingMinutes = Math.round(remaining * avgMinutesPerLesson);
        if (totalRemainingMinutes < 60) return `${totalRemainingMinutes}m`;
        const hrs = Math.floor(totalRemainingMinutes / 60);
        const mins = totalRemainingMinutes % 60;
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
      })()
    : null;

  // Weekly activity data
  const weeklyActivity = [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 2.0 },
    { day: 'Wed', hours: 0.5 },
    { day: 'Thu', hours: 1.8 },
    { day: 'Fri', hours: 2.5 },
    { day: 'Sat', hours: 1.0 },
    { day: 'Sun', hours: 0.3 },
  ];
  const maxHours = Math.max(...weeklyActivity.map((d) => d.hours));
  const totalWeeklyHours = weeklyActivity.reduce((a, b) => a + b.hours, 0);
  const weeklyGoal = 10;
  const weeklyProgress = Math.min(100, Math.round((totalWeeklyHours / weeklyGoal) * 100));

  // Recent activity - 5 items with color types for timeline
  const recentActivity = [
    { action: 'Completed lesson', detail: 'Introduction to Freight Dispatching', time: '2 hours ago', icon: FileCheck, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', dotColor: 'bg-emerald-500' },
    { action: 'Started quiz', detail: 'HOS Regulations Quiz', time: '5 hours ago', icon: PenTool, color: 'text-primary', bgColor: 'bg-primary/10', dotColor: 'bg-primary' },
    { action: 'Earned badge', detail: 'First Lesson Complete', time: '1 day ago', icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-500' },
    { action: 'Enrolled in course', detail: 'Load Board Training', time: '2 days ago', icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-500/10', dotColor: 'bg-blue-500' },
    { action: 'Completed practice', detail: 'Broker Mail Exercise', time: '3 days ago', icon: Trophy, color: 'text-purple-500', bgColor: 'bg-purple-500/10', dotColor: 'bg-purple-500' },
  ];

  // Achievement data
  const xp = completedLessons.length * 120 + 350;
  const level = Math.floor(xp / 500) + 1;
  const xpForNext = (level) * 500;
  const xpProgress = Math.round(((xp % 500) / 500) * 100);

  const handleNavigate = (view: Parameters<typeof navigate>[0], id?: string) => {
    navigate(view, id);
  };

  // Stats with motivational text for zero values
  const stats = [
    {
      icon: BookOpen,
      value: activeEnrollments.length,
      label: 'Courses Enrolled',
      zeroText: 'Your journey starts here',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      zeroIconBg: 'bg-muted/50',
      zeroIconColor: 'text-muted-foreground/50',
      gradientFrom: 'from-primary/5',
      gradientTo: 'to-primary/10',
    },
    {
      icon: Clock,
      value: hoursLearned,
      suffix: 'h',
      label: 'Hours Learned',
      zeroText: 'Ready to begin',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      zeroIconBg: 'bg-muted/50',
      zeroIconColor: 'text-muted-foreground/50',
      gradientFrom: 'from-emerald-500/5',
      gradientTo: 'to-emerald-500/10',
    },
    {
      icon: Award,
      value: userCerts.length,
      label: 'Certificates',
      zeroText: 'Earn your first',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      zeroIconBg: 'bg-muted/50',
      zeroIconColor: 'text-muted-foreground/50',
      gradientFrom: 'from-amber-500/5',
      gradientTo: 'to-amber-500/10',
    },
    {
      icon: Flame,
      value: streak,
      label: 'Active Days',
      zeroText: 'Start today!',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      zeroIconBg: 'bg-muted/50',
      zeroIconColor: 'text-muted-foreground/50',
      gradientFrom: 'from-orange-500/5',
      gradientTo: 'to-orange-500/10',
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: PlayCircle, label: 'Continue Learning', view: 'courses' as const, color: 'text-primary', bgHover: 'hover:bg-primary/15', borderHover: 'hover:border-primary/30' },
    { icon: PenTool, label: 'Practice', view: 'practice' as const, color: 'text-emerald-500', bgHover: 'hover:bg-emerald-500/15', borderHover: 'hover:border-emerald-500/30' },
    { icon: Award, label: 'Certificates', view: 'certificates' as const, color: 'text-amber-500', bgHover: 'hover:bg-amber-500/15', borderHover: 'hover:border-amber-500/30' },
    { icon: HelpCircle, label: 'Ask a Question', view: 'discussions' as const, color: 'text-blue-500', bgHover: 'hover:bg-blue-500/15', borderHover: 'hover:border-blue-500/30' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          localStorage.removeItem('marokand_onboarding');
        }}
      />

      {/* Header with role switcher and streak */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            {getGreeting()}, {user.name}
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5 text-sm px-3 py-1">
              <Clock className="h-4 w-4" />
              Activity Logged
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasEnrollments ? 'Continue your journey to mastering truck dispatch' : 'Welcome! Start exploring our courses today'}
            {lastActivity && (
              <span className="block text-xs">
                Last activity: {new Date(lastActivity.updatedAt || lastActivity.completedAt || '').toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-2 px-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Signed in as</span>
              <Badge variant="secondary" className="text-xs">{getRoleLabel(user.role)}</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions - icon buttons row */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.05 }}
      >
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
            >
              <Button
                variant="outline"
                className={`gap-2 h-10 transition-all stat-card-gradient-border ${action.borderHover} ${action.bgHover}`}
                onClick={() => handleNavigate(action.view)}
              >
                <action.icon className={`h-4 w-4 ${action.color}`} />
                <span className="text-sm">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommended Next - with progress ring */}
      {recommendedNext && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent cursor-pointer hover:border-primary/40 transition-all group hover-lift"
            onClick={() => navigate('lesson', recommendedNext.course.id, recommendedNext.lesson.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <ProgressRing value={recommendedNext.progress} size={56} strokeWidth={4} className="text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">Recommended Next</p>
                  <p className="font-semibold text-foreground mt-0.5">{recommendedNext.lesson.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {recommendedNext.course.title} · {recommendedNext.lesson.durationMin} min
                  </p>
                  {/* Progress bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-medium text-primary">{recommendedNext.progress}%</span>
                    </div>
                    <Progress value={recommendedNext.progress} className="h-2" />
                  </div>
                  {/* Estimated time */}
                  {estimatedTimeToComplete && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ~{estimatedTimeToComplete} remaining
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {recommendedNext.lesson.isFree ? 'Free lesson' : 'Premium'}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-2 pt-1">
                  <Button size="sm" className="gap-1.5">
                    <PlayCircle className="h-3.5 w-3.5" /> Continue
                  </Button>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const isZero = stat.value === 0;
          return (
            <Card key={stat.label} className={`stat-card-gradient-border relative overflow-hidden ${isZero ? 'opacity-80' : ''} bg-gradient-to-br ${isZero ? '' : `${stat.gradientFrom} ${stat.gradientTo}`} transition-all`}>
              <CardContent className="pt-6">
                {/* Watermark icon in background */}
                <div className="watermark-icon">
                  <stat.icon className="h-20 w-20" />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isZero ? stat.zeroIconBg : stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${isZero ? stat.zeroIconColor : stat.iconColor}`} />
                  </div>
                  <div>
                    {isZero ? (
                      <>
                        <p className="text-sm font-medium text-muted-foreground/70">{stat.zeroText}</p>
                        <p className="text-xs text-muted-foreground/50">{stat.label}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-foreground">
                          <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                        </p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </>
                    )}
                  </div>
                </div>
                {/* Mini progress donut for non-zero stats */}
                {!isZero && (
                  <div className="absolute right-3 bottom-3">
                    <ProgressRing value={Math.min((stat.value / (stat.label === 'Active Days' ? 30 : stat.value + 5)) * 100, 100)} size={36} strokeWidth={3} className="text-primary/40" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Weekly Goal & Learning Milestones Row */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Weekly Goal Tracker */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-primary" />
              Weekly Goal
            </CardTitle>
            <CardDescription>{totalWeeklyHours.toFixed(1)} of {weeklyGoal} hours this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Ring */}
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - weeklyProgress / 100)}`}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{weeklyProgress}%</span>
                    <span className="text-[10px] text-muted-foreground">of goal</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {weeklyProgress >= 100 ? (
                    <span className="text-emerald-500 font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Goal reached!
                    </span>
                  ) : (
                    <>{(weeklyGoal - totalWeeklyHours).toFixed(1)}h left to reach your goal</>
                  )}
                </p>
              </div>
              {/* Daily breakdown */}
              <div className="space-y-1.5">
                {weeklyActivity.map((day) => (
                  <div key={day.day} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-muted-foreground font-medium">{day.day}</span>
                    <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all"
                        style={{ width: `${(day.hours / weeklyGoal) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{day.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Milestones */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Zap className="h-5 w-5 text-primary" />
              Learning Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                <Zap className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{xp} pts</p>
                  <p className="text-xs text-muted-foreground">Training points</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2">
                <Target className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Milestone {level}</p>
                  <p className="text-xs text-muted-foreground">{xpForNext - xp} pts to next</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-4 py-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">{streak} active days</p>
                  <p className="text-xs text-muted-foreground">Recent activity</p>
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Milestone {level}</span>
                  <span>Milestone {level + 1}</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
              </div>
            </div>

            {/* Learning records earned */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-3">Records Earned</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-emerald-500/5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-xs font-medium text-foreground">First Steps</p>
                    <p className="text-[10px] text-muted-foreground">Complete 1 lesson</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-amber-500/5">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-medium text-foreground">5-Day Attendance</p>
                    <p className="text-[10px] text-muted-foreground">Learn 5 days in a row</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-primary/5">
                  <PenTool className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Practice Makes Perfect</p>
                    <p className="text-[10px] text-muted-foreground">Complete a practice module</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Continue Learning / Start Your Journey */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <PlayCircle className="h-5 w-5 text-primary" />
            {hasEnrollments ? 'Continue Learning' : 'Start Your Journey'}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => handleNavigate('courses')}>
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {hasEnrollments ? (
          /* Enrolled courses grid with progress rings */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((item) => (
              <Card
                key={item.course.id}
                className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md overflow-hidden hover-lift"
                onClick={() => handleNavigate('course-detail', item.course.id)}
              >
                {/* Course Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={item.course.image}
                    alt={item.course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge variant="secondary" className="absolute top-2 left-2 bg-background/90 text-xs backdrop-blur-sm">
                    {item.course.category}
                  </Badge>
                  {/* Progress overlay */}
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1 bg-black/20">
                      <div className="h-full bg-primary/80 transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors text-foreground">{item.course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.course.subtitle}
                      </p>
                    </div>
                    {/* Progress ring instead of plain bar */}
                    <div className="relative flex-shrink-0">
                      <ProgressRing value={item.progress} size={40} strokeWidth={3} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-primary">{item.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.completed} of {item.total} lessons</span>
                      <span className="font-medium">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.course.durationHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {item.course.lessons.length} lessons
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 group-hover:text-primary">
                      Continue <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State - Engaging CTA */
          <div className="space-y-6">
            {/* Hero empty card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent overflow-hidden">
              <CardContent className="py-10 px-6 sm:px-10">
                <div className="flex flex-col items-center text-center max-w-lg mx-auto space-y-5">
                  {/* Graduation cap illustration */}
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                      <GraduationCap className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20">
                      <BookOpen className="h-4 w-4 text-amber-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Start Your Learning Journey</h3>
                    <p className="text-muted-foreground text-base">
                      Begin with a free lesson from any of our courses. No credit card required.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button size="lg" onClick={() => handleNavigate('courses')} className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Browse Courses
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => {
                      const firstCourse = courses[0];
                      if (firstCourse) {
                        const freeLesson = firstCourse.lessons.find((l) => l.isFree);
                        if (freeLesson) {
                          navigate('lesson', firstCourse.id, freeLesson.id);
                        } else {
                          handleNavigate('courses');
                        }
                      }
                    }} className="gap-2">
                      <PlayCircle className="h-4 w-4" />
                      View Free Lessons
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured course cards with Start Free Lesson buttons */}
            <div>
              <h3 className="text-base font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Featured Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {courses.slice(0, 3).map((course) => {
                  const freeLesson = course.lessons.find((l) => l.isFree);
                  return (
                    <Card
                      key={course.id}
                      className="group hover:border-primary/30 transition-all hover:shadow-md overflow-hidden"
                    >
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <Badge variant="secondary" className="absolute top-2 left-2 bg-background/90 text-xs backdrop-blur-sm">
                          {course.category}
                        </Badge>
                        {freeLesson && (
                          <Badge className="absolute top-2 right-2 bg-emerald-500/90 text-white text-xs backdrop-blur-sm">
                            Free lesson available
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{course.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{course.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.durationHours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.lessons.length} lessons
                          </span>
                        </div>
                        {freeLesson && (
                          <Button
                            size="sm"
                            className="w-full gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('lesson', course.id, freeLesson.id);
                            }}
                          >
                            <PlayCircle className="h-4 w-4" />
                            Start Free Lesson
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Motivational Quote & Today's Goals */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.27 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Motivational Quote */}
        <Card className="quote-gradient overflow-hidden relative">
          <CardContent className="pt-6">
            <Quote className="h-8 w-8 text-primary/20 mb-3" />
            <p className="text-lg font-medium text-foreground leading-relaxed italic">
              &ldquo;The road to success is always under construction. Every load you dispatch, every route you plan, builds your expertise.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Marokand Humo Academy</p>
                <p className="text-xs text-muted-foreground">Daily Inspiration</p>
              </div>
            </div>
            {/* Decorative gradient blob */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </CardContent>
        </Card>

        {/* Today's Goals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <ListChecks className="h-5 w-5 text-primary" />
              Today&apos;s Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'g1', text: 'Complete 1 lesson', checked: true },
                { id: 'g2', text: 'Practice broker email scenario', checked: true },
                { id: 'g3', text: 'Review HOS regulations', checked: false },
                { id: 'g4', text: '30 min study session', checked: false },
              ].map((goal) => (
                <label key={goal.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked={goal.checked}
                    className="goal-checkbox"
                  />
                  <span className={`text-sm transition-colors ${goal.checked ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary'}`}>
                    {goal.text}
                  </span>
                </label>
              ))}
              <div className="mt-4 pt-3 border-t">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progress</span>
                  <span className="font-medium text-primary">2 of 4</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80" style={{ width: '50%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Milestones Row */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.28 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Trophy className="h-5 w-5 text-amber-500" />
            Recent Milestones
          </h2>
          <Button variant="ghost" size="sm" onClick={() => handleNavigate('achievements')} className="gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            { icon: CheckCircle2, name: 'First Steps', desc: 'Complete 1 lesson', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { icon: Flame, name: '5-Day Attendance', desc: 'Learn 5 days in a row', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { icon: PenTool, name: 'Practice Pro', desc: 'Complete practice module', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            { icon: BookOpen, name: 'Bookworm', desc: '10 lessons completed', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { icon: Zap, name: 'Quick Learner', desc: 'Finish lesson under 10m', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
          ].map((badge, i) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`flex-shrink-0 flex items-center gap-3 rounded-xl border ${badge.border} ${badge.bg} px-4 py-3 hover:scale-105 transition-transform cursor-default`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${badge.bg}`}>
                <badge.icon className={`h-5 w-5 ${badge.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Activity Chart & Recent Activity Timeline */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Weekly Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Hours spent learning this week · {totalWeeklyHours.toFixed(1)}h total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 sm:gap-3 h-44">
              {weeklyActivity.map((day, i) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-foreground">{day.hours}h</span>
                  <div className="w-full relative rounded-t-sm" style={{ height: '120px' }}>
                    <motion.div
                      className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary/10 transition-all"
                      style={{ height: `${(day.hours / maxHours) * 100}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                    >
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-primary to-primary/80"
                        style={{ height: '65%' }}
                      />
                    </motion.div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Timeline with colored dots and connecting lines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your last 5 learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 relative pb-4 last:pb-0">
                  {/* Timeline connector line */}
                  {i < recentActivity.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border/50" />
                  )}
                  {/* Colored dot */}
                  <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${activity.bgColor} ring-2 ring-background`}>
                    <div className={`h-2 w-2 rounded-full ${activity.dotColor}`} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions - Full Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md overflow-hidden border-l-4 border-l-primary hover-lift"
            onClick={() => handleNavigate('courses')}
          >
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold group-hover:text-primary transition-colors text-foreground">Browse Courses</p>
                  <p className="text-xs text-muted-foreground">Explore new topics</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
          <Card
            className="group cursor-pointer hover:border-amber-500/50 transition-all hover:shadow-md overflow-hidden border-l-4 border-l-amber-500 hover-lift"
            onClick={() => handleNavigate('certificates')}
          >
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold group-hover:text-amber-500 transition-colors text-foreground">View Certificates</p>
                  <p className="text-xs text-muted-foreground">Your achievements</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </div>
            </CardContent>
          </Card>
          <Card
            className="group cursor-pointer hover:border-emerald-500/50 transition-all hover:shadow-md overflow-hidden border-l-4 border-l-emerald-500 hover-lift"
            onClick={() => handleNavigate('practice')}
          >
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <PenTool className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold group-hover:text-emerald-500 transition-colors text-foreground">Practice Assignments</p>
                  <p className="text-xs text-muted-foreground">Sharpen your skills</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
