import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  Cohort,
  CohortEnrollment,
  CrmRecord,
  LessonAttendance,
  StudentApplication,
  StudentApplicationStatus,
} from '@/lib/types';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';
import type { Row } from '@/lib/repositories/mappers';

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback;
}

function isoValue(value: unknown, fallback = new Date().toISOString()) {
  return typeof value === 'string' ? value : fallback;
}

function mapApplication(row: Row): StudentApplication {
  return {
    id: stringValue(row.id),
    applicantName: stringValue(row.applicant_name),
    email: stringValue(row.email),
    phone: typeof row.phone === 'string' ? row.phone : undefined,
    city: typeof row.city === 'string' ? row.city : undefined,
    experienceLevel: stringValue(row.experience_level, 'new') as StudentApplication['experienceLevel'],
    preferredCohortId: typeof row.preferred_cohort_id === 'string' ? row.preferred_cohort_id : undefined,
    courseInterest: typeof row.course_interest === 'string' ? row.course_interest : undefined,
    motivation: stringValue(row.motivation),
    status: stringValue(row.status, 'applied') as StudentApplicationStatus,
    reviewerId: typeof row.reviewer_id === 'string' ? row.reviewer_id : undefined,
    reviewedAt: typeof row.reviewed_at === 'string' ? row.reviewed_at : undefined,
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

function mapCohort(row: Row): Cohort {
  return {
    id: stringValue(row.id),
    name: stringValue(row.name),
    slug: stringValue(row.slug),
    courseId: typeof row.course_id === 'string' ? row.course_id : undefined,
    instructorId: typeof row.instructor_id === 'string' ? row.instructor_id : undefined,
    startsAt: stringValue(row.starts_at),
    endsAt: typeof row.ends_at === 'string' ? row.ends_at : undefined,
    capacity: numberValue(row.capacity, 25),
    status: stringValue(row.status, 'planned') as Cohort['status'],
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

function mapCohortEnrollment(row: Row): CohortEnrollment {
  return {
    id: stringValue(row.id),
    cohortId: stringValue(row.cohort_id),
    userId: stringValue(row.user_id),
    applicationId: typeof row.application_id === 'string' ? row.application_id : undefined,
    status: stringValue(row.status, 'active') as CohortEnrollment['status'],
    enrolledAt: isoValue(row.enrolled_at),
    completedAt: typeof row.completed_at === 'string' ? row.completed_at : undefined,
  };
}

function mapAttendance(row: Row): LessonAttendance {
  return {
    id: stringValue(row.id),
    userId: stringValue(row.user_id),
    courseId: stringValue(row.course_id),
    lessonId: stringValue(row.lesson_id),
    cohortId: typeof row.cohort_id === 'string' ? row.cohort_id : undefined,
    status: stringValue(row.status, 'present') as LessonAttendance['status'],
    attendedAt: typeof row.attended_at === 'string' ? row.attended_at : undefined,
    recordedBy: typeof row.recorded_by === 'string' ? row.recorded_by : undefined,
    notes: typeof row.notes === 'string' ? row.notes : undefined,
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

function mapCrmRecord(row: Row): CrmRecord {
  return {
    id: stringValue(row.id),
    type: stringValue(row.type, 'lead') as CrmRecord['type'],
    name: stringValue(row.name),
    email: stringValue(row.email),
    phone: typeof row.phone === 'string' ? row.phone : undefined,
    source: typeof row.source === 'string' ? row.source : undefined,
    status: stringValue(row.status, 'new') as CrmRecord['status'],
    ownerId: typeof row.owner_id === 'string' ? row.owner_id : undefined,
    lastContactAt: typeof row.last_contact_at === 'string' ? row.last_contact_at : undefined,
    followUpAt: typeof row.follow_up_at === 'string' ? row.follow_up_at : undefined,
    notes: typeof row.notes === 'string' ? row.notes : undefined,
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

async function currentUserId() {
  const { data } = await getSupabaseBrowserClient().auth.getSession();
  return data.session?.user.id;
}

async function audit(action: string, metadata: Record<string, unknown> = {}) {
  const actorId = await currentUserId();
  if (!actorId) return;

  await getSupabaseBrowserClient()
    .from('audit_logs')
    .insert({ actor_id: actorId, action, metadata });
}

export interface OperationsData {
  applications: StudentApplication[];
  cohorts: Cohort[];
  cohortEnrollments: CohortEnrollment[];
  attendance: LessonAttendance[];
  crmRecords: CrmRecord[];
  auditLogs: Row[];
}

export const operationsRepository = {
  async listCohorts(): Promise<RepositoryResult<Cohort[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('cohorts')
        .select('*')
        .order('starts_at', { ascending: true });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapCohort));
    });
  },

  async listOperationsData(): Promise<RepositoryResult<OperationsData>> {
    return guarded(async () => {
      const [applications, cohorts, cohortEnrollments, attendance, crmRecords, auditLogs] = await Promise.all([
        getSupabaseBrowserClient().from('student_applications').select('*').order('created_at', { ascending: false }),
        getSupabaseBrowserClient().from('cohorts').select('*').order('starts_at', { ascending: true }),
        getSupabaseBrowserClient().from('cohort_enrollments').select('*').order('enrolled_at', { ascending: false }),
        getSupabaseBrowserClient().from('lesson_attendance').select('*').order('updated_at', { ascending: false }),
        getSupabaseBrowserClient().from('crm_records').select('*').order('updated_at', { ascending: false }),
        getSupabaseBrowserClient().from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      const firstError =
        applications.error ??
        cohorts.error ??
        cohortEnrollments.error ??
        attendance.error ??
        crmRecords.error ??
        auditLogs.error;

      if (firstError) return fail('PERMISSION_DENIED', firstError.message, firstError);

      return ok({
        applications: ((applications.data ?? []) as Row[]).map(mapApplication),
        cohorts: ((cohorts.data ?? []) as Row[]).map(mapCohort),
        cohortEnrollments: ((cohortEnrollments.data ?? []) as Row[]).map(mapCohortEnrollment),
        attendance: ((attendance.data ?? []) as Row[]).map(mapAttendance),
        crmRecords: ((crmRecords.data ?? []) as Row[]).map(mapCrmRecord),
        auditLogs: (auditLogs.data ?? []) as Row[],
      });
    });
  },

  async submitApplication(input: Omit<StudentApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<RepositoryResult<StudentApplication>> {
    return guarded(async () => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const row = {
        id,
        applicant_name: input.applicantName,
        email: input.email.trim().toLowerCase(),
        phone: input.phone,
        city: input.city,
        experience_level: input.experienceLevel,
        preferred_cohort_id: input.preferredCohortId,
        course_interest: input.courseInterest,
        motivation: input.motivation,
        status: 'applied' as const,
        reviewer_id: undefined,
        reviewed_at: undefined,
        created_at: now,
        updated_at: now,
      };

      const { error } = await getSupabaseBrowserClient()
        .from('student_applications')
        .insert(row);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapApplication(row));
    });
  },

  async updateApplicationStatus(applicationId: string, status: StudentApplicationStatus): Promise<RepositoryResult<StudentApplication>> {
    return guarded(async () => {
      const reviewerId = await currentUserId();
      if (!reviewerId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .from('student_applications')
        .update({
          status,
          reviewer_id: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await audit('application_status_changed', { application_id: applicationId, status });
      return ok(mapApplication(data as Row));
    });
  },

  async recordAttendance(input: Pick<LessonAttendance, 'userId' | 'courseId' | 'lessonId' | 'cohortId' | 'status' | 'notes'>): Promise<RepositoryResult<LessonAttendance>> {
    return guarded(async () => {
      const recorderId = await currentUserId();
      if (!recorderId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .from('lesson_attendance')
        .upsert({
          user_id: input.userId,
          course_id: input.courseId,
          lesson_id: input.lessonId,
          cohort_id: input.cohortId,
          status: input.status,
          attended_at: input.status === 'present' || input.status === 'late' ? new Date().toISOString() : null,
          recorded_by: recorderId,
          notes: input.notes,
        }, { onConflict: 'user_id,lesson_id' })
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await audit('attendance_recorded', {
        user_id: input.userId,
        course_id: input.courseId,
        lesson_id: input.lessonId,
        status: input.status,
      });
      return ok(mapAttendance(data as Row));
    });
  },

  async createCrmLead(input: { name?: string; email: string; phone?: string; source?: string; notes?: string }): Promise<RepositoryResult<CrmRecord>> {
    return guarded(async () => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const email = input.email.trim().toLowerCase();
      const row = {
        id,
        type: 'lead' as const,
        name: input.name?.trim() || email,
        email,
        phone: input.phone,
        source: input.source,
        status: 'new' as const,
        owner_id: undefined,
        last_contact_at: undefined,
        follow_up_at: undefined,
        notes: input.notes,
        created_at: now,
        updated_at: now,
      };

      const { error } = await getSupabaseBrowserClient()
        .from('crm_records')
        .insert(row);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(mapCrmRecord(row));
    });
  },

  async updateCrmRecord(
    recordId: string,
    updates: Partial<Pick<CrmRecord, 'status' | 'notes' | 'followUpAt'>>
  ): Promise<RepositoryResult<CrmRecord>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('crm_records')
        .update({
          status: updates.status,
          notes: updates.notes,
          follow_up_at: updates.followUpAt,
          last_contact_at: new Date().toISOString(),
        })
        .eq('id', recordId)
        .select('*')
        .single();

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await audit('crm_record_updated', {
        crm_record_id: recordId,
        status: updates.status,
        follow_up_at: updates.followUpAt,
      });
      return ok(mapCrmRecord(data as Row));
    });
  },
};
