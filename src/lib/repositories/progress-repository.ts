import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { LessonProgress, Note, QuizAttempt } from '@/lib/types';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';
import { mapLessonProgress, mapNote, mapQuizAttempt, type Row } from '@/lib/repositories/mappers';

export const progressRepository = {
  async listLessonProgress(): Promise<RepositoryResult<LessonProgress[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('lesson_progress')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapLessonProgress));
    });
  },

  async upsertLessonProgress(progress: Pick<LessonProgress, 'lessonId' | 'completed' | 'checklistData'> & { timeSpentSeconds?: number }): Promise<RepositoryResult<LessonProgress>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: progress.lessonId,
          completed: progress.completed,
          checklist_data: progress.checklistData,
          completed_at: progress.completed ? new Date().toISOString() : null,
          time_spent_seconds: progress.timeSpentSeconds,
        }, { onConflict: 'user_id,lesson_id' })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await getSupabaseBrowserClient()
        .from('audit_logs')
        .insert({
          actor_id: userId,
          action: 'lesson_progress_updated',
          entity_table: 'lesson_progress',
          entity_id: (data as Row).id,
          metadata: { lesson_id: progress.lessonId, completed: progress.completed },
        });
      return ok(mapLessonProgress(data as Row));
    });
  },

  async listNotes(): Promise<RepositoryResult<Note[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapNote));
    });
  },

  async addNote(note: Pick<Note, 'content' | 'lessonId' | 'courseId'>): Promise<RepositoryResult<Note>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .from('notes')
        .insert({
          user_id: userId,
          content: note.content,
          lesson_id: note.lessonId,
          course_id: note.courseId,
        })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapNote(data as Row));
    });
  },

  async updateNote(noteId: string, content: string): Promise<RepositoryResult<Note>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('notes')
        .update({ content })
        .eq('id', noteId)
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapNote(data as Row));
    });
  },

  async deleteNote(noteId: string): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { error } = await getSupabaseBrowserClient()
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(true);
    });
  },

  async listQuizAttempts(): Promise<RepositoryResult<QuizAttempt[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('quiz_attempts')
        .select('*')
        .order('attempted_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapQuizAttempt));
    });
  },

  async submitQuizAttempt(attempt: QuizAttempt): Promise<RepositoryResult<QuizAttempt>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .rpc('submit_quiz_attempt', {
          target_quiz_id: attempt.quizId,
          submitted_answers: attempt.answers,
        })
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await getSupabaseBrowserClient()
        .from('audit_logs')
        .insert({
          actor_id: userId,
          action: 'quiz_attempt_submitted',
          entity_table: 'quiz_attempts',
          entity_id: (data as Row).id,
          metadata: { quiz_id: attempt.quizId },
        });
      return ok(mapQuizAttempt(data as Row));
    });
  },
};
