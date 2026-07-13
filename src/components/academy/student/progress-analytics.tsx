'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Flame,
  TrendingUp,
  TrendingDown,
  Award,
  CalendarDays,
  BarChart3,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { shouldUseSupabase } from '@/lib/config/runtime';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AnalyticsData {
  weeklyProgress: {
    labels: string[];
    hours: number[];
  };
  courseProgress: {
    courseId: string;
    courseName: string;
    completedLessons: number;
    totalLessons: number;
    percentComplete: number;
  }[];
  skillAssessment: {
    skill: string;
    score: number;
  }[];
  studyStreak: {
    currentStreak: number;
    longestStreak: number;
    thisWeekMinutes: number;
  };
  learningTrends: {
    thisMonth: {
      hoursLearned: number;
      lessonsCompleted: number;
      averageDailyHours: number;
    };
    lastMonth: {
      hoursLearned: number;
      lessonsCompleted: number;
      averageDailyHours: number;
    };
  };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function getSkillColor(score: number): string {
  if (score > 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function getSkillBarColor(score: number): string {
  if (score > 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function getSkillBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score > 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
}

export function ProgressAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const headers: Record<string, string> = {};
        if (shouldUseSupabase()) {
          const { data } = await getSupabaseBrowserClient().auth.getSession();
          if (data.session?.access_token) {
            headers.Authorization = `Bearer ${data.session.access_token}`;
          }
        }

        const res = await fetch('/api/analytics/progress', { headers });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
      </div>
    );
  }

  const totalWeeklyHours = data.weeklyProgress.hours.reduce((a, b) => a + b, 0);
  const avgDailyHours = totalWeeklyHours / 7;
  const maxHours = Math.max(...data.weeklyProgress.hours);

  const hoursChange = data.learningTrends.thisMonth.hoursLearned - data.learningTrends.lastMonth.hoursLearned;
  const lessonsChange = data.learningTrends.thisMonth.lessonsCompleted - data.learningTrends.lastMonth.lessonsCompleted;
  const avgChange = data.learningTrends.thisMonth.averageDailyHours - data.learningTrends.lastMonth.averageDailyHours;
  const hoursChangePercent = data.learningTrends.lastMonth.hoursLearned > 0
    ? ((hoursChange / data.learningTrends.lastMonth.hoursLearned) * 100).toFixed(1)
    : '0.0';
  const trendHoursDenominator = Math.max(
    data.learningTrends.thisMonth.hoursLearned,
    data.learningTrends.lastMonth.hoursLearned,
    1
  );

  return (
    <motion.div
      className="p-4 md:p-6 lg:p-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Progress Analytics</h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Track your learning progress, skills, and study habits
        </p>
      </motion.div>

      {/* Study Statistics Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Hours</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{data.learningTrends.thisMonth.hoursLearned}h</p>
              <div className="flex items-center gap-1 mt-1">
                {hoursChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${hoursChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {hoursChange >= 0 ? '+' : ''}{hoursChangePercent}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. Daily</span>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{avgDailyHours.toFixed(1)}h</p>
              <div className="flex items-center gap-1 mt-1">
                {avgChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${avgChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(1)}h
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">{data.studyStreak.currentStreak} days</p>
              <div className="flex items-center gap-1 mt-1">
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-muted-foreground">
                  Best: {data.studyStreak.longestStreak} days
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">This Week</span>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{Math.round(data.studyStreak.thisWeekMinutes / 60)}h {data.studyStreak.thisWeekMinutes % 60}m</p>
              <div className="flex items-center gap-1 mt-1">
                <Award className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {data.learningTrends.thisMonth.lessonsCompleted} lessons this month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Weekly Activity</CardTitle>
              </div>
              <CardDescription>
                {totalWeeklyHours.toFixed(1)} hours this week &middot; Avg {avgDailyHours.toFixed(1)}h/day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-48">
                {data.weeklyProgress.labels.map((day, i) => {
                  const hours = data.weeklyProgress.hours[i];
                  const heightPercent = maxHours > 0 ? (hours / maxHours) * 100 : 0;
                  const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);

                  return (
                    <div key={day} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-xs font-medium text-foreground">
                        {hours}h
                      </span>
                      <div className="w-full relative flex-1 flex items-end">
                        <motion.div
                          className={`w-full rounded-t-md ${
                            isToday
                              ? 'bg-primary'
                              : 'bg-primary/40 dark:bg-primary/30'
                          }`}
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          isToday ? 'font-bold text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Trends */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Learning Trends</CardTitle>
              </div>
              <CardDescription>Month-over-month comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Hours Learned */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Hours Learned</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{data.learningTrends.thisMonth.hoursLearned}h</span>
                    <Badge variant={hoursChange >= 0 ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                      {hoursChange >= 0 ? '+' : ''}{hoursChange.toFixed(1)}h
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 h-6">
                  <motion.div
                    className="bg-primary/30 rounded-l-md"
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.learningTrends.lastMonth.hoursLearned / trendHoursDenominator) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                  <motion.div
                    className="bg-primary rounded-r-md"
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.learningTrends.thisMonth.hoursLearned / trendHoursDenominator) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">Last: {data.learningTrends.lastMonth.hoursLearned}h</span>
                  <span className="text-[10px] text-muted-foreground">This: {data.learningTrends.thisMonth.hoursLearned}h</span>
                </div>
              </div>

              {/* Lessons Completed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Lessons Completed</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{data.learningTrends.thisMonth.lessonsCompleted}</span>
                    <Badge variant={lessonsChange >= 0 ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                      {lessonsChange >= 0 ? '+' : ''}{lessonsChange}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={Math.min((data.learningTrends.thisMonth.lessonsCompleted / 30) * 100, 100)}
                  className="h-2"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">Last: {data.learningTrends.lastMonth.lessonsCompleted}</span>
                  <span className="text-[10px] text-muted-foreground">This: {data.learningTrends.thisMonth.lessonsCompleted}</span>
                </div>
              </div>

              {/* Average Daily Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Avg. Daily Hours</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{data.learningTrends.thisMonth.averageDailyHours}h</span>
                    <Badge variant={avgChange >= 0 ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                      {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(1)}h
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={Math.min((data.learningTrends.thisMonth.averageDailyHours / 3) * 100, 100)}
                  className="h-2"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">Last: {data.learningTrends.lastMonth.averageDailyHours}h</span>
                  <span className="text-[10px] text-muted-foreground">This: {data.learningTrends.thisMonth.averageDailyHours}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Course Progress Breakdown */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Course Progress</CardTitle>
            </div>
            <CardDescription>
              {data.courseProgress.length} courses enrolled &middot;{' '}
              {data.courseProgress.filter(c => c.percentComplete === 100).length} completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.courseProgress.map((course, i) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{course.courseName}</span>
                    {course.percentComplete === 100 && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500 hover:bg-emerald-600">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {course.completedLessons}/{course.totalLessons} lessons
                    </span>
                    <span className="text-sm font-semibold min-w-[3rem] text-right">
                      {course.percentComplete}%
                    </span>
                  </div>
                </div>
                <Progress value={course.percentComplete} className="h-2" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Skill Assessment */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Skill Assessment</CardTitle>
            </div>
            <CardDescription>
              Your proficiency across key dispatching competencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.skillAssessment.map((skill, i) => (
                <motion.div
                  key={skill.skill}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{skill.skill}</span>
                    <span className={`text-sm font-bold ${getSkillColor(skill.score)}`}>
                      {skill.score}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${getSkillBarColor(skill.score)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={getSkillBadgeVariant(skill.score)}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {skill.score > 80 ? 'Strong' : skill.score >= 60 ? 'Developing' : 'Needs Work'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Skill Legend */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Strong (&gt;80%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Developing (60-80%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Needs Work (&lt;60%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak & Motivational Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10">
                <Flame className="h-10 w-10 text-orange-500" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold mb-1">
                  {data.studyStreak.currentStreak}-Day Streak! 🔥
                </h3>
                <p className="text-muted-foreground text-sm">
                  You&apos;re on fire! Keep up the daily learning habit. Your longest streak is{' '}
                  <span className="font-semibold text-foreground">{data.studyStreak.longestStreak} days</span>.
                  {data.studyStreak.currentStreak >= data.studyStreak.longestStreak - 2 && data.studyStreak.currentStreak < data.studyStreak.longestStreak && (
                    <span className="text-primary font-medium">
                      {' '}Only {data.studyStreak.longestStreak - data.studyStreak.currentStreak} more days to beat your record!
                    </span>
                  )}
                  {data.studyStreak.currentStreak >= data.studyStreak.longestStreak && (
                    <span className="text-primary font-medium">
                      {' '}You&apos;ve matched your record!
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-extrabold text-primary">{data.studyStreak.currentStreak}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Day Streak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
