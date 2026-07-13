import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { AssignmentSubmission } from '@/lib/types';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';
import { mapAssignmentSubmission, type Row } from '@/lib/repositories/mappers';
import { safeStorageFileName, uploadStorageFile, type StorageBucket } from '@/lib/supabase/storage';

export const assignmentRepository = {
  async listSubmissions(): Promise<RepositoryResult<AssignmentSubmission[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('assignment_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapAssignmentSubmission));
    });
  },

  async submitAssignment(
    submission: AssignmentSubmission,
    file?: File
  ): Promise<RepositoryResult<AssignmentSubmission>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return fail('AUTH_ERROR', 'Authentication required.');

      let filePath: string | undefined;

      if (file) {
        const bucket: StorageBucket = 'assignment-submissions';
        const upload = await uploadStorageFile(
          bucket,
          `${userId}/${submission.assignmentId}/${Date.now()}-${safeStorageFileName(file.name)}`,
          file
        );
        if (upload.error) return upload;
        filePath = upload.data;
      }

      const { data, error } = await getSupabaseBrowserClient()
        .from('assignment_submissions')
        .insert({
          user_id: userId,
          assignment_id: submission.assignmentId,
          response: submission.response,
          file_path: filePath,
          status: 'submitted',
          submitted_at: submission.submittedAt,
        })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await getSupabaseBrowserClient()
        .from('audit_logs')
        .insert({ actor_id: userId, action: 'assignment_submitted', entity_table: 'assignment_submissions', entity_id: data.id });
      return ok(mapAssignmentSubmission(data as Row));
    });
  },

  async reviewSubmission(
    submissionId: string,
    review: { status: 'approved' | 'rejected'; score?: number; feedback?: string }
  ): Promise<RepositoryResult<AssignmentSubmission>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const reviewerId = sessionData.session?.user.id;
      if (!reviewerId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .from('assignment_submissions')
        .update({
          status: review.status,
          score: review.score,
          feedback: review.feedback,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await getSupabaseBrowserClient()
        .from('audit_logs')
        .insert({ actor_id: reviewerId, action: 'assignment_reviewed', entity_table: 'assignment_submissions', entity_id: submissionId });
      return ok(mapAssignmentSubmission(data as Row));
    });
  },
};
