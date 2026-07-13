import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  ManagedAssignmentDraft,
  ManagedCourseDraft,
  ManagedLessonDraft,
  ManagedLessonResource,
  ManagedQuizDraft,
} from '@/lib/types';
import { authRepository } from '@/lib/repositories/auth-repository';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';
import { mapManagedCourse, type Row } from '@/lib/repositories/mappers';

export const teacherRepository = {
  async listManagedCourses(): Promise<RepositoryResult<ManagedCourseDraft[]>> {
    return guarded(async () => {
      const { data: courses, error } = await getSupabaseBrowserClient()
        .from('courses')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);

      const courseIds = ((courses ?? []) as Row[]).map((row) => String(row.id));
      const { data: lessons, error: lessonError } = courseIds.length
        ? await getSupabaseBrowserClient()
            .from('lessons')
            .select('*')
            .in('course_id', courseIds)
            .order('order_index', { ascending: true })
        : { data: [], error: null };

      if (lessonError) return fail('PERMISSION_DENIED', lessonError.message, lessonError);

      const lessonsByCourse = new Map<string, Row[]>();
      for (const lesson of (lessons ?? []) as Row[]) {
        const courseId = String(lesson.course_id);
        lessonsByCourse.set(courseId, [...(lessonsByCourse.get(courseId) ?? []), lesson]);
      }

      return ok(((courses ?? []) as Row[]).map((row) => mapManagedCourse(row, lessonsByCourse.get(String(row.id)) ?? [])));
    });
  },

  async createCourse(draft: Pick<ManagedCourseDraft, 'title' | 'description'>): Promise<RepositoryResult<ManagedCourseDraft>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const instructorId = sessionData.session?.user.id;
      if (!instructorId) return fail('AUTH_ERROR', 'Authentication required.');

      const slug = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`;
      const { data, error } = await getSupabaseBrowserClient()
        .from('courses')
        .insert({
          title: draft.title,
          slug,
          subtitle: draft.description,
          description: draft.description,
          instructor_id: instructorId,
          instructor_name: '',
          published: false,
        })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('course_created', { course_id: data.id });
      return ok(mapManagedCourse(data as Row));
    });
  },

  async updateCourse(courseId: string, updates: Partial<Pick<ManagedCourseDraft, 'title' | 'description' | 'status'>>): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { error } = await getSupabaseBrowserClient()
        .from('courses')
        .update({
          title: updates.title,
          subtitle: updates.description,
          description: updates.description,
          published: updates.status ? updates.status === 'published' : undefined,
        })
        .eq('id', courseId);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('course_edited', { course_id: courseId });
      return ok(true);
    });
  },

  async addLesson(courseId: string, lesson: { title: string; content: string; fileName?: string; durationMin?: number }): Promise<RepositoryResult<ManagedLessonDraft>> {
    return guarded(async () => {
      const { count } = await getSupabaseBrowserClient()
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId);

      const { data, error } = await getSupabaseBrowserClient()
        .from('lessons')
        .insert({
          course_id: courseId,
          order_index: (count ?? 0) + 1,
          title: lesson.title,
          description: lesson.fileName ?? '',
          content: lesson.content,
          duration_min: lesson.durationMin ?? 30,
          is_required: true,
          resources: [],
        })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('lesson_edited', { course_id: courseId, lesson_id: data.id });
      return ok({
        id: String(data.id),
        title: String(data.title),
        content: String(data.content),
        fileName: lesson.fileName,
        durationMin: Number(data.duration_min ?? 30),
        duration: `${Number(data.duration_min ?? 30)} min`,
        type: 'reading',
        published: false,
        resources: [],
      });
    });
  },

  async updateLesson(courseId: string, lessonId: string, updates: Partial<ManagedLessonDraft>): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { error } = await getSupabaseBrowserClient()
        .from('lessons')
        .update({
          title: updates.title,
          content: updates.content,
          duration_min: updates.durationMin,
          resources: updates.resources,
        })
        .eq('id', lessonId);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('lesson_edited', { course_id: courseId, lesson_id: lessonId });
      return ok(true);
    });
  },

  async addResource(courseId: string, lessonId: string, resource: ManagedLessonResource): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { data: lesson, error: readError } = await getSupabaseBrowserClient()
        .from('lessons')
        .select('resources')
        .eq('id', lessonId)
        .single();

      if (readError) return fail('PERMISSION_DENIED', readError.message, readError);
      const resources = Array.isArray(lesson.resources) ? lesson.resources : [];
      const { error } = await getSupabaseBrowserClient()
        .from('lessons')
        .update({ resources: [...resources, resource] })
        .eq('id', lessonId);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('lesson_resource_uploaded', { course_id: courseId, lesson_id: lessonId });
      return ok(true);
    });
  },

  async upsertQuiz(courseId: string, lessonId: string, quiz: ManagedQuizDraft): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { error } = await getSupabaseBrowserClient()
        .from('quizzes')
        .upsert({
          id: quiz.id,
          course_id: courseId,
          lesson_id: lessonId,
          title: quiz.title,
          passing_score: quiz.passingScore,
          questions: quiz.questions,
          published: quiz.published,
        });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('quiz_saved', { course_id: courseId, lesson_id: lessonId, quiz_id: quiz.id });
      return ok(true);
    });
  },

  async upsertAssignment(courseId: string, lessonId: string, assignment: ManagedAssignmentDraft): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { error } = await getSupabaseBrowserClient()
        .from('assignments')
        .upsert({
          id: assignment.id,
          course_id: courseId,
          lesson_id: lessonId,
          title: assignment.title,
          description: assignment.description,
          instructions: assignment.instructions,
          scenario: assignment.description,
          rubric: [],
          type: 'scenario',
          difficulty: 'beginner',
          published: assignment.published,
          due_date: assignment.dueDate,
        });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('assignment_saved', { course_id: courseId, lesson_id: lessonId, assignment_id: assignment.id });
      return ok(true);
    });
  },
};
