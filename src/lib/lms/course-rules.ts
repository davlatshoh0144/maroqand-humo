import { assignments as fallbackAssignments } from '@/lib/data/assignments';
import { quizzes as fallbackQuizzes } from '@/lib/data/quiz-data';
import type {
  Assignment,
  AssignmentSubmission,
  Certificate,
  Course,
  LessonProgress,
  Quiz,
  QuizAttempt,
} from '@/lib/types';

const quizAliasesByCourse: Record<string, string[]> = {
  'course-1': ['quiz-dispatch-fundamentals'],
};

export function getLatestSubmission(
  submissions: AssignmentSubmission[],
  userId: string,
  assignmentId: string
) {
  return submissions
    .filter((submission) => submission.userId === userId && submission.assignmentId === assignmentId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0] ?? null;
}

export function isAssignmentApproved(submission: AssignmentSubmission | null) {
  if (!submission) return false;
  if (submission.status === 'approved') return true;
  return (submission.status === 'graded' || submission.status === 'reviewed') && (submission.score ?? 0) >= 70;
}

export function getBestQuizScore(quizAttempts: QuizAttempt[], userId: string, quizIds: string[]) {
  const quizIdSet = new Set(quizIds);
  const scores = quizAttempts
    .filter((attempt) => attempt.userId === userId && quizIdSet.has(attempt.quizId))
    .map((attempt) => attempt.score);
  return scores.length > 0 ? Math.max(...scores) : null;
}

export function getCertificateReadiness(params: {
  course: Course;
  userId: string;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  submissions: AssignmentSubmission[];
  certificates: Certificate[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
}) {
  const { course, userId, lessonProgress, quizAttempts, submissions, certificates } = params;
  const quizzes = params.quizzes ?? fallbackQuizzes;
  const assignments = params.assignments ?? fallbackAssignments;
  const requiredLessons = course.lessons.filter((lesson) => lesson.isRequired);
  const completedRequiredLessons = requiredLessons.filter((lesson) =>
    lessonProgress.some(
      (progress) => progress.userId === userId && progress.lessonId === lesson.id && progress.completed
    )
  );
  const lessonsComplete = completedRequiredLessons.length === requiredLessons.length;

  const courseQuizzes = quizzes.filter((quiz) => quiz.courseId === course.id);
  const quizResults = courseQuizzes.map((quiz) => {
    const score = getBestQuizScore(
      quizAttempts,
      userId,
      [quiz.id, ...(quizAliasesByCourse[course.id] ?? [])]
    );
    return {
      quizId: quiz.id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      score,
      passed: score !== null && score >= quiz.passingScore,
    };
  });
  const quizzesPassed = quizResults.every((result) => result.passed);
  const quizAverage =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, result) => sum + (result.score ?? 0), 0) / quizResults.length
        )
      : 100;

  const courseAssignments = assignments.filter((assignment) => assignment.courseId === course.id);
  const assignmentResults = courseAssignments.map((assignment) => {
    const submission = getLatestSubmission(submissions, userId, assignment.id);
    return {
      assignmentId: assignment.id,
      title: assignment.title,
      submission,
      approved: isAssignmentApproved(submission),
    };
  });
  const assignmentsApproved = assignmentResults.every((result) => result.approved);

  const hasCertificate = certificates.some(
    (certificate) => certificate.userId === userId && certificate.courseId === course.id
  );
  const blockers = [
    lessonsComplete ? null : `${requiredLessons.length - completedRequiredLessons.length} required lessons incomplete`,
    quizzesPassed ? null : 'quiz threshold not met',
    assignmentsApproved ? null : 'assignments not approved',
    hasCertificate ? 'certificate already requested' : null,
  ].filter(Boolean) as string[];

  return {
    eligible: blockers.length === 0,
    lessonsComplete,
    lessonCompletionPercent:
      requiredLessons.length > 0
        ? Math.round((completedRequiredLessons.length / requiredLessons.length) * 100)
        : 100,
    completedRequiredLessons: completedRequiredLessons.length,
    requiredLessons: requiredLessons.length,
    quizzesPassed,
    quizAverage,
    quizResults,
    assignmentsApproved,
    approvedAssignments: assignmentResults.filter((result) => result.approved).length,
    requiredAssignments: assignmentResults.length,
    assignmentResults,
    score: quizResults.length > 0 ? quizAverage : 100,
    hasCertificate,
    blockers,
  };
}
