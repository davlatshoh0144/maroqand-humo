export type UserRole = 'guest' | 'student' | 'instructor' | 'admin' | 'free' | 'paid' | 'teacher';

export type AppView = 
  | 'landing'
  | 'courses'
  | 'course-detail'
  | 'lesson'
  | 'login'
  | 'signup'
  | 'apply'
  | 'forgot-password'
  | 'signout'
  | 'dashboard'
  | 'profile'
  | 'pricing'
  | 'certificates'
  | 'certificate-verify'
  | 'practice'
  | 'practice-detail'
  | 'broker-mail'
  | 'load-board'
  | 'fleet-training'
  | 'teacher-dashboard'
  | 'admin-dashboard'
  | 'discussions'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'analytics'
  | 'study-timer'
  | 'achievements'
  | 'quiz'
  | 'bookmarks'
  | 'roadmap'
  | 'notes'
  | 'weekly-report'
  | 'settings'
  | 'toolkit'
  | 'career-center'
  | 'study-groups'
  | 'glossary'
  | 'mentorship'
  | 'resources'
  | 'video-library'
  | 'not-found';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PlatformAccount extends User {
  passwordHash: string;
  status: 'active' | 'suspended';
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  image: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number;
  instructorId: string;
  instructorName: string;
  instructorBio: string;
  instructorAvatar: string;
  enrollmentCount: number;
  certificateAvailable: boolean;
  learningOutcomes: string[];
  prerequisites: string[];
  commonMistakes: string[];
  lastUpdated: string;
  published: boolean;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  courseId: string;
  orderIndex: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  durationMin: number;
  isFree: boolean;
  isRequired: boolean;
  checklist: string[];
  resources: { title: string; url: string }[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: string;
  completedAt?: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  checklistData: Record<string, boolean>;
  completedAt?: string;
  updatedAt?: string;
  timeSpentSeconds?: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, number>;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  credentialId: string;
  score: number;
  issuedAt: string;
  verified: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'revoked';
  approvedAt?: string;
  approvedBy?: string;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
  userName: string;
  courseName: string;
}

export interface LeadSubmission {
  id: string;
  type: 'contact' | 'request_info' | 'newsletter';
  name?: string;
  email: string;
  subject?: string;
  message?: string;
  courseInterest?: string;
  status: 'new' | 'reviewed' | 'closed';
  createdAt: string;
}

export type StudentApplicationStatus = 'applied' | 'reviewing' | 'accepted' | 'rejected' | 'enrolled';

export interface StudentApplication {
  id: string;
  applicantName: string;
  email: string;
  phone?: string;
  city?: string;
  experienceLevel: 'new' | 'some_experience' | 'working_dispatcher';
  preferredCohortId?: string;
  courseInterest?: string;
  motivation: string;
  status: StudentApplicationStatus;
  reviewerId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cohort {
  id: string;
  name: string;
  slug: string;
  courseId?: string;
  instructorId?: string;
  startsAt: string;
  endsAt?: string;
  capacity: number;
  status: 'planned' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CohortEnrollment {
  id: string;
  cohortId: string;
  userId: string;
  applicationId?: string;
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: string;
  completedAt?: string;
}

export interface LessonAttendance {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  cohortId?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  attendedAt?: string;
  recordedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmRecord {
  id: string;
  type: 'lead' | 'applicant' | 'student' | 'graduate';
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  ownerId?: string;
  lastContactAt?: string;
  followUpAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsEvent {
  id: string;
  type:
    | 'course_enrollment'
    | 'course_view'
    | 'lesson_complete'
    | 'certificate_issued'
    | 'course_assigned'
    | 'assignment_reviewed'
    | 'account_status_changed';
  userId?: string;
  courseId?: string;
  lessonId?: string;
  createdAt: string;
}

export interface ManagedLessonResource {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'pdf' | 'template' | 'video' | 'document';
}

export interface ManagedQuizDraft {
  id: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
  published: boolean;
}

export interface ManagedAssignmentDraft {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate?: string;
  published: boolean;
}

export interface ManagedLessonDraft {
  id: string;
  title: string;
  content: string;
  fileName?: string;
  durationMin: number;
  duration: string;
  type: 'video' | 'reading' | 'quiz';
  published: boolean;
  resources: ManagedLessonResource[];
  quiz?: ManagedQuizDraft;
  assignment?: ManagedAssignmentDraft;
}

export interface ManagedCourseDraft {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  lessons: ManagedLessonDraft[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  lessonId?: string;
  courseId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  scenario: string;
  rubric: { criterion: string; weight: number; description: string }[];
  type: 'email' | 'calculation' | 'review' | 'checklist' | 'scenario';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface AssignmentSubmission {
  id: string;
  userId: string;
  assignmentId: string;
  response: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'reviewed' | 'graded' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Discussion {
  id: string;
  courseId?: string;
  lessonId?: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  createdAt: string;
  replies: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  content: string;
  isHelpful: boolean;
  isInstructor: boolean;
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one_time';
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

export interface LoadBoardEntry {
  id: string;
  age: string;
  origin: string;
  originState: string;
  destination: string;
  destinationState: string;
  miles: number;
  deadhead: number;
  equipment: string;
  weight: number;
  rate: number;
  rpm: number;
  broker: string;
  creditScore: number;
  commodity: string;
  pickupDate: string;
  deliveryDate: string;
  brokerNotes: string;
  contactPhone: string;
  contactEmail: string;
}

export interface FleetVehicle {
  id: string;
  truckNumber: string;
  driverName: string;
  driverStatus: 'driving' | 'on_break' | 'off_duty' | 'sleeper_berth';
  hosRemaining: number;
  location: string;
  state: string;
  speed: number;
  fuelLevel: number;
  currentLoad: string;
  nextAppointment: string;
  maintenanceWarning?: string;
  lat: number;
  lng: number;
}

export interface BrokerEmail {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  personality: 'polite' | 'busy' | 'rude' | 'short_answer' | 'negotiation' | 'emotional';
  threadId: string;
  replies: BrokerEmail[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface StudentOutcome {
  id: string;
  name: string;
  city: string;
  track: string;
  completion: number;
  outcome: string;
  avatar?: string;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  experience: string;
  specialization: string;
  coursesTaught: number;
  bio: string;
}

export type NotificationType = 'course_update' | 'assignment' | 'achievement' | 'system' | 'discussion_reply';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
}

export interface CourseNote {
  id: string;
  courseId: string;
  courseName: string;
  lessonId: string;
  lessonTitle: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  // Profile
  name: string;
  bio: string;
  timezone: string;
  // Learning Preferences
  studyTimerDuration: number;
  dailyGoalHours: number;
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  autoPlayNextLesson: boolean;
  // Notification Preferences
  emailNotifications: boolean;
  achievementAlerts: boolean;
  courseUpdateAlerts: boolean;
  discussionReplyAlerts: boolean;
  // Appearance
  theme: 'dark' | 'light' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsedDefault: boolean;
  // Privacy
  profileVisibility: 'public' | 'private';
  showOnLeaderboard: boolean;
  // Goals
  nextWeekGoals: string;
}
