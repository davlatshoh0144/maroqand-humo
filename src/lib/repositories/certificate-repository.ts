import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Certificate } from '@/lib/types';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';
import { mapCertificate, type Row } from '@/lib/repositories/mappers';

export const certificateRepository = {
  async listCertificates(): Promise<RepositoryResult<Certificate[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('certificates')
        .select('*')
        .order('issued_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapCertificate));
    });
  },

  async issueIfEligible(courseId: string): Promise<RepositoryResult<Certificate>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .rpc('issue_certificate_if_eligible', { target_course_id: courseId });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapCertificate(data as Row));
    });
  },

  async approveCertificate(certificateId: string, approved: boolean): Promise<RepositoryResult<Certificate>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const reviewerId = sessionData.session?.user.id;
      if (!reviewerId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .from('certificates')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_at: approved ? new Date().toISOString() : null,
          approved_by: approved ? reviewerId : null,
        })
        .eq('id', certificateId)
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await getSupabaseBrowserClient()
        .from('audit_logs')
        .insert({
          actor_id: reviewerId,
          action: 'certificate_reviewed',
          entity_table: 'certificates',
          entity_id: certificateId,
          metadata: { approved },
        });
      return ok(mapCertificate(data as Row));
    });
  },

  async verifyCredential(credentialId: string): Promise<RepositoryResult<Certificate | null>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .rpc('verify_certificate_public', { input_credential_id: credentialId });

      if (error) return fail('UNKNOWN_ERROR', error.message, error);
      const row = Array.isArray(data) ? data[0] : null;
      if (!row) return ok(null);

      return ok(mapCertificate({
        id: credentialId,
        student_id: '',
        course_id: '',
        credential_id: row.credential_id,
        status: row.status,
        student_name: row.student_name,
        course_title: row.course_title,
        issued_at: row.issued_at,
        score: row.score,
      }));
    });
  },
};
