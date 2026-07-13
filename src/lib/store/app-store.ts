import { create } from 'zustand';
import {
  AppView,
  AppNotification,
  User,
  Enrollment,
  LessonProgress,
  Note,
  Certificate,
  QuizAttempt,
  AssignmentSubmission,
  Discussion,
  CourseNote,
  UserPreferences,
  PlatformAccount,
  LeadSubmission,
  AnalyticsEvent,
  Assignment,
  Course,
  Cohort,
  CohortEnrollment,
  CrmRecord,
  LessonAttendance,
  ManagedCourseDraft,
  ManagedAssignmentDraft,
  ManagedLessonDraft,
  ManagedLessonResource,
  ManagedQuizDraft,
  PricingPlan,
  Quiz,
  UserRole,
  StudentApplication,
  StudentApplicationStatus,
} from '@/lib/types';
import { normalizeRole } from '@/lib/auth/access-control';
import { courses as fallbackCourses } from '@/lib/data/courses';
import { assignments as fallbackAssignments } from '@/lib/data/assignments';
import { quizzes as fallbackQuizzes } from '@/lib/data/quiz-data';
import { pricingPlans as fallbackPricingPlans } from '@/lib/data/pricing';
import { shouldUseSupabase } from '@/lib/config/runtime';
import {
  adminRepository,
  assignmentRepository,
  authRepository,
  certificateRepository,
  courseRepository,
  discussionRepository,
  operationsRepository,
  progressRepository,
  teacherRepository,
} from '@/lib/repositories';

const supabasePersistenceKeys = new Set([
  'marokand_accounts',
  'marokand_user',
  'marokand_enrollments',
  'marokand_progress',
  'marokand_notes',
  'marokand_courseNotes',
  'marokand_certificates',
  'marokand_quizAttempts',
  'marokand_submissions',
  'marokand_managed_courses',
  'marokand_analytics_events',
  'marokand_discussions',
  'marokand_applications',
  'marokand_cohorts',
  'marokand_cohort_enrollments',
  'marokand_attendance',
  'marokand_crm_records',
  'marokand_audit_logs',
]);

// Helper to load from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  if (shouldUseSupabase() && supabasePersistenceKeys.has(key)) return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Helper to save to localStorage
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  if (shouldUseSupabase() && supabasePersistenceKeys.has(key)) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable
  }
}

function appendLocalAuditLog(
  action: string,
  actorId?: string,
  metadata: Record<string, unknown> = {}
): Record<string, unknown>[] {
  const entry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor_id: actorId ?? 'system',
    action,
    metadata,
    created_at: new Date().toISOString(),
  };
  const updated = [entry, ...loadFromStorage<Record<string, unknown>[]>('marokand_audit_logs', [])].slice(0, 100);
  saveToStorage('marokand_audit_logs', updated);
  return updated;
}

function hashPassword(password: string): string {
  try {
    return btoa(unescape(encodeURIComponent(`mh:${password}`)));
  } catch {
    return password;
  }
}

function publicUser(account: PlatformAccount): User {
  const { passwordHash: _passwordHash, status: _status, ...user } = account;
  return user;
}

function seedAccounts(): PlatformAccount[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'user-student-seed',
      name: 'Student User',
      email: 'student@marokandhumo.com',
      role: 'student',
      avatar: '',
      createdAt: now,
      passwordHash: hashPassword('password123'),
      status: 'active',
    },
    {
      id: 'user-instructor-seed',
      name: 'Instructor User',
      email: 'instructor@marokandhumo.com',
      role: 'instructor',
      avatar: '',
      createdAt: now,
      passwordHash: hashPassword('password123'),
      status: 'active',
    },
    {
      id: 'user-admin-seed',
      name: 'Admin User',
      email: 'admin@marokandhumo.com',
      role: 'admin',
      avatar: '',
      createdAt: now,
      passwordHash: hashPassword('password123'),
      status: 'active',
    },
  ];
}

function seedCohorts(): Cohort[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddd01',
      name: 'Summer 2026',
      slug: 'summer-2026',
      courseId: '11111111-1111-4111-8111-111111111111',
      startsAt: '2026-06-15',
      endsAt: '2026-08-28',
      capacity: 35,
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddd02',
      name: 'Fall 2026',
      slug: 'fall-2026',
      courseId: '11111111-1111-4111-8111-111111111111',
      startsAt: '2026-09-08',
      endsAt: '2026-11-20',
      capacity: 35,
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddd03',
      name: 'Dispatcher Elite',
      slug: 'dispatcher-elite',
      courseId: '22222222-2222-4222-8222-222222222222',
      startsAt: '2026-07-06',
      endsAt: '2026-10-02',
      capacity: 20,
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddd04',
      name: 'Amazon Operations',
      slug: 'amazon-operations',
      courseId: '44444444-4444-4444-8444-444444444444',
      startsAt: '2026-07-20',
      endsAt: '2026-09-18',
      capacity: 25,
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function loadAccounts(): PlatformAccount[] {
  const stored = loadFromStorage<PlatformAccount[]>('marokand_accounts', []);
  const migratedUsers = loadFromStorage<User[]>('marokand_users', []).map((user) => ({
    ...user,
    role: normalizeRole(user.role),
    passwordHash: hashPassword('password123'),
    status: 'active' as const,
  }));
  const merged = [...seedAccounts(), ...migratedUsers, ...stored];
  const unique = new Map<string, PlatformAccount>();
  for (const account of merged) {
    unique.set(account.email.toLowerCase(), {
      ...account,
      email: account.email.toLowerCase(),
      role: normalizeRole(account.role),
    });
  }
  const accounts = [...unique.values()];
  saveToStorage('marokand_accounts', accounts);
  return accounts;
}

function loadCurrentUser(accounts: PlatformAccount[]): User | null {
  const stored = loadFromStorage<User | null>('marokand_user', null);
  if (!stored) return null;
  const account = accounts.find(
    (item) => item.status === 'active' && (item.id === stored.id || item.email === stored.email.toLowerCase())
  );
  if (!account) {
    saveToStorage('marokand_user', null);
    return null;
  }
  const user = publicUser({ ...account, role: normalizeRole(account.role) });
  saveToStorage('marokand_user', user);
  return user;
}

function normalizeManagedCourses(courses: ManagedCourseDraft[]): ManagedCourseDraft[] {
  return courses.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => {
      const legacyLesson = lesson as ManagedLessonDraft & {
        resources?: ManagedLessonResource[];
        durationMin?: number;
        duration?: string;
        type?: ManagedLessonDraft['type'];
      };
      const durationMin = legacyLesson.durationMin ?? 30;
      return {
        ...legacyLesson,
        durationMin,
        duration: legacyLesson.duration ?? `${durationMin} min`,
        type: legacyLesson.type ?? 'reading',
        resources: legacyLesson.resources ?? [],
      };
    }),
  }));
}

function loadInitialNavigation(): Pick<AppState, 'currentView' | 'selectedCourseId' | 'selectedLessonId'> {
  return {
    currentView: 'landing',
    selectedCourseId: null,
    selectedLessonId: null,
  };
}

interface AppState {
  // Navigation
  currentView: AppView;
  selectedCourseId: string | null;
  selectedLessonId: string | null;
  selectedCredentialId: string | null;
  sidebarOpen: boolean;

  // User
  user: User | null;
  accounts: PlatformAccount[];
  authLoading: boolean;
  dataLoading: boolean;
  backendError: string | null;
  backendInitialized: boolean;

  // Production LMS data
  courses: Course[];
  assignments: Assignment[];
  quizzes: Quiz[];
  pricingPlans: PricingPlan[];

  // Enrollment & Progress
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  lessonActivity: Record<string, string>;

  // Notes
  notes: Note[];

  // Certificates
  certificates: Certificate[];

  // Quiz
  quizAttempts: QuizAttempt[];

  // Assignments
  submissions: AssignmentSubmission[];
  managedCourses: ManagedCourseDraft[];
  leads: LeadSubmission[];
  analyticsEvents: AnalyticsEvent[];
  applications: StudentApplication[];
  cohorts: Cohort[];
  cohortEnrollments: CohortEnrollment[];
  attendance: LessonAttendance[];
  crmRecords: CrmRecord[];
  auditLogs: Record<string, unknown>[];

  // Discussions
  discussions: Discussion[];

  // Notifications
  notifications: AppNotification[];
  notificationPanelOpen: boolean;

  // Bookmarks
  bookmarkedCourseIds: string[];

  // Course Notes (enhanced)
  courseNotes: CourseNote[];

  // User Preferences
  userPreferences: UserPreferences;

  // Toolkit Favorites
  toolkitFavoriteIds: string[];

  // Saved Jobs
  savedJobIds: string[];

  // Joined Study Groups
  joinedGroupIds: string[];

  // Glossary Favorites
  glossaryFavoriteIds: string[];

  // Assigned Mentor
  assignedMentorId: string | null;

  // Resource Ratings
  resourceRatings: Record<string, number>;

  // Downloaded Resources
  downloadedResourceIds: string[];

  // Actions — Navigation
  navigate: (view: AppView, courseId?: string, lessonId?: string) => void;
  toggleSidebar: () => void;

  // Actions — Auth
  initializeBackend: () => Promise<void>;
  refreshBackendData: () => Promise<void>;
  retryBackend: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  createAccount: (account: { name: string; email: string; password: string; role: UserRole }) => Promise<boolean>;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateAccountStatus: (userId: string, status: PlatformAccount['status']) => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar' | 'city' | 'bio' | 'phone'>>) => void;
  logout: (redirectView?: AppView) => Promise<void>;

  // Actions — Enrollment
  enrollCourse: (courseId: string) => void;
  dropCourse: (courseId: string) => void;

  // Actions — Progress
  updateProgress: (lessonId: string, completed: boolean, checklistData?: Record<string, boolean>) => void;
  trackLessonTime: (lessonId: string, seconds: number) => void;

  // Actions — Notes
  addNote: (content: string, lessonId?: string, courseId?: string) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;

  // Actions — Quiz
  submitQuizAttempt: (attempt: QuizAttempt) => void;

  // Actions — Assignment
  submitAssignment: (submission: AssignmentSubmission) => void;
  reviewAssignmentSubmission: (
    submissionId: string,
    review: {
      status: 'approved' | 'rejected';
      score?: number;
      feedback?: string;
    }
  ) => void;

  // Actions — Certificate
  issueCertificate: (certificate: Certificate) => void;
  approveCertificate: (certificateId: string, approved: boolean) => void;
  verifyCredential: (credentialId: string) => Promise<Certificate | null>;
  submitLead: (lead: Omit<LeadSubmission, 'id' | 'createdAt' | 'status'>) => void;
  recordAnalyticsEvent: (event: Omit<AnalyticsEvent, 'id' | 'createdAt'>) => void;
  assignCourseToStudent: (userId: string, courseId: string) => void;
  submitApplication: (application: Omit<StudentApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateApplicationStatus: (applicationId: string, status: StudentApplicationStatus) => void;
  recordAttendance: (attendance: Pick<LessonAttendance, 'userId' | 'courseId' | 'lessonId' | 'cohortId' | 'status' | 'notes'>) => void;
  updateCrmRecord: (recordId: string, updates: Partial<Pick<CrmRecord, 'status' | 'notes' | 'followUpAt'>>) => void;
  createManagedCourse: (draft: Pick<ManagedCourseDraft, 'title' | 'description'>) => string | undefined;
  updateManagedCourse: (courseId: string, updates: Partial<Pick<ManagedCourseDraft, 'title' | 'description' | 'status'>>) => void;
  addManagedLesson: (courseId: string, lesson: { title: string; content: string; fileName?: string; durationMin?: number }) => string | undefined;
  updateManagedLesson: (courseId: string, lessonId: string, updates: Partial<ManagedLessonDraft>) => void;
  addManagedResource: (courseId: string, lessonId: string, resource: Omit<ManagedLessonResource, 'id'>) => void;
  upsertManagedQuiz: (courseId: string, lessonId: string, quiz: Omit<ManagedQuizDraft, 'id' | 'published' | 'questions'> & { question: string; options: string[]; correctIndex: number }) => void;
  upsertManagedAssignment: (courseId: string, lessonId: string, assignment: Omit<ManagedAssignmentDraft, 'id' | 'published'>) => void;

  // Actions — Discussion
  addDiscussion: (discussion: Discussion) => void;
  addDiscussionReply: (discussionId: string, reply: Discussion['replies'][0]) => void;
  toggleDiscussionPin: (discussionId: string) => void;

  // Actions — Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setNotificationPanelOpen: (open: boolean) => void;
  unreadNotificationCount: () => number;

  // Actions — Bookmarks
  toggleBookmark: (courseId: string) => void;
  isBookmarked: (courseId: string) => boolean;

  // Actions — Course Notes
  addCourseNote: (note: Omit<CourseNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCourseNote: (noteId: string, content: string) => void;
  deleteCourseNote: (noteId: string) => void;

  // Actions — User Preferences
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;

  // Actions — Toolkit Favorites
  toggleToolkitFavorite: (termId: string) => void;
  isToolkitFavorite: (termId: string) => boolean;

  // Actions — Saved Jobs
  toggleSavedJob: (jobId: string) => void;
  isSavedJob: (jobId: string) => boolean;

  // Actions — Study Groups
  toggleJoinedGroup: (groupId: string) => void;
  isJoinedGroup: (groupId: string) => boolean;

  // Actions — Glossary Favorites
  toggleGlossaryFavorite: (termId: string) => void;
  isGlossaryFavorite: (termId: string) => boolean;

  // Actions — Mentorship
  assignMentor: (mentorId: string) => void;
  removeMentor: () => void;

  // Actions — Resource Ratings
  rateResource: (resourceId: string, rating: number) => void;
  getResourceRating: (resourceId: string) => number;

  // Actions — Resource Downloads
  trackResourceDownload: (resourceId: string) => void;
}

const initialAccounts = loadAccounts();
const initialUser = loadCurrentUser(initialAccounts);
const initialNavigation = loadInitialNavigation();
const productionBackendEnabled = shouldUseSupabase();
const initialCourses = productionBackendEnabled ? [] : fallbackCourses;
const initialAssignments = productionBackendEnabled ? [] : fallbackAssignments;
const initialQuizzes = productionBackendEnabled ? [] : fallbackQuizzes;
const initialPricingPlans = productionBackendEnabled ? [] : fallbackPricingPlans;
const initialCohorts = productionBackendEnabled ? [] : seedCohorts();

function logBackendError(error: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'BACKEND_SETUP_REQUIRED'
    ) {
      console.info('Supabase LMS setup required. Apply the SQL migrations in SUPABASE_SETUP.md.');
      return;
    }

    console.error('Supabase LMS repository error:', error);
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state — loaded from localStorage
  currentView: initialNavigation.currentView,
  selectedCourseId: initialNavigation.selectedCourseId,
  selectedLessonId: initialNavigation.selectedLessonId,
  selectedCredentialId: loadFromStorage<string | null>('marokand_credentialId', null),
  sidebarOpen: false,

  user: initialUser,
  accounts: initialAccounts,
  authLoading: productionBackendEnabled,
  dataLoading: productionBackendEnabled,
  backendError: null,
  backendInitialized: false,
  courses: initialCourses,
  assignments: initialAssignments,
  quizzes: initialQuizzes,
  pricingPlans: initialPricingPlans,
  enrollments: loadFromStorage<Enrollment[]>('marokand_enrollments', []),
  lessonProgress: loadFromStorage<LessonProgress[]>('marokand_progress', []),
  lessonActivity: loadFromStorage<Record<string, string>>('marokand_lesson_activity', {}),
  notes: loadFromStorage<Note[]>('marokand_notes', []),
  certificates: loadFromStorage<Certificate[]>('marokand_certificates', []),
  quizAttempts: loadFromStorage<QuizAttempt[]>('marokand_quizAttempts', []),
  submissions: loadFromStorage<AssignmentSubmission[]>('marokand_submissions', []),
  managedCourses: normalizeManagedCourses(loadFromStorage<ManagedCourseDraft[]>('marokand_managed_courses', [])),
  leads: loadFromStorage<LeadSubmission[]>('marokand_leads', []),
  analyticsEvents: loadFromStorage<AnalyticsEvent[]>('marokand_analytics_events', []),
  applications: loadFromStorage<StudentApplication[]>('marokand_applications', []),
  cohorts: loadFromStorage<Cohort[]>('marokand_cohorts', initialCohorts),
  cohortEnrollments: loadFromStorage<CohortEnrollment[]>('marokand_cohort_enrollments', []),
  attendance: loadFromStorage<LessonAttendance[]>('marokand_attendance', []),
  crmRecords: loadFromStorage<CrmRecord[]>('marokand_crm_records', []),
  auditLogs: loadFromStorage<Record<string, unknown>[]>('marokand_audit_logs', []),
  discussions: loadFromStorage<Discussion[]>('marokand_discussions', []),

  // Notifications — default notifications for trucking dispatch context
  notifications: loadFromStorage<AppNotification[]>('marokand_notifications', [
    { id: 'notif-1', type: 'course_update', title: 'New lesson available: HOS Regulations', message: 'A new lesson has been added to the HOS / ELD Basics course covering the latest FMCSA rule updates.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false },
    { id: 'notif-2', type: 'assignment', title: 'Your Broker Mail exercise was graded', message: 'You scored 92% on the Rate Negotiation email exercise. Great work on your broker communication skills!', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), read: false },
    { id: 'notif-3', type: 'achievement', title: 'Achievement unlocked: 5-Day Streak', message: 'You\'ve studied for 5 days in a row! Keep the momentum going — consistent practice makes perfect dispatchers.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: false },
    { id: 'notif-4', type: 'system', title: 'Platform maintenance scheduled', message: 'Marokand Humo Academy will undergo scheduled maintenance this Sunday from 2:00 AM to 4:00 AM EST.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), read: true },
    { id: 'notif-5', type: 'discussion_reply', title: 'New reply to your discussion', message: 'Instructor Alisher replied to your question about deadhead miles in the Dispatch Fundamentals forum.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: false },
    { id: 'notif-6', type: 'course_update', title: 'Course updated: Load Board Training', message: 'New lesson "Avoiding Load Board Scams" has been published. Learn how to protect yourself from double-brokering.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), read: true },
    { id: 'notif-7', type: 'achievement', title: 'Achievement unlocked: First Quiz Passed', message: 'You passed the Dispatch Fundamentals quiz with 90%! Your certificate of completion is ready.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true },
    { id: 'notif-8', type: 'assignment', title: 'New assignment: Dispatch a Load', message: 'Your instructor assigned "Handling Your First Load" in the Dispatch Fundamentals course. Due in 3 days.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), read: false },
    { id: 'notif-9', type: 'system', title: 'Welcome to Marokand Humo Academy!', message: 'Start exploring courses and kick off your trucking dispatch career. Complete your profile to unlock all features.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), read: true },
    { id: 'notif-10', type: 'discussion_reply', title: 'Peer replied to your post', message: 'Sarah M. replied to your question about RPM calculation in the Load Board Training discussion.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(), read: true },
  ]),
  notificationPanelOpen: false,

  // Bookmarks
  bookmarkedCourseIds: loadFromStorage<string[]>('marokand_bookmarks', []),

  // Course Notes (enhanced) — default notes
  courseNotes: loadFromStorage<CourseNote[]>('marokand_courseNotes', [
    { id: 'cn-1', courseId: 'course-1', courseName: 'Dispatch Fundamentals', lessonId: 'lesson-1-1', lessonTitle: 'Introduction to Dispatching', content: `**Key takeaway**: A dispatcher is the liaison between the broker/shipper and the driver. They handle rate negotiation, route planning, and problem-solving.\n\n- Always confirm load details in writing\n- Keep records of all communication\n- Understand the difference between asset-based and brokerage operations`, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'cn-2', courseId: 'course-1', courseName: 'Dispatch Fundamentals', lessonId: 'lesson-1-3', lessonTitle: 'Rate Negotiation Basics', content: `RPM (Revenue Per Mile) = Total Rate / Total Miles\n\n*Minimum acceptable RPM varies by:*\n- Equipment type\n- Lane (region)\n- Market conditions\n- Deadhead miles to pickup\n\n**Rule of thumb**: Never accept below $2.00/mile for dry van in current market`, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    { id: 'cn-3', courseId: 'course-2', courseName: 'HOS / ELD Basics', lessonId: 'lesson-2-2', lessonTitle: 'Hours of Service Regulations', content: `11-hour driving limit after 10 consecutive hours off duty\n14-hour on-duty window\n30-minute break required after 8 hours of driving\n\n*60-hour/7-day limit* or *70-hour/8-day limit*\n\nSleeper berth provision: 8+2 or 7+3 split`, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'cn-4', courseId: 'course-3', courseName: 'Load Board Mastery', lessonId: 'lesson-3-1', lessonTitle: 'Reading Load Board Posts', content: `**Red flags on load board posts:**\n- Rate too good to be true → likely double-brokering\n- Vague pickup/delivery locations\n- No weight listed\n- "Call for rate" → usually lowball\n\nAlways check broker credit score before booking!`, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
    { id: 'cn-5', courseId: 'course-4', courseName: 'Broker Communication', lessonId: 'lesson-4-2', lessonTitle: 'Writing Professional Emails', content: `Email structure for broker communication:\n1. Subject line: Load ID + Lane (e.g., "RE: #12345 CHI-ATL")\n2. Brief greeting\n3. State your availability and equipment\n4. Quote your rate with justification\n5. Professional closing\n\n*Always* include your MC/DOT number in signature`, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
    { id: 'cn-6', courseId: 'course-2', courseName: 'HOS / ELD Basics', lessonId: 'lesson-2-4', lessonTitle: 'ELD Compliance', content: `ELD mandate applies to most CMV drivers\n\nExemptions:\n- Short-haul (100 air-mile radius)\n- Driveaway-towaway\n- Pre-2000 model year engines\n\n**Important**: Paper logs are only allowed when ELD malfunctions and must be replaced within 8 days`, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
  ]),

  // User Preferences — defaults
  userPreferences: loadFromStorage<UserPreferences>('marokand_preferences', {
    name: '',
    bio: '',
    timezone: 'America/New_York',
    studyTimerDuration: 25,
    dailyGoalHours: 2,
    preferredDifficulty: 'intermediate',
    autoPlayNextLesson: true,
    emailNotifications: true,
    achievementAlerts: true,
    courseUpdateAlerts: true,
    discussionReplyAlerts: true,
    theme: 'system',
    fontSize: 'medium',
    sidebarCollapsedDefault: false,
    profileVisibility: 'public',
    showOnLeaderboard: true,
    nextWeekGoals: '',
  }),

  // Toolkit Favorites
  toolkitFavoriteIds: loadFromStorage<string[]>('marokand_toolkit_favorites', []),

  // Saved Jobs
  savedJobIds: loadFromStorage<string[]>('marokand_saved_jobs', []),

  // Joined Study Groups
  joinedGroupIds: loadFromStorage<string[]>('marokand_joined_groups', []),

  // Glossary Favorites
  glossaryFavoriteIds: loadFromStorage<string[]>('marokand_glossary_favorites', []),

  // Assigned Mentor
  assignedMentorId: loadFromStorage<string | null>('marokand_assigned_mentor', null),

  // Resource Ratings
  resourceRatings: loadFromStorage<Record<string, number>>('marokand_resource_ratings', {}),

  // Downloaded Resources
  downloadedResourceIds: loadFromStorage<string[]>('marokand_downloaded_resources', []),

  // Navigation
  navigate: (view, courseId, lessonId) => {
    const state: Partial<AppState> = {
      currentView: view,
      selectedCourseId: courseId ?? null,
      selectedLessonId: lessonId ?? null,
    };
    saveToStorage('marokand_view', view);
    saveToStorage('marokand_courseId', courseId ?? null);
    saveToStorage('marokand_lessonId', lessonId ?? null);
    // Update URL hash for proper navigation tracking
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      params.set('view', view);
      if (courseId) params.set('course', courseId);
      if (lessonId) params.set('lesson', lessonId);
      window.history.pushState(null, '', `?${params.toString()}`);
    }
    set(state);
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  // Auth
  initializeBackend: async () => {
    if (!productionBackendEnabled) {
      set({ authLoading: false, dataLoading: false, backendInitialized: true });
      return;
    }

    if (get().backendInitialized) return;

    set({ authLoading: true, dataLoading: true, backendError: null });

    const session = await authRepository.getSessionUser();
    if (session.error) {
      logBackendError(session.error);
      set({
        authLoading: false,
        dataLoading: false,
        backendInitialized: true,
        backendError: session.error.message,
        user: null,
      });
      return;
    }

    set({
      user: session.data.user,
      authLoading: false,
      backendInitialized: true,
    });

    await get().refreshBackendData();

    authRepository.onAuthStateChange((_event, authSession) => {
      void (async () => {
        if (!authSession?.user) {
          set({ user: null });
          return;
        }

        const profile = await authRepository.fetchProfile(authSession.user.id);
        if (profile.error) {
          set({ user: null, backendError: profile.error.message });
          return;
        }

        set({ user: profile.data, backendError: null });
        await get().refreshBackendData();
      })();
    });
  },

  refreshBackendData: async () => {
    if (!productionBackendEnabled) return;

    set({ dataLoading: true, backendError: null });

    const [catalog, cohorts] = await Promise.all([
      courseRepository.listLmsCatalog(),
      operationsRepository.listCohorts(),
    ]);
    if (!get().user) {
      if (catalog.error ?? cohorts.error) {
        logBackendError(catalog.error ?? cohorts.error);
      }
      set({
        courses: catalog.data?.courses ?? get().courses,
        assignments: catalog.data?.assignments ?? get().assignments,
        quizzes: catalog.data?.quizzes ?? get().quizzes,
        pricingPlans: catalog.data?.pricingPlans ?? get().pricingPlans,
        cohorts: cohorts.data ?? get().cohorts,
        dataLoading: false,
        backendError: catalog.error?.message ?? cohorts.error?.message ?? null,
      });
      return;
    }

    const [
      enrollments,
      lessonProgress,
      notes,
      quizAttempts,
      submissions,
      certificates,
      discussions,
      accounts,
      managedCourses,
      operationsData,
    ] = await Promise.all([
      courseRepository.listEnrollments(),
      progressRepository.listLessonProgress(),
      progressRepository.listNotes(),
      progressRepository.listQuizAttempts(),
      assignmentRepository.listSubmissions(),
      certificateRepository.listCertificates(),
      discussionRepository.listDiscussions(),
      authRepository.listProfiles(),
      teacherRepository.listManagedCourses(),
      operationsRepository.listOperationsData(),
    ]);

    const firstError =
      catalog.error ??
      enrollments.error ??
      lessonProgress.error ??
      notes.error ??
      quizAttempts.error ??
      submissions.error ??
      certificates.error ??
      discussions.error ??
      accounts.error ??
      managedCourses.error ??
      operationsData.error;

    if (firstError) {
      logBackendError(firstError);
    }

    const hydratedCourses = catalog.data?.courses ?? get().courses;
    const hydratedCourseNotes =
      notes.data?.map((note) => {
        const course = hydratedCourses.find((item) => item.id === note.courseId);
        const lesson = course?.lessons.find((item) => item.id === note.lessonId);
        return {
          id: note.id,
          courseId: note.courseId ?? course?.id ?? '',
          courseName: course?.title ?? 'Course',
          lessonId: note.lessonId ?? '',
          lessonTitle: lesson?.title ?? 'Lesson',
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        };
      }).filter((note) => note.courseId && note.lessonId) ?? get().courseNotes;

    set({
      courses: hydratedCourses,
      assignments: catalog.data?.assignments ?? get().assignments,
      quizzes: catalog.data?.quizzes ?? get().quizzes,
      pricingPlans: catalog.data?.pricingPlans ?? get().pricingPlans,
      enrollments: enrollments.data ?? get().enrollments,
      lessonProgress: lessonProgress.data ?? get().lessonProgress,
      notes: notes.data ?? get().notes,
      quizAttempts: quizAttempts.data ?? get().quizAttempts,
      submissions: submissions.data ?? get().submissions,
      certificates: certificates.data ?? get().certificates,
      discussions: discussions.data ?? get().discussions,
      courseNotes: hydratedCourseNotes,
      accounts: accounts.data ?? get().accounts,
      managedCourses: managedCourses.data ?? get().managedCourses,
      applications: operationsData.data?.applications ?? get().applications,
      cohorts: operationsData.data?.cohorts ?? cohorts.data ?? get().cohorts,
      cohortEnrollments: operationsData.data?.cohortEnrollments ?? get().cohortEnrollments,
      attendance: operationsData.data?.attendance ?? get().attendance,
      crmRecords: operationsData.data?.crmRecords ?? get().crmRecords,
      auditLogs: operationsData.data?.auditLogs ?? get().auditLogs,
      dataLoading: false,
      backendError: firstError?.message ?? null,
    });
  },

  retryBackend: async () => {
    set({ backendInitialized: false });
    await get().initializeBackend();
  },

  login: async (email, password) => {
    if (productionBackendEnabled) {
      set({ authLoading: true, backendError: null });
      const result = await authRepository.signIn(email, password);
      if (result.error) {
        logBackendError(result.error);
        set({ authLoading: false, backendError: result.error.message });
        return false;
      }

      set({ user: result.data.user, authLoading: false });
      await get().refreshBackendData();
      return true;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const accounts = loadAccounts();
    const account = accounts.find((a) => a.email === normalizedEmail);
    if (!account || account.status !== 'active' || account.passwordHash !== hashPassword(password)) {
      return false;
    }

    const updatedAccount = { ...account, lastLoginAt: new Date().toISOString() };
    const updatedAccounts = accounts.map((a) => (a.id === account.id ? updatedAccount : a));
    const user = publicUser(updatedAccount);
    saveToStorage('marokand_accounts', updatedAccounts);
    saveToStorage('marokand_user', user);
    set({ accounts: updatedAccounts, user });
    return true;
  },

  signup: async (name, email, password) => {
    if (productionBackendEnabled) {
      set({ authLoading: true, backendError: null });
      const result = await authRepository.signUp(name, email, password);
      if (result.error) {
        logBackendError(result.error);
        set({ authLoading: false, backendError: result.error.message });
        return false;
      }

      if (result.data.user) {
        set({ user: result.data.user, authLoading: false });
        await get().refreshBackendData();
      } else {
        set({ authLoading: false });
      }

      return true;
    }

    const created = await get().createAccount({ name, email, password, role: 'student' });
    if (created) {
      await get().login(email, password);
    }
    return created;
  },

  createAccount: async ({ name, email, password, role }) => {
    if (productionBackendEnabled) {
      const created = await adminRepository.createAccount({ name, email, password, role });
      if (created.error) {
        logBackendError(created.error);
        set({ backendError: created.error.message });
        return false;
      }

      const accounts = [created.data, ...get().accounts.filter((account) => account.id !== created.data.id)];
      set({ accounts, backendError: null });
      return true;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const accounts = loadAccounts();
    if (accounts.some((a) => a.email === normalizedEmail)) {
      return false;
    }
    const nextRole = normalizeRole(role);
    const account: PlatformAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: normalizedEmail,
      name: name.trim(),
      role: nextRole,
      avatar: '',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
      status: 'active',
    };
    const updatedAccounts = [...accounts, account];
    const auditLogs = appendLocalAuditLog('admin_action', get().user?.id, {
      action: 'create_account',
      role: nextRole,
      user_id: account.id,
    });
    saveToStorage('marokand_accounts', updatedAccounts);
    set({ accounts: updatedAccounts, auditLogs });
    return true;
  },

  updateUserRole: (userId, role) => {
    const nextRole = normalizeRole(role);
    if (productionBackendEnabled) {
      void adminRepository.updateRole(userId, nextRole).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
          return;
        }

        const accounts = get().accounts.map((account) =>
          account.id === userId ? { ...account, role: nextRole } : account
        );
        const currentUser = get().user;
        const updatedUser = currentUser?.id === userId ? { ...currentUser, role: nextRole } : currentUser;
        set({ accounts, user: updatedUser ?? null, backendError: null });
        void get().refreshBackendData();
      });
      return;
    }

    const accounts = get().accounts.map((account) =>
      account.id === userId ? { ...account, role: nextRole } : account
    );
    const currentUser = get().user;
    const updatedUser = currentUser?.id === userId ? { ...currentUser, role: nextRole } : currentUser;
    const nextUser = updatedUser ?? null;
    const auditLogs = appendLocalAuditLog('role_change', get().user?.id, { user_id: userId, role: nextRole });
    saveToStorage('marokand_accounts', accounts);
    saveToStorage('marokand_user', nextUser);
    set({ accounts, user: nextUser, auditLogs });
  },

  updateAccountStatus: (userId, status) => {
    if (productionBackendEnabled) {
      void adminRepository.updateAccountStatus(userId, status).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
          return;
        }

        const accounts = get().accounts.map((account) =>
          account.id === userId ? { ...account, status } : account
        );
        const currentUser = get().user;
        const nextUser = currentUser?.id === userId && status !== 'active' ? null : currentUser;
        set({ accounts, user: nextUser, backendError: null });
        get().recordAnalyticsEvent({ type: 'account_status_changed', userId });
        void get().refreshBackendData();
      });
      return;
    }

    const accounts = get().accounts.map((account) =>
      account.id === userId ? { ...account, status } : account
    );
    const currentUser = get().user;
    const nextUser = currentUser?.id === userId && status !== 'active' ? null : currentUser;
    const auditLogs = appendLocalAuditLog('account_status_changed', currentUser?.id, { user_id: userId, status });
    saveToStorage('marokand_accounts', accounts);
    saveToStorage('marokand_user', nextUser);
    set({ accounts, user: nextUser, auditLogs });
    get().recordAnalyticsEvent({ type: 'account_status_changed', userId });
  },

  resetPassword: async (email) => {
    if (productionBackendEnabled) {
      const result = await authRepository.resetPassword(email);
      if (result.error) {
        logBackendError(result.error);
        set({ backendError: result.error.message });
        return false;
      }
      return true;
    }

    const normalizedEmail = email.trim().toLowerCase();
    return get().accounts.some((account) => account.email === normalizedEmail && account.status === 'active');
  },

  updateProfile: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const user = { ...currentUser, ...updates };
    const accounts = get().accounts.map((account) =>
      account.id === user.id ? { ...account, ...updates } : account
    );
    saveToStorage('marokand_accounts', accounts);
    saveToStorage('marokand_user', user);
    set({ accounts, user });
    if (productionBackendEnabled) {
      void authRepository.updateProfileBasics(updates).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({ user: result.data });
        }
      });
    }
  },
  logout: async (redirectView = 'landing') => {
    if (productionBackendEnabled) {
      const result = await authRepository.signOut();
      if (result.error) {
        logBackendError(result.error);
        set({ backendError: result.error.message });
      }
    }

    saveToStorage('marokand_user', null);
    saveToStorage('marokand_view', redirectView);
    saveToStorage('marokand_courseId', null);
    saveToStorage('marokand_lessonId', null);
    saveToStorage('marokand_credentialId', null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', redirectView === 'landing' ? '/' : `?view=${redirectView}`);
    }
    set({
      user: null,
      currentView: redirectView,
      selectedCourseId: null,
      selectedLessonId: null,
      selectedCredentialId: null,
    });
  },

  // Enrollment
  enrollCourse: (courseId) => {
    const { user, enrollments } = get();
    if (!user) return;

    // Check if already enrolled
    if (enrollments.find((e) => e.userId === user.id && e.courseId === courseId && e.status === 'active')) {
      return;
    }

    if (productionBackendEnabled) {
      void courseRepository.enroll(courseId).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          return;
        }

        set({
          enrollments: [
            result.data,
            ...get().enrollments.filter((item) => !(item.userId === result.data.userId && item.courseId === result.data.courseId)),
          ],
          backendError: null,
        });
        get().recordAnalyticsEvent({ type: 'course_enrollment', userId: user.id, courseId });
      });
      return;
    }

    const enrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      userId: user.id,
      courseId,
      status: 'active',
      enrolledAt: new Date().toISOString(),
    };

    const updated = [...enrollments, enrollment];
    saveToStorage('marokand_enrollments', updated);
    set({ enrollments: updated });
    get().recordAnalyticsEvent({ type: 'course_enrollment', userId: user.id, courseId });
  },

  dropCourse: (courseId) => {
    const { user, enrollments } = get();
    if (!user) return;

    if (productionBackendEnabled) {
      void courseRepository.dropCourse(courseId).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
          return;
        }

        set({
          enrollments: get().enrollments.map((e) =>
            e.userId === user.id && e.courseId === courseId && e.status === 'active'
              ? { ...e, status: 'dropped' as const }
              : e
          ),
          backendError: null,
        });
      });
      return;
    }

    const updated = enrollments.map((e) =>
      e.userId === user.id && e.courseId === courseId && e.status === 'active'
        ? { ...e, status: 'dropped' as const }
        : e
    );
    saveToStorage('marokand_enrollments', updated);
    set({ enrollments: updated });
  },

  // Progress
  updateProgress: (lessonId, completed, checklistData) => {
    const { user, lessonProgress } = get();
    if (!user) return;

    const existing = lessonProgress.find(
      (p) => p.userId === user.id && p.lessonId === lessonId
    );

    let updated: LessonProgress[];
    if (existing) {
      updated = lessonProgress.map((p) =>
        p.id === existing.id
          ? {
              ...p,
              completed,
              checklistData: checklistData ?? p.checklistData,
              completedAt: completed ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            }
          : p
      );
    } else {
      const newProgress: LessonProgress = {
        id: `progress-${Date.now()}`,
        userId: user.id,
        lessonId,
        completed,
        checklistData: checklistData ?? {},
        completedAt: completed ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      updated = [...lessonProgress, newProgress];
    }

    const lessonActivity = { ...get().lessonActivity, [lessonId]: new Date().toISOString() };
    if (productionBackendEnabled) {
      const progress = updated.find((item) => item.userId === user.id && item.lessonId === lessonId);
      if (progress) {
        void progressRepository.upsertLessonProgress(progress).then((result) => {
          if (result.error) {
            logBackendError(result.error);
            set({ backendError: result.error.message });
          } else {
            set({
              lessonProgress: [
                result.data,
                ...get().lessonProgress.filter((item) => !(item.userId === result.data.userId && item.lessonId === result.data.lessonId)),
              ],
              lessonActivity,
              backendError: null,
            });
            if (completed) {
              get().recordAnalyticsEvent({ type: 'lesson_complete', userId: user.id, lessonId });
            }
          }
        });
      }
      return;
    }

    saveToStorage('marokand_lesson_activity', lessonActivity);
    saveToStorage('marokand_progress', updated);
    const auditLogs = appendLocalAuditLog('lesson_progress_updated', user.id, { lesson_id: lessonId, completed });
    set({ lessonProgress: updated, lessonActivity, auditLogs });
    if (completed) {
      get().recordAnalyticsEvent({ type: 'lesson_complete', userId: user.id, lessonId });
    }
  },

  trackLessonTime: (lessonId, seconds) => {
    const { user, lessonProgress } = get();
    if (!user || seconds <= 0) return;
    const existing = lessonProgress.find((p) => p.userId === user.id && p.lessonId === lessonId);
    const now = new Date().toISOString();
    const updated = existing
      ? lessonProgress.map((progress) =>
          progress.id === existing.id
            ? {
                ...progress,
                timeSpentSeconds: (progress.timeSpentSeconds ?? 0) + seconds,
                updatedAt: now,
              }
            : progress
        )
      : [
          ...lessonProgress,
          {
            id: `progress-${Date.now()}`,
            userId: user.id,
            lessonId,
            completed: false,
            checklistData: {},
            updatedAt: now,
            timeSpentSeconds: seconds,
          },
        ];
    const lessonActivity = { ...get().lessonActivity, [lessonId]: now };
    if (productionBackendEnabled) {
      const progress = updated.find((item) => item.userId === user.id && item.lessonId === lessonId);
      if (progress) {
        void progressRepository.upsertLessonProgress(progress).then((result) => {
          if (result.error) {
            logBackendError(result.error);
            set({ backendError: result.error.message });
          } else {
            set({
              lessonProgress: [
                result.data,
                ...get().lessonProgress.filter((item) => !(item.userId === result.data.userId && item.lessonId === result.data.lessonId)),
              ],
              lessonActivity,
              backendError: null,
            });
          }
        });
      }
      return;
    }

    saveToStorage('marokand_progress', updated);
    saveToStorage('marokand_lesson_activity', lessonActivity);
    set({ lessonProgress: updated, lessonActivity });
  },

  // Notes
  addNote: (content, lessonId, courseId) => {
    const { user, notes } = get();
    if (!user) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      userId: user.id,
      lessonId,
      courseId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...notes, note];
    saveToStorage('marokand_notes', updated);
    set({ notes: updated });
    if (productionBackendEnabled) {
      void progressRepository.addNote(note).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            notes: [result.data, ...get().notes.filter((item) => item.id !== note.id)],
            backendError: null,
          });
        }
      });
    }
  },

  updateNote: (noteId, content) => {
    const updated = get().notes.map((n) =>
      n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
    );
    saveToStorage('marokand_notes', updated);
    set({ notes: updated });
    if (productionBackendEnabled) {
      void progressRepository.updateNote(noteId, content).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        }
      });
    }
  },

  deleteNote: (noteId) => {
    const updated = get().notes.filter((n) => n.id !== noteId);
    saveToStorage('marokand_notes', updated);
    set({ notes: updated });
    if (productionBackendEnabled) {
      void progressRepository.deleteNote(noteId).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        }
      });
    }
  },

  // Quiz
  submitQuizAttempt: (attempt) => {
    if (productionBackendEnabled) {
      void progressRepository.submitQuizAttempt(attempt).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            quizAttempts: [result.data, ...get().quizAttempts.filter((item) => item.id !== result.data.id)],
            backendError: null,
          });
        }
      });
      return;
    }

    const updated = [...get().quizAttempts, attempt];
    const auditLogs = appendLocalAuditLog('quiz_attempt_submitted', get().user?.id, { quiz_id: attempt.quizId });
    saveToStorage('marokand_quizAttempts', updated);
    set({ quizAttempts: updated, auditLogs });
  },

  // Assignment
  submitAssignment: (submission) => {
    if (productionBackendEnabled) {
      void assignmentRepository.submitAssignment(submission).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            submissions: [result.data, ...get().submissions.filter((item) => item.id !== result.data.id)],
            backendError: null,
          });
        }
      });
      return;
    }

    const updated = [...get().submissions, submission];
    const auditLogs = appendLocalAuditLog('assignment_submitted', get().user?.id, {
      assignment_id: submission.assignmentId,
      submission_id: submission.id,
    });
    saveToStorage('marokand_submissions', updated);
    set({ submissions: updated, auditLogs });
  },

  reviewAssignmentSubmission: (submissionId, review) => {
    const { user } = get();
    if (productionBackendEnabled) {
      void assignmentRepository.reviewSubmission(submissionId, review).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            submissions: get().submissions.map((submission) =>
              submission.id === submissionId ? result.data : submission
            ),
            backendError: null,
          });
          get().recordAnalyticsEvent({
            type: 'assignment_reviewed',
            userId: result.data.userId,
          });
        }
      });
      return;
    }

    const updated = get().submissions.map((submission) =>
      submission.id === submissionId
        ? {
            ...submission,
            status: review.status,
            score: review.score ?? submission.score,
            feedback: review.feedback ?? submission.feedback,
            reviewedAt: new Date().toISOString(),
            reviewedBy: user?.id,
          }
        : submission
    );
    const auditLogs = appendLocalAuditLog('assignment_reviewed', user?.id, {
      submission_id: submissionId,
      status: review.status,
      score: review.score,
    });
    const reviewedSubmission = updated.find((submission) => submission.id === submissionId);
    saveToStorage('marokand_submissions', updated);
    set({ submissions: updated, auditLogs });
    get().recordAnalyticsEvent({
      type: 'assignment_reviewed',
      userId: reviewedSubmission?.userId,
    });
  },

  // Certificate
  issueCertificate: (certificate) => {
    if (productionBackendEnabled) {
      void certificateRepository.issueIfEligible(certificate.courseId).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            certificates: [result.data, ...get().certificates.filter((item) => item.courseId !== result.data.courseId)],
            backendError: null,
          });
          get().recordAnalyticsEvent({ type: 'certificate_issued', userId: result.data.userId, courseId: result.data.courseId });
        }
      });
      return;
    }

    const cert: Certificate = {
      ...certificate,
      verified: false,
      status: certificate.status ?? 'pending',
    };
    const updated = [...get().certificates, cert];
    saveToStorage('marokand_certificates', updated);
    set({ certificates: updated });
    get().recordAnalyticsEvent({ type: 'certificate_issued', userId: certificate.userId, courseId: certificate.courseId });
  },

  approveCertificate: (certificateId, approved) => {
    const { user } = get();
    if (productionBackendEnabled) {
      void certificateRepository.approveCertificate(certificateId, approved).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            certificates: get().certificates.map((certificate) =>
              certificate.id === certificateId ? result.data : certificate
            ),
            backendError: null,
          });
        }
      });
      return;
    }

    const updated = get().certificates.map((certificate) =>
      certificate.id === certificateId
        ? {
            ...certificate,
            verified: approved,
            status: approved ? 'approved' as const : 'rejected' as const,
            approvedAt: approved ? new Date().toISOString() : undefined,
            approvedBy: approved ? user?.id : undefined,
          }
        : certificate
    );
    const auditLogs = appendLocalAuditLog('certificate_reviewed', user?.id, { certificate_id: certificateId, approved });
    saveToStorage('marokand_certificates', updated);
    set({ certificates: updated, auditLogs });
  },

  verifyCredential: async (credentialId) => {
    if (productionBackendEnabled) {
      const result = await certificateRepository.verifyCredential(credentialId);
      if (result.error) {
        logBackendError(result.error);
        set({ backendError: result.error.message });
        return null;
      }
      return result.data;
    }

    return get().certificates.find((c) => c.credentialId === credentialId && c.verified && c.status !== 'rejected') ?? null;
  },

  submitLead: (lead) => {
    const isProductionBackend = productionBackendEnabled;
    const item: LeadSubmission = {
      ...lead,
      id: `lead-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().leads, item];
    saveToStorage('marokand_leads', updated);
    if (isProductionBackend) {
      set({ leads: updated });
      void operationsRepository.createCrmLead({
        name: lead.name,
        email: lead.email,
        source: lead.type,
        notes: [lead.subject, lead.courseInterest, lead.message].filter(Boolean).join('\n'),
      }).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            crmRecords: [result.data, ...get().crmRecords.filter((record) => record.id !== result.data.id)],
            backendError: null,
          });
        }
      });
      return;
    }

    const auditLogs = appendLocalAuditLog('crm_record_created', get().user?.id, {
      lead_id: item.id,
      email: item.email,
      source: item.type,
    });
    set({ leads: updated, auditLogs });
  },

  recordAnalyticsEvent: (event) => {
    const item: AnalyticsEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().analyticsEvents, item].slice(-1000);
    saveToStorage('marokand_analytics_events', updated);
    set({ analyticsEvents: updated });
    if (productionBackendEnabled) {
      void adminRepository.logAnalyticsEvent(event).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        }
      });
    }
  },

  assignCourseToStudent: (userId, courseId) => {
    const { enrollments } = get();
    const existing = enrollments.find(
      (enrollment) =>
        enrollment.userId === userId &&
        enrollment.courseId === courseId &&
        enrollment.status === 'active'
    );
    if (existing) return;

    if (productionBackendEnabled) {
      void adminRepository.assignCourse(userId, courseId).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            enrollments: [
              result.data,
              ...get().enrollments.filter((item) => !(item.userId === userId && item.courseId === courseId)),
            ],
            backendError: null,
          });
          get().recordAnalyticsEvent({ type: 'course_assigned', userId, courseId });
        }
      });
      return;
    }

    const enrollment: Enrollment = {
      id: `enroll-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      courseId,
      status: 'active',
      enrolledAt: new Date().toISOString(),
    };
    const updated = [...enrollments, enrollment];
    const auditLogs = appendLocalAuditLog('course_assigned', get().user?.id, { user_id: userId, course_id: courseId });
    saveToStorage('marokand_enrollments', updated);
    set({ enrollments: updated, auditLogs });
    get().recordAnalyticsEvent({ type: 'course_assigned', userId, courseId });
  },

  submitApplication: async (application) => {
    const isProductionBackend = productionBackendEnabled;
    const now = new Date().toISOString();
    const item: StudentApplication = {
      ...application,
      id: `application-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      status: 'applied',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [item, ...get().applications];
    saveToStorage('marokand_applications', updated);
    if (isProductionBackend) {
      set({ applications: updated });
    } else {
      const auditLogs = appendLocalAuditLog('student_application_submitted', get().user?.id, {
        application_id: item.id,
        email: item.email,
      });
      set({ applications: updated, auditLogs });
    }

    if (isProductionBackend) {
      const result = await operationsRepository.submitApplication(application);
      if (result.error) {
        logBackendError(result.error);
        set({ backendError: result.error.message });
        return false;
      }
      set({
        applications: [result.data, ...get().applications.filter((entry) => entry.id !== item.id)],
        backendError: null,
      });
    }

    return true;
  },

  updateApplicationStatus: (applicationId, status) => {
    if (productionBackendEnabled) {
      void operationsRepository.updateApplicationStatus(applicationId, status).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            applications: get().applications.map((application) =>
              application.id === applicationId ? result.data : application
            ),
            backendError: null,
          });
        }
      });
      return;
    }

    const updated = get().applications.map((application) =>
      application.id === applicationId
        ? {
            ...application,
            status,
            reviewerId: get().user?.id,
            reviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : application
    );
    const auditLogs = appendLocalAuditLog('application_status_changed', get().user?.id, { application_id: applicationId, status });
    saveToStorage('marokand_applications', updated);
    set({ applications: updated, auditLogs });
  },

  recordAttendance: (attendanceInput) => {
    const { user } = get();
    const now = new Date().toISOString();
    const existing = get().attendance.find(
      (attendance) => attendance.userId === attendanceInput.userId && attendance.lessonId === attendanceInput.lessonId
    );
    const item: LessonAttendance = {
      id: existing?.id ?? `attendance-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: attendanceInput.userId,
      courseId: attendanceInput.courseId,
      lessonId: attendanceInput.lessonId,
      cohortId: attendanceInput.cohortId,
      status: attendanceInput.status,
      attendedAt: attendanceInput.status === 'present' || attendanceInput.status === 'late' ? now : existing?.attendedAt,
      recordedBy: user?.id,
      notes: attendanceInput.notes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (productionBackendEnabled) {
      void operationsRepository.recordAttendance(attendanceInput).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            attendance: [result.data, ...get().attendance.filter((attendance) => attendance.id !== result.data.id)],
            backendError: null,
          });
        }
      });
      return;
    }

    const updated = [item, ...get().attendance.filter((attendance) => attendance.id !== item.id)];
    const auditLogs = appendLocalAuditLog('attendance_recorded', user?.id, {
      user_id: attendanceInput.userId,
      course_id: attendanceInput.courseId,
      lesson_id: attendanceInput.lessonId,
      status: attendanceInput.status,
    });
    saveToStorage('marokand_attendance', updated);
    set({ attendance: updated, auditLogs });
  },

  updateCrmRecord: (recordId, updates) => {
    const now = new Date().toISOString();

    if (productionBackendEnabled) {
      void operationsRepository.updateCrmRecord(recordId, updates).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            crmRecords: get().crmRecords.map((record) =>
              record.id === recordId ? result.data : record
            ),
            backendError: null,
          });
        }
      });
      return;
    }

    const updated = get().crmRecords.map((record) =>
      record.id === recordId
        ? {
            ...record,
            ...updates,
            lastContactAt: now,
            updatedAt: now,
          }
        : record
    );
    const auditLogs = appendLocalAuditLog('crm_record_updated', get().user?.id, {
      crm_record_id: recordId,
      status: updates.status,
      follow_up_at: updates.followUpAt,
    });
    saveToStorage('marokand_crm_records', updated);
    set({ crmRecords: updated, auditLogs });
  },

  createManagedCourse: (draft) => {
    const { user } = get();
    if (!user) return undefined;
    const now = new Date().toISOString();
    const course: ManagedCourseDraft = {
      id: `managed-course-${Date.now()}`,
      instructorId: user.id,
      title: draft.title,
      description: draft.description,
      status: 'draft',
      lessons: [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...get().managedCourses, course];
    saveToStorage('marokand_managed_courses', updated);
    if (productionBackendEnabled) {
      set({ managedCourses: updated });
    } else {
      const auditLogs = appendLocalAuditLog('course_created', user.id, { course_id: course.id });
      set({ managedCourses: updated, auditLogs });
    }
    if (productionBackendEnabled) {
      void teacherRepository.createCourse(draft).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            managedCourses: [
              result.data,
              ...get().managedCourses.filter((item) => item.id !== course.id),
            ],
            backendError: null,
          });
          void get().refreshBackendData();
        }
      });
    }
    return course.id;
  },

  updateManagedCourse: (courseId, updates) => {
    const updated = get().managedCourses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : course
    );
    saveToStorage('marokand_managed_courses', updated);
    if (productionBackendEnabled) {
      set({ managedCourses: updated });
    } else {
      const auditLogs = appendLocalAuditLog('course_edited', get().user?.id, { course_id: courseId });
      set({ managedCourses: updated, auditLogs });
    }
    if (productionBackendEnabled) {
      void teacherRepository.updateCourse(courseId, updates).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          void get().refreshBackendData();
        }
      });
    }
  },

  addManagedLesson: (courseId, lesson) => {
    const lessonId = `managed-lesson-${Date.now()}`;
    const updated = get().managedCourses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            updatedAt: new Date().toISOString(),
            lessons: [
              ...course.lessons,
              {
                id: lessonId,
                title: lesson.title,
                content: lesson.content,
                fileName: lesson.fileName,
                durationMin: lesson.durationMin ?? 30,
                duration: `${lesson.durationMin ?? 30} min`,
                type: 'reading' as const,
                published: false,
                resources: [] as ManagedLessonResource[],
              },
            ],
          }
        : course
    );
    saveToStorage('marokand_managed_courses', updated);
    if (productionBackendEnabled) {
      set({ managedCourses: updated });
    } else {
      const auditLogs = appendLocalAuditLog('lesson_edited', get().user?.id, { course_id: courseId, lesson_id: lessonId });
      set({ managedCourses: updated, auditLogs });
    }
    if (productionBackendEnabled) {
      void teacherRepository.addLesson(courseId, lesson).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            managedCourses: get().managedCourses.map((course) =>
              course.id === courseId
                ? {
                    ...course,
                    lessons: [
                      result.data,
                      ...course.lessons.filter((item) => item.id !== lessonId),
                    ],
                  }
                : course
            ),
            backendError: null,
          });
          void get().refreshBackendData();
        }
      });
    }
    return lessonId;
  },

  updateManagedLesson: (courseId, lessonId, updates) => {
    const updated = get().managedCourses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            updatedAt: new Date().toISOString(),
            lessons: course.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, ...updates } : lesson
            ),
          }
        : course
    );
    saveToStorage('marokand_managed_courses', updated);
    if (productionBackendEnabled) {
      set({ managedCourses: updated });
    } else {
      const auditLogs = appendLocalAuditLog('lesson_edited', get().user?.id, { course_id: courseId, lesson_id: lessonId });
      set({ managedCourses: updated, auditLogs });
    }
    if (productionBackendEnabled) {
      void teacherRepository.updateLesson(courseId, lessonId, updates).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          void get().refreshBackendData();
        }
      });
    }
  },

  addManagedResource: (courseId, lessonId, resource) => {
    const item: ManagedLessonResource = {
      ...resource,
      id: `managed-resource-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    const updated = get().managedCourses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            updatedAt: new Date().toISOString(),
            lessons: course.lessons.map((lesson) =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    resources: [...(lesson.resources ?? []), item],
                  }
                : lesson
            ),
          }
        : course
    );
    saveToStorage('marokand_managed_courses', updated);
    if (productionBackendEnabled) {
      set({ managedCourses: updated });
    } else {
      const auditLogs = appendLocalAuditLog('lesson_resource_uploaded', get().user?.id, {
        course_id: courseId,
        lesson_id: lessonId,
        resource_id: item.id,
      });
      set({ managedCourses: updated, auditLogs });
    }
    if (productionBackendEnabled) {
      void teacherRepository.addResource(courseId, lessonId, item).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          void get().refreshBackendData();
        }
      });
    }
  },

  upsertManagedQuiz: (courseId, lessonId, quiz) => {
    const question = {
      id: `managed-question-${Date.now()}`,
      question: quiz.question,
      options: quiz.options,
      correctIndex: quiz.correctIndex,
    };
    const updated = get().managedCourses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            updatedAt: new Date().toISOString(),
            lessons: course.lessons.map((lesson) =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    quiz: lesson.quiz
                      ? {
                          ...lesson.quiz,
                          title: quiz.title,
                          passingScore: quiz.passingScore,
                          questions: [...lesson.quiz.questions, question],
                        }
                      : {
                          id: `managed-quiz-${Date.now()}`,
                          title: quiz.title,
                          passingScore: quiz.passingScore,
                          questions: [question],
                          published: false,
                        },
                  }
                : lesson
            ),
          }
        : course
    );
    saveToStorage('marokand_managed_courses', updated);
    if (productionBackendEnabled) {
      set({ managedCourses: updated });
    } else {
      const managedCourse = updated.find((course) => course.id === courseId);
      const managedLesson = managedCourse?.lessons.find((lesson) => lesson.id === lessonId);
      const auditLogs = appendLocalAuditLog('quiz_saved', get().user?.id, {
        course_id: courseId,
        lesson_id: lessonId,
        quiz_id: managedLesson?.quiz?.id,
      });
      set({ managedCourses: updated, auditLogs });
    }
    if (productionBackendEnabled) {
      const managedCourse = updated.find((course) => course.id === courseId);
      const managedLesson = managedCourse?.lessons.find((lesson) => lesson.id === lessonId);
      if (managedLesson?.quiz) {
        void teacherRepository.upsertQuiz(courseId, lessonId, managedLesson.quiz).then((result) => {
          if (result.error) {
            logBackendError(result.error);
            set({ backendError: result.error.message });
          } else {
            void get().refreshBackendData();
          }
        });
      }
    }
  },

  upsertManagedAssignment: (courseId, lessonId, assignment) => {
    const updated = get().managedCourses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            updatedAt: new Date().toISOString(),
            lessons: course.lessons.map((lesson) =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    assignment: {
                      ...assignment,
                      id: lesson.assignment?.id ?? `managed-assignment-${Date.now()}`,
                      published: lesson.assignment?.published ?? false,
                    },
                  }
                : lesson
            ),
          }
        : course
    );
    saveToStorage('marokand_managed_courses', updated);
    if (productionBackendEnabled) {
      set({ managedCourses: updated });
    } else {
      const managedCourse = updated.find((course) => course.id === courseId);
      const managedLesson = managedCourse?.lessons.find((lesson) => lesson.id === lessonId);
      const auditLogs = appendLocalAuditLog('assignment_saved', get().user?.id, {
        course_id: courseId,
        lesson_id: lessonId,
        assignment_id: managedLesson?.assignment?.id,
      });
      set({ managedCourses: updated, auditLogs });
    }
    if (productionBackendEnabled) {
      const managedCourse = updated.find((course) => course.id === courseId);
      const managedLesson = managedCourse?.lessons.find((lesson) => lesson.id === lessonId);
      if (managedLesson?.assignment) {
        void teacherRepository.upsertAssignment(courseId, lessonId, managedLesson.assignment).then((result) => {
          if (result.error) {
            logBackendError(result.error);
            set({ backendError: result.error.message });
          } else {
            void get().refreshBackendData();
          }
        });
      }
    }
  },

  // Discussion
  addDiscussion: (discussion) => {
    const updated = [...get().discussions, discussion];
    saveToStorage('marokand_discussions', updated);
    set({ discussions: updated });
    if (productionBackendEnabled) {
      void discussionRepository.addDiscussion(discussion).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            discussions: [result.data, ...get().discussions.filter((item) => item.id !== discussion.id)],
            backendError: null,
          });
        }
      });
    }
  },

  addDiscussionReply: (discussionId, reply) => {
    const updated = get().discussions.map((d) =>
      d.id === discussionId ? { ...d, replies: [...d.replies, reply] } : d
    );
    saveToStorage('marokand_discussions', updated);
    set({ discussions: updated });
    if (productionBackendEnabled) {
      void discussionRepository.addReply(reply).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            discussions: get().discussions.map((discussion) =>
              discussion.id === discussionId
                ? {
                    ...discussion,
                    replies: discussion.replies.map((item) => item.id === reply.id ? result.data : item),
                  }
                : discussion
            ),
            backendError: null,
          });
        }
      });
    }
  },

  toggleDiscussionPin: (discussionId) => {
    const updated = get().discussions.map((d) =>
      d.id === discussionId ? { ...d, isPinned: !d.isPinned } : d
    );
    saveToStorage('marokand_discussions', updated);
    set({ discussions: updated });
  },

  // Notifications
  markNotificationRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveToStorage('marokand_notifications', updated);
    set({ notifications: updated });
  },

  markAllNotificationsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    saveToStorage('marokand_notifications', updated);
    set({ notifications: updated });
  },

  setNotificationPanelOpen: (open) => {
    set({ notificationPanelOpen: open });
  },

  unreadNotificationCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  // Bookmarks
  toggleBookmark: (courseId) => {
    const current = get().bookmarkedCourseIds;
    const updated = current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId];
    saveToStorage('marokand_bookmarks', updated);
    set({ bookmarkedCourseIds: updated });
  },

  isBookmarked: (courseId) => {
    return get().bookmarkedCourseIds.includes(courseId);
  },

  // Course Notes (enhanced)
  addCourseNote: (noteData) => {
    const note: CourseNote = {
      ...noteData,
      id: `cn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...get().courseNotes, note];
    saveToStorage('marokand_courseNotes', updated);
    set({ courseNotes: updated });
    if (productionBackendEnabled) {
      void progressRepository.addNote({
        content: note.content,
        courseId: note.courseId,
        lessonId: note.lessonId,
      }).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        } else {
          set({
            courseNotes: [
              { ...note, id: result.data.id, createdAt: result.data.createdAt, updatedAt: result.data.updatedAt },
              ...get().courseNotes.filter((item) => item.id !== note.id),
            ],
            backendError: null,
          });
        }
      });
    }
  },

  updateCourseNote: (noteId, content) => {
    const updated = get().courseNotes.map((n) =>
      n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
    );
    saveToStorage('marokand_courseNotes', updated);
    set({ courseNotes: updated });
    if (productionBackendEnabled) {
      void progressRepository.updateNote(noteId, content).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        }
      });
    }
  },

  deleteCourseNote: (noteId) => {
    const updated = get().courseNotes.filter((n) => n.id !== noteId);
    saveToStorage('marokand_courseNotes', updated);
    set({ courseNotes: updated });
    if (productionBackendEnabled) {
      void progressRepository.deleteNote(noteId).then((result) => {
        if (result.error) {
          logBackendError(result.error);
          set({ backendError: result.error.message });
        }
      });
    }
  },

  // User Preferences
  updateUserPreferences: (prefs) => {
    const updated = { ...get().userPreferences, ...prefs };
    saveToStorage('marokand_preferences', updated);
    set({ userPreferences: updated });
  },

  // Toolkit Favorites
  toggleToolkitFavorite: (termId) => {
    const current = get().toolkitFavoriteIds;
    const updated = current.includes(termId)
      ? current.filter((id) => id !== termId)
      : [...current, termId];
    saveToStorage('marokand_toolkit_favorites', updated);
    set({ toolkitFavoriteIds: updated });
  },

  isToolkitFavorite: (termId) => {
    return get().toolkitFavoriteIds.includes(termId);
  },

  // Saved Jobs
  toggleSavedJob: (jobId) => {
    const current = get().savedJobIds;
    const updated = current.includes(jobId)
      ? current.filter((id) => id !== jobId)
      : [...current, jobId];
    saveToStorage('marokand_saved_jobs', updated);
    set({ savedJobIds: updated });
  },

  isSavedJob: (jobId) => {
    return get().savedJobIds.includes(jobId);
  },

  // Joined Study Groups
  toggleJoinedGroup: (groupId) => {
    const current = get().joinedGroupIds;
    const updated = current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId];
    saveToStorage('marokand_joined_groups', updated);
    set({ joinedGroupIds: updated });
  },

  isJoinedGroup: (groupId) => {
    return get().joinedGroupIds.includes(groupId);
  },

  // Glossary Favorites
  toggleGlossaryFavorite: (termId) => {
    const current = get().glossaryFavoriteIds;
    const updated = current.includes(termId)
      ? current.filter((id) => id !== termId)
      : [...current, termId];
    saveToStorage('marokand_glossary_favorites', updated);
    set({ glossaryFavoriteIds: updated });
  },

  isGlossaryFavorite: (termId) => {
    return get().glossaryFavoriteIds.includes(termId);
  },

  // Mentorship
  assignMentor: (mentorId) => {
    saveToStorage('marokand_assigned_mentor', mentorId);
    set({ assignedMentorId: mentorId });
  },

  removeMentor: () => {
    saveToStorage('marokand_assigned_mentor', null);
    set({ assignedMentorId: null });
  },

  // Resource Ratings
  rateResource: (resourceId, rating) => {
    const updated = { ...get().resourceRatings, [resourceId]: rating };
    saveToStorage('marokand_resource_ratings', updated);
    set({ resourceRatings: updated });
  },

  getResourceRating: (resourceId) => {
    return get().resourceRatings[resourceId] || 0;
  },

  // Resource Downloads
  trackResourceDownload: (resourceId) => {
    const current = get().downloadedResourceIds;
    if (!current.includes(resourceId)) {
      const updated = [...current, resourceId];
      saveToStorage('marokand_downloaded_resources', updated);
      set({ downloadedResourceIds: updated });
    }
  },
}));
