import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Assignment, Course, Enrollment, PricingPlan, Quiz } from '@/lib/types';
import { applyLessonVideoFallbacks } from '@/lib/data/lesson-videos';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';
import {
  mapAssignment,
  mapCourse,
  mapEnrollment,
  mapLesson,
  mapPricingPlan,
  mapQuiz,
  type Row,
} from '@/lib/repositories/mappers';

export interface LmsCatalog {
  courses: Course[];
  assignments: Assignment[];
  quizzes: Quiz[];
  pricingPlans: PricingPlan[];
}

export const courseRepository = {
  async listPublishedCourses(): Promise<RepositoryResult<Course[]>> {
    return guarded(async () => {
      const { data: courseRows, error: courseError } = await getSupabaseBrowserClient()
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (courseError) return fail('PERMISSION_DENIED', courseError.message, courseError);

      const courseIds = ((courseRows ?? []) as Row[]).map((row) => String(row.id));
      const { data: lessonRows, error: lessonError } = courseIds.length
        ? await getSupabaseBrowserClient()
            .from('lessons')
            .select('*')
            .in('course_id', courseIds)
            .order('order_index', { ascending: true })
        : { data: [], error: null };

      if (lessonError) return fail('PERMISSION_DENIED', lessonError.message, lessonError);

      const lessonsByCourse = new Map<string, ReturnType<typeof mapLesson>[]>();
      for (const row of (lessonRows ?? []) as Row[]) {
        const lesson = mapLesson(row);
        lessonsByCourse.set(lesson.courseId, [...(lessonsByCourse.get(lesson.courseId) ?? []), lesson]);
      }

      const courses = ((courseRows ?? []) as Row[]).map((row) =>
        mapCourse(row, lessonsByCourse.get(String(row.id)) ?? [])
      );

      return ok(applyLessonVideoFallbacks(courses));
    });
  },

  async listAssignments(): Promise<RepositoryResult<Assignment[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('assignments')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapAssignment));
    });
  },

  async listQuizzes(): Promise<RepositoryResult<Quiz[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('quizzes')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapQuiz));
    });
  },

  async listPricingPlans(): Promise<RepositoryResult<PricingPlan[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapPricingPlan));
    });
  },

  async listLmsCatalog(): Promise<RepositoryResult<LmsCatalog>> {
    return guarded(async () => {
      const [courses, assignments, quizzes, pricingPlans] = await Promise.all([
        courseRepository.listPublishedCourses(),
        courseRepository.listAssignments(),
        courseRepository.listQuizzes(),
        courseRepository.listPricingPlans(),
      ]);

      if (courses.error) return courses;

      return ok({
        courses: courses.data,
        assignments: assignments.data ?? [],
        quizzes: quizzes.data ?? [],
        pricingPlans: pricingPlans.data ?? [],
      });
    });
  },

  async listEnrollments(): Promise<RepositoryResult<Enrollment[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapEnrollment));
    });
  },

  async enroll(courseId: string): Promise<RepositoryResult<Enrollment>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .from('enrollments')
        .upsert({ user_id: userId, course_id: courseId, status: 'active' }, { onConflict: 'user_id,course_id' })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapEnrollment(data as Row));
    });
  },

  async assignCourse(userId: string, courseId: string): Promise<RepositoryResult<Enrollment>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('enrollments')
        .upsert({ user_id: userId, course_id: courseId, status: 'active' }, { onConflict: 'user_id,course_id' })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapEnrollment(data as Row));
    });
  },

  async dropCourse(courseId: string): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return fail('AUTH_ERROR', 'Authentication required.');

      const { error } = await getSupabaseBrowserClient()
        .from('enrollments')
        .update({ status: 'dropped' })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(true);
    });
  },
};
