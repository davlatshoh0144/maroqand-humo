import { NextRequest, NextResponse } from 'next/server';
import { shouldUseSupabase } from '@/lib/config/runtime';
import { getBearerToken, getSupabaseUserClient } from '@/lib/supabase/server';

type Row = Record<string, unknown>;

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : 0;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function weekIndex(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function average(values: number[], fallback = 0) {
  return values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : fallback;
}

export async function GET(request: NextRequest) {
  if (!shouldUseSupabase()) {
    return NextResponse.json({ error: 'Production analytics require Supabase.' }, { status: 404 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const authClient = getSupabaseUserClient();
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  const supabase = getSupabaseUserClient(token);
  const [coursesResult, lessonsResult, enrollmentsResult, progressResult, attemptsResult, quizzesResult] =
    await Promise.all([
      supabase.from('courses').select('id,title').eq('published', true),
      supabase.from('lessons').select('id,course_id'),
      supabase.from('enrollments').select('course_id,status').eq('status', 'active'),
      supabase.from('lesson_progress').select('lesson_id,completed,time_spent_seconds,updated_at,completed_at'),
      supabase.from('quiz_attempts').select('quiz_id,score,passed,attempted_at'),
      supabase.from('quizzes').select('id,course_id,title'),
    ]);

  const firstError =
    coursesResult.error ??
    lessonsResult.error ??
    enrollmentsResult.error ??
    progressResult.error ??
    attemptsResult.error ??
    quizzesResult.error;

  if (firstError) {
    return NextResponse.json({ error: 'Could not load analytics.' }, { status: 403 });
  }

  const courses = ((coursesResult.data ?? []) as Row[]).map((row) => ({
    id: stringValue(row.id),
    title: stringValue(row.title),
  }));
  const lessons = ((lessonsResult.data ?? []) as Row[]).map((row) => ({
    id: stringValue(row.id),
    courseId: stringValue(row.course_id),
  }));
  const enrollments = ((enrollmentsResult.data ?? []) as Row[]).map((row) => ({
    courseId: stringValue(row.course_id),
  }));
  const progress = ((progressResult.data ?? []) as Row[]).map((row) => ({
    lessonId: stringValue(row.lesson_id),
    completed: row.completed === true,
    seconds: numberValue(row.time_spent_seconds),
    updatedAt: stringValue(row.completed_at) || stringValue(row.updated_at),
  }));
  const attempts = ((attemptsResult.data ?? []) as Row[]).map((row) => ({
    quizId: stringValue(row.quiz_id),
    score: numberValue(row.score),
    attemptedAt: stringValue(row.attempted_at),
  }));
  const quizzes = ((quizzesResult.data ?? []) as Row[]).map((row) => ({
    id: stringValue(row.id),
    courseId: stringValue(row.course_id),
    title: stringValue(row.title),
  }));

  const lessonsByCourse = new Map<string, string[]>();
  for (const lesson of lessons) {
    lessonsByCourse.set(lesson.courseId, [...(lessonsByCourse.get(lesson.courseId) ?? []), lesson.id]);
  }

  const progressByLesson = new Map(progress.map((item) => [item.lessonId, item]));
  const enrolledCourseIds = new Set(enrollments.map((item) => item.courseId));

  const courseProgress = courses
    .filter((course) => enrolledCourseIds.has(course.id))
    .map((course) => {
      const courseLessonIds = lessonsByCourse.get(course.id) ?? [];
      const completedLessons = courseLessonIds.filter((lessonId) => progressByLesson.get(lessonId)?.completed).length;
      const totalLessons = courseLessonIds.length;

      return {
        courseId: course.id,
        courseName: course.title,
        completedLessons,
        totalLessons,
        percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    });

  const weeklyHours = Array.from({ length: 7 }, () => 0);
  const now = new Date();
  const thisMonth = monthKey(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate);
  let thisMonthSeconds = 0;
  let lastMonthSeconds = 0;
  let thisMonthCompletedLessons = 0;
  let lastMonthCompletedLessons = 0;

  for (const item of progress) {
    const date = item.updatedAt ? new Date(item.updatedAt) : null;
    if (!date || Number.isNaN(date.getTime())) continue;

    const seconds = item.seconds;
    const daysAgo = (now.getTime() - date.getTime()) / 86_400_000;
    if (daysAgo >= 0 && daysAgo < 7) {
      weeklyHours[weekIndex(date)] += seconds / 3600;
    }

    if (monthKey(date) === thisMonth) {
      thisMonthSeconds += seconds;
      if (item.completed) thisMonthCompletedLessons += 1;
    } else if (monthKey(date) === lastMonth) {
      lastMonthSeconds += seconds;
      if (item.completed) lastMonthCompletedLessons += 1;
    }
  }

  const quizById = new Map(quizzes.map((quiz) => [quiz.id, quiz]));
  const scoresFor = (pattern: RegExp) =>
    attempts
      .filter((attempt) => pattern.test(quizById.get(attempt.quizId)?.title ?? ''))
      .map((attempt) => attempt.score);
  const overallScore = average(attempts.map((attempt) => attempt.score), average(courseProgress.map((course) => course.percentComplete), 0));

  const analytics = {
    weeklyProgress: {
      labels: dayLabels,
      hours: weeklyHours.map((hours) => Number(hours.toFixed(1))),
    },
    courseProgress,
    skillAssessment: [
      { skill: 'Broker Communication', score: average(scoresFor(/broker|communication/i), overallScore) },
      { skill: 'Load Board Navigation', score: average(scoresFor(/load/i), overallScore) },
      { skill: 'Rate Calculation', score: average(scoresFor(/rate|rpm|calculation/i), overallScore) },
      { skill: 'Route Planning', score: average(scoresFor(/route|timing|postal|amazon/i), overallScore) },
      { skill: 'Compliance & Safety', score: average(scoresFor(/hos|eld|dot|fmcsa|safety/i), overallScore) },
      { skill: 'Document Preparation', score: average(scoresFor(/document|certificate|paperwork/i), overallScore) },
    ],
    studyStreak: {
      currentStreak: weeklyHours.filter((hours) => hours > 0).length,
      longestStreak: Math.max(weeklyHours.filter((hours) => hours > 0).length, 0),
      thisWeekMinutes: Math.round(weeklyHours.reduce((sum, hours) => sum + hours, 0) * 60),
    },
    learningTrends: {
      thisMonth: {
        hoursLearned: Number((thisMonthSeconds / 3600).toFixed(1)),
        lessonsCompleted: thisMonthCompletedLessons,
        averageDailyHours: Number((thisMonthSeconds / 3600 / Math.max(1, now.getDate())).toFixed(1)),
      },
      lastMonth: {
        hoursLearned: Number((lastMonthSeconds / 3600).toFixed(1)),
        lessonsCompleted: lastMonthCompletedLessons,
        averageDailyHours: Number((lastMonthSeconds / 3600 / 30).toFixed(1)),
      },
    },
  };

  return NextResponse.json(analytics, {
    headers: {
      'Cache-Control': 'private, no-store',
    },
  });
}
