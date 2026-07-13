import type {
  Assignment,
  AssignmentSubmission,
  Certificate,
  Course,
  Discussion,
  DiscussionReply,
  Enrollment,
  Lesson,
  LessonProgress,
  ManagedCourseDraft,
  ManagedLessonResource,
  Note,
  PlatformAccount,
  PricingPlan,
  Quiz,
  QuizAttempt,
  QuizQuestion,
  User,
  UserRole,
} from '@/lib/types';
import { normalizeRole } from '@/lib/auth/access-control';

export type Row = Record<string, unknown>;

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback;
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function arrayValue<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function isoValue(value: unknown, fallback = new Date().toISOString()) {
  return typeof value === 'string' ? value : fallback;
}

export function mapProfile(row: Row): User {
  return {
    id: stringValue(row.id),
    email: stringValue(row.email),
    name: stringValue(row.name, stringValue(row.email, 'Student')),
    role: normalizeRole(stringValue(row.role) as UserRole) as UserRole,
    avatar: stringValue(row.avatar_url),
    city: stringValue(row.city),
    bio: stringValue(row.bio),
    phone: stringValue(row.phone),
    createdAt: isoValue(row.created_at),
    lastLoginAt: typeof row.last_login_at === 'string' ? row.last_login_at : undefined,
  };
}

export function mapPlatformAccount(row: Row): PlatformAccount {
  return {
    ...mapProfile(row),
    passwordHash: '',
    status: stringValue(row.status) === 'suspended' ? 'suspended' : 'active',
  };
}

export function mapLesson(row: Row): Lesson {
  const resources = arrayValue<{ title?: string; url?: string }>(row.resources);
  return {
    id: stringValue(row.id),
    courseId: stringValue(row.course_id),
    orderIndex: numberValue(row.order_index, 0),
    title: stringValue(row.title),
    description: stringValue(row.description),
    content: stringValue(row.content),
    videoUrl: typeof row.video_url === 'string' ? row.video_url : undefined,
    durationMin: numberValue(row.duration_min, 0),
    isFree: booleanValue(row.is_free),
    isRequired: booleanValue(row.is_required, true),
    checklist: stringArray(row.checklist),
    resources: resources.map((item) => ({
      title: stringValue(item.title),
      url: stringValue(item.url),
    })),
  };
}

export function mapCourse(row: Row, lessons: Lesson[] = []): Course {
  return {
    id: stringValue(row.id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    subtitle: stringValue(row.subtitle),
    description: stringValue(row.description),
    category: stringValue(row.category, 'Dispatch'),
    image: stringValue(row.image_url),
    difficulty: (stringValue(row.difficulty, 'beginner') as Course['difficulty']) ?? 'beginner',
    durationHours: numberValue(row.duration_hours, 0),
    instructorId: stringValue(row.instructor_id),
    instructorName: stringValue(row.instructor_name),
    instructorBio: stringValue(row.instructor_bio),
    instructorAvatar: stringValue(row.instructor_avatar_url),
    enrollmentCount: numberValue(row.enrollment_count, 0),
    certificateAvailable: booleanValue(row.certificate_available, true),
    learningOutcomes: stringArray(row.learning_outcomes),
    prerequisites: stringArray(row.prerequisites),
    commonMistakes: stringArray(row.common_mistakes),
    lastUpdated: stringValue(row.last_updated, isoValue(row.updated_at).slice(0, 10)),
    published: booleanValue(row.published),
    lessons: lessons.sort((a, b) => a.orderIndex - b.orderIndex),
  };
}

export function mapEnrollment(row: Row): Enrollment {
  return {
    id: stringValue(row.id),
    userId: stringValue(row.user_id),
    courseId: stringValue(row.course_id),
    status: (stringValue(row.status, 'active') as Enrollment['status']) ?? 'active',
    enrolledAt: isoValue(row.enrolled_at),
    completedAt: typeof row.completed_at === 'string' ? row.completed_at : undefined,
  };
}

export function mapLessonProgress(row: Row): LessonProgress {
  return {
    id: stringValue(row.id),
    userId: stringValue(row.user_id),
    lessonId: stringValue(row.lesson_id),
    completed: booleanValue(row.completed),
    checklistData: (row.checklist_data ?? {}) as Record<string, boolean>,
    completedAt: typeof row.completed_at === 'string' ? row.completed_at : undefined,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined,
    timeSpentSeconds: numberValue(row.time_spent_seconds, 0),
  };
}

export function mapQuiz(row: Row): Quiz {
  return {
    id: stringValue(row.id),
    courseId: stringValue(row.course_id),
    lessonId: typeof row.lesson_id === 'string' ? row.lesson_id : undefined,
    title: stringValue(row.title),
    questions: arrayValue<QuizQuestion>(row.questions),
    passingScore: numberValue(row.passing_score, 70),
  };
}

export function mapQuizAttempt(row: Row): QuizAttempt {
  return {
    id: stringValue(row.id),
    userId: stringValue(row.user_id),
    quizId: stringValue(row.quiz_id),
    answers: (row.answers ?? {}) as Record<string, number>,
    score: numberValue(row.score, 0),
    passed: booleanValue(row.passed),
    attemptedAt: isoValue(row.attempted_at),
  };
}

export function mapAssignment(row: Row): Assignment {
  return {
    id: stringValue(row.id),
    courseId: stringValue(row.course_id),
    lessonId: typeof row.lesson_id === 'string' ? row.lesson_id : undefined,
    title: stringValue(row.title),
    description: stringValue(row.description),
    scenario: stringValue(row.scenario),
    rubric: arrayValue<Assignment['rubric'][number]>(row.rubric),
    type: (stringValue(row.type, 'scenario') as Assignment['type']) ?? 'scenario',
    difficulty: (stringValue(row.difficulty, 'beginner') as Assignment['difficulty']) ?? 'beginner',
  };
}

export function mapAssignmentSubmission(row: Row): AssignmentSubmission {
  return {
    id: stringValue(row.id),
    userId: stringValue(row.user_id),
    assignmentId: stringValue(row.assignment_id),
    response: stringValue(row.response),
    score: typeof row.score === 'number' ? row.score : undefined,
    feedback: typeof row.feedback === 'string' ? row.feedback : undefined,
    status: (stringValue(row.status, 'submitted') as AssignmentSubmission['status']) ?? 'submitted',
    submittedAt: isoValue(row.submitted_at),
    reviewedAt: typeof row.reviewed_at === 'string' ? row.reviewed_at : undefined,
    reviewedBy: typeof row.reviewed_by === 'string' ? row.reviewed_by : undefined,
  };
}

export function mapNote(row: Row): Note {
  return {
    id: stringValue(row.id),
    userId: stringValue(row.user_id),
    lessonId: typeof row.lesson_id === 'string' ? row.lesson_id : undefined,
    courseId: typeof row.course_id === 'string' ? row.course_id : undefined,
    content: stringValue(row.content),
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

export function mapCertificate(row: Row): Certificate {
  const status = stringValue(row.status, 'pending') as Certificate['status'];
  return {
    id: stringValue(row.id),
    userId: stringValue(row.student_id ?? row.user_id),
    courseId: stringValue(row.course_id),
    credentialId: stringValue(row.credential_id),
    score: numberValue(row.score, 0),
    issuedAt: isoValue(row.issued_at),
    verified: status === 'approved',
    status,
    approvedAt: typeof row.approved_at === 'string' ? row.approved_at : undefined,
    approvedBy: typeof row.approved_by === 'string' ? row.approved_by : undefined,
    revokedAt: typeof row.revoked_at === 'string' ? row.revoked_at : undefined,
    revokedBy: typeof row.revoked_by === 'string' ? row.revoked_by : undefined,
    revocationReason: typeof row.revocation_reason === 'string' ? row.revocation_reason : undefined,
    userName: stringValue(row.student_name ?? row.user_name, 'Student'),
    courseName: stringValue(row.course_title ?? row.course_name, 'Course'),
  };
}

export function mapDiscussionReply(row: Row): DiscussionReply {
  return {
    id: stringValue(row.id),
    discussionId: stringValue(row.discussion_id),
    userId: stringValue(row.user_id),
    userName: stringValue(row.user_name, 'Student'),
    content: stringValue(row.content),
    isHelpful: booleanValue(row.is_helpful),
    isInstructor: booleanValue(row.is_instructor),
    createdAt: isoValue(row.created_at),
  };
}

export function mapDiscussion(row: Row, replies: DiscussionReply[] = []): Discussion {
  return {
    id: stringValue(row.id),
    courseId: typeof row.course_id === 'string' ? row.course_id : undefined,
    lessonId: typeof row.lesson_id === 'string' ? row.lesson_id : undefined,
    userId: stringValue(row.user_id),
    userName: stringValue(row.user_name, 'Student'),
    title: stringValue(row.title),
    content: stringValue(row.content),
    isPinned: booleanValue(row.is_pinned),
    isAnnouncement: booleanValue(row.is_announcement),
    createdAt: isoValue(row.created_at),
    replies,
  };
}

export function mapPricingPlan(row: Row): PricingPlan {
  return {
    id: stringValue(row.id),
    name: stringValue(row.name),
    slug: stringValue(row.slug),
    price: numberValue(row.price, 0),
    currency: stringValue(row.currency, 'USD'),
    interval: (stringValue(row.interval, 'one_time') as PricingPlan['interval']) ?? 'one_time',
    features: stringArray(row.features),
    isPopular: booleanValue(row.is_popular),
    isActive: booleanValue(row.is_active, true),
  };
}

export function mapManagedCourse(row: Row, lessons: Row[] = []): ManagedCourseDraft {
  return {
    id: stringValue(row.id),
    instructorId: stringValue(row.instructor_id),
    title: stringValue(row.title),
    description: stringValue(row.description),
    status: booleanValue(row.published) ? 'published' : 'draft',
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
    lessons: lessons.map((lesson) => {
      const resources = arrayValue<ManagedLessonResource>(lesson.resources);
      return {
        id: stringValue(lesson.id),
        title: stringValue(lesson.title),
        content: stringValue(lesson.content),
        durationMin: numberValue(lesson.duration_min, 30),
        duration: `${numberValue(lesson.duration_min, 30)} min`,
        type: 'reading',
        published: booleanValue(row.published),
        resources,
      };
    }),
  };
}
