'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { getRoleLabel, normalizeRole } from '@/lib/auth/access-control';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  PlusCircle,
  FileSearch,
  BarChart3,
  Clock,
  Video,
  FileText,
  HelpCircle,
  Pencil,
  Megaphone,
  Send,
  Reply,
  Calendar,
  MapPin,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  Timer,
  Target,
  UsersRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import { getCertificateReadiness } from '@/lib/lms/course-rules';
import type { AssignmentSubmission } from '@/lib/types';

const discussionQueue = [
  { title: 'How to handle a broker who won\'t confirm pickup time?', course: 'Broker Communication', replies: 3, needsReply: true },
  { title: 'ELD malfunction — what are driver options?', course: 'HOS / ELD Basics', replies: 1, needsReply: true },
  { title: 'Best load board for flatbed in Q4?', course: 'Load Board Training', replies: 7, needsReply: false },
  { title: 'DOT audit checklist confusion', course: 'DOT / FMCSA Compliance', replies: 2, needsReply: true },
];

// Course analytics baseline data
const courseCompletionData = [
  { name: 'Dispatch Fundamentals', rate: 78, color: 'bg-primary' },
  { name: 'Broker Communication', rate: 62, color: 'bg-emerald-500' },
  { name: 'Load Board Training', rate: 85, color: 'bg-amber-500' },
  { name: 'HOS / ELD Basics', rate: 54, color: 'bg-orange-500' },
  { name: 'DOT / FMCSA Compliance', rate: 71, color: 'bg-rose-500' },
];

const engagementMetrics = [
  { label: 'Avg. Time / Lesson', value: '24 min', icon: Timer, color: 'text-primary', bgColor: 'bg-primary/10' },
  { label: 'Quiz Pass Rate', value: '87%', icon: Target, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { label: 'Discussion Participation', value: '64%', icon: UsersRound, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
];

const weeklyActivity = [12, 18, 15, 22, 19, 25, 21];

// Communication hub baseline data
const recentMessages = [
  { student: 'Aziz Khojaev', message: 'Hi, I have a question about the rate confirmation assignment...', time: '30 min ago' },
  { student: 'Nodira Yusupova', message: 'Thank you for the feedback on my BOL checklist!', time: '2 hours ago' },
  { student: 'Jasur Tashmatov', message: 'Can we schedule a 1-on-1 to discuss the RPM calculations?', time: '5 hours ago' },
  { student: 'Dilnoza Rakhimova', message: 'I submitted the revision for the negotiation scenario.', time: '1 day ago' },
];

// Schedule baseline data
const scheduleItems = [
  { title: 'Assignment Deadline: Rate Confirmation', type: 'deadline' as const, date: 'Mar 5, 2026', time: '11:59 PM', course: 'Dispatch Fundamentals' },
  { title: 'Live Session: Q&A with Broker Panel', type: 'live' as const, date: 'Mar 6, 2026', time: '2:00 PM', course: 'Broker Communication' },
  { title: 'Office Hours', type: 'office' as const, date: 'Mar 7, 2026', time: '10:00 AM', course: 'All Courses' },
  { title: 'Assignment Deadline: RPM Calculation', type: 'deadline' as const, date: 'Mar 9, 2026', time: '11:59 PM', course: 'Load Board Training' },
  { title: 'Live Session: ELD Compliance Deep Dive', type: 'live' as const, date: 'Mar 11, 2026', time: '3:00 PM', course: 'HOS / ELD Basics' },
];

const lessonTypeIcon = { video: Video, reading: FileText, quiz: HelpCircle };
const lessonTypeColor = { video: 'text-primary', reading: 'text-emerald-500', quiz: 'text-amber-500' };
const lessonTypeBg = { video: 'bg-primary/10', reading: 'bg-emerald-500/10', quiz: 'bg-amber-500/10' };

const scheduleTypeIcon = { deadline: Clock, live: Video, office: MapPin };
const scheduleTypeColor = { deadline: 'text-rose-500', live: 'text-primary', office: 'text-emerald-500' };

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function TeacherDashboard() {
  const {
    user,
    courses,
    assignments,
    quizzes,
    accounts,
    enrollments,
    lessonProgress,
    quizAttempts,
    submissions,
    certificates,
    managedCourses,
    createManagedCourse,
    updateManagedCourse,
    addManagedLesson,
    updateManagedLesson,
    addManagedResource,
    upsertManagedQuiz,
    upsertManagedAssignment,
    reviewAssignmentSubmission,
  } = useAppStore();
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementCourse, setAnnouncementCourse] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [selectedManagedCourseId, setSelectedManagedCourseId] = useState('');
  const [selectedManagedLessonId, setSelectedManagedLessonId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonFileName, setLessonFileName] = useState('');
  const [lessonDuration, setLessonDuration] = useState('30');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState('Yes\nNo\nNeeds review');
  const [quizCorrectIndex, setQuizCorrectIndex] = useState('0');
  const [quizPassingScore, setQuizPassingScore] = useState('70');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');

  if (!user) return null;

  const instructorCourses = managedCourses.filter((course) => course.instructorId === user.id);
  const selectedManagedCourse = instructorCourses.find((course) => course.id === selectedManagedCourseId) ?? null;
  const selectedManagedLesson = selectedManagedCourse?.lessons.find((lesson) => lesson.id === selectedManagedLessonId) ?? null;
  const enrolledStudentCount = new Set(
    enrollments.filter((enrollment) => enrollment.status === 'active').map((enrollment) => enrollment.userId)
  ).size;
  const submissionRows = submissions
    .map((submission) => {
      const assignment = assignments.find((item) => item.id === submission.assignmentId);
      const account = accounts.find((item) => item.id === submission.userId);
      const course = assignment ? courses.find((item) => item.id === assignment.courseId) : null;
      return {
        ...submission,
        student: account?.name ?? 'Unknown student',
        assignment: assignment?.title ?? submission.assignmentId,
        type: assignment?.type ?? 'scenario',
        course: course?.title ?? 'Unassigned course',
      };
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const studentRows = accounts
    .filter((account) => normalizeRole(account.role) === 'student')
    .flatMap((account) => {
      const activeEnrollments = enrollments.filter((enrollment) => enrollment.userId === account.id && enrollment.status === 'active');
      if (activeEnrollments.length === 0) {
        return [{
          id: `${account.id}-none`,
          name: account.name,
          course: 'No active course',
          progress: 0,
          quizAverage: 0,
          assignmentStatus: 'No assignments',
          certificatesEarned: certificates.filter((certificate) => certificate.userId === account.id && certificate.verified).length,
          lastActive: 'No activity yet',
        }];
      }
      return activeEnrollments.map((enrollment) => {
        const course = courses.find((item) => item.id === enrollment.courseId);
        const lessonIds = course?.lessons.map((lesson) => lesson.id) ?? [];
        const baseLessonCount = Math.max(1, lessonIds.length);
        const completedCount = lessonProgress.filter((progress) =>
          progress.userId === account.id && progress.completed && lessonIds.includes(progress.lessonId)
        ).length;
        const readiness = course
          ? getCertificateReadiness({
              course,
              userId: account.id,
              lessonProgress,
              quizAttempts,
              submissions,
              certificates,
              assignments,
              quizzes,
            })
          : null;
        const lastActivity = lessonProgress
          .filter((progress) => progress.userId === account.id && (progress.updatedAt || progress.completedAt))
          .sort((a, b) => new Date(b.updatedAt || b.completedAt || 0).getTime() - new Date(a.updatedAt || a.completedAt || 0).getTime())[0];
        return {
          id: `${account.id}-${enrollment.id}`,
          name: account.name,
          course: course?.title || enrollment.courseId,
          progress: Math.min(100, Math.round((completedCount / baseLessonCount) * 100)),
          quizAverage: readiness?.quizAverage ?? 0,
          assignmentStatus: readiness
            ? readiness.requiredAssignments > 0
              ? `${readiness.approvedAssignments}/${readiness.requiredAssignments} approved`
              : 'No assignments'
            : 'No assignments',
          certificatesEarned: certificates.filter((certificate) => certificate.userId === account.id && certificate.verified).length,
          lastActive: lastActivity ? new Date(lastActivity.updatedAt || lastActivity.completedAt || '').toLocaleDateString() : 'No activity yet',
        };
      });
    });

  const handleCreateCourse = () => {
    if (!courseTitle.trim() || !courseDescription.trim()) {
      toast.error('Course title and description are required.');
      return;
    }
    const courseId = createManagedCourse({ title: courseTitle.trim(), description: courseDescription.trim() });
    if (courseId) setSelectedManagedCourseId(courseId);
    setCourseTitle('');
    setCourseDescription('');
    toast.success('Course draft created.');
  };

  const handleSaveCourse = () => {
    if (!selectedManagedCourseId || !courseTitle.trim() || !courseDescription.trim()) {
      toast.error('Select a course and fill title/description.');
      return;
    }
    updateManagedCourse(selectedManagedCourseId, {
      title: courseTitle.trim(),
      description: courseDescription.trim(),
    });
    toast.success('Course updated.');
  };

  const handleAddLesson = () => {
    if (!selectedManagedCourseId || !lessonTitle.trim() || !lessonContent.trim()) {
      toast.error('Choose a course and add lesson title/content.');
      return;
    }
    const lessonId = addManagedLesson(selectedManagedCourseId, {
      title: lessonTitle.trim(),
      content: lessonContent.trim(),
      fileName: lessonFileName.trim() || undefined,
      durationMin: Number(lessonDuration) || 30,
    });
    if (lessonId) setSelectedManagedLessonId(lessonId);
    setLessonTitle('');
    setLessonContent('');
    setLessonFileName('');
    setLessonDuration('30');
    toast.success('Lesson added to course.');
  };

  const handleSaveLesson = () => {
    if (!selectedManagedCourseId || !selectedManagedLessonId || !lessonTitle.trim() || !lessonContent.trim()) {
      toast.error('Select a lesson and fill title/content.');
      return;
    }
    updateManagedLesson(selectedManagedCourseId, selectedManagedLessonId, {
      title: lessonTitle.trim(),
      content: lessonContent.trim(),
      fileName: lessonFileName.trim() || undefined,
      durationMin: Number(lessonDuration) || 30,
      duration: `${Number(lessonDuration) || 30} min`,
    });
    toast.success('Lesson updated.');
  };

  const handleSelectCourse = (courseId: string) => {
    const course = instructorCourses.find((item) => item.id === courseId);
    setSelectedManagedCourseId(courseId);
    setSelectedManagedLessonId('');
    setCourseTitle(course?.title ?? '');
    setCourseDescription(course?.description ?? '');
  };

  const handleSelectLesson = (lessonId: string) => {
    const lesson = selectedManagedCourse?.lessons.find((item) => item.id === lessonId);
    setSelectedManagedLessonId(lessonId);
    setLessonTitle(lesson?.title ?? '');
    setLessonContent(lesson?.content ?? '');
    setLessonFileName(lesson?.fileName ?? '');
    setLessonDuration(String(lesson?.durationMin ?? 30));
  };

  const handleAddResource = () => {
    if (!selectedManagedCourseId || !selectedManagedLessonId || !resourceTitle.trim() || !resourceUrl.trim()) {
      toast.error('Select a lesson and add resource title/link.');
      return;
    }
    addManagedResource(selectedManagedCourseId, selectedManagedLessonId, {
      title: resourceTitle.trim(),
      url: resourceUrl.trim(),
      type: resourceUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link',
    });
    setResourceTitle('');
    setResourceUrl('');
    toast.success('Resource uploaded to lesson.');
  };

  const handleCreateQuiz = () => {
    const options = quizOptions.split('\n').map((option) => option.trim()).filter(Boolean);
    if (!selectedManagedCourseId || !selectedManagedLessonId || !quizTitle.trim() || !quizQuestion.trim() || options.length < 2) {
      toast.error('Quiz title, question, and at least two options are required.');
      return;
    }
    upsertManagedQuiz(selectedManagedCourseId, selectedManagedLessonId, {
      title: quizTitle.trim(),
      passingScore: Number(quizPassingScore) || 70,
      question: quizQuestion.trim(),
      options,
      correctIndex: Math.min(Math.max(Number(quizCorrectIndex) || 0, 0), options.length - 1),
    });
    setQuizQuestion('');
    toast.success('Quiz question saved.');
  };

  const handleCreateAssignment = () => {
    if (!selectedManagedCourseId || !selectedManagedLessonId || !assignmentTitle.trim() || !assignmentDescription.trim() || !assignmentInstructions.trim()) {
      toast.error('Assignment title, description, and instructions are required.');
      return;
    }
    upsertManagedAssignment(selectedManagedCourseId, selectedManagedLessonId, {
      title: assignmentTitle.trim(),
      description: assignmentDescription.trim(),
      instructions: assignmentInstructions.trim(),
    });
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentInstructions('');
    toast.success('Assignment saved to lesson.');
  };

  const handleApproveSubmission = (id: string) => {
    const grade = gradeInputs[id];
    if (!grade || Number(grade) < 0 || Number(grade) > 100) {
      toast.error('Please enter a valid grade (0-100)');
      return;
    }
    reviewAssignmentSubmission(id, {
      status: 'approved',
      score: Number(grade),
      feedback: feedbackInputs[id] || 'Approved. Strong work on the assignment.',
    });
    toast.success('Submission approved', { description: `Grade: ${grade}/100` });
  };

  const handleRequestRevision = (id: string) => {
    reviewAssignmentSubmission(id, {
      status: 'rejected',
      feedback: feedbackInputs[id] || 'Rejected. Please revise and resubmit with more detail.',
    });
    toast.info('Submission rejected', { description: feedbackInputs[id] || 'Revision required before approval' });
  };

  const handleSendAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Announcement sent!', { description: `"${announcementTitle}" sent to ${announcementCourse || 'all courses'}` });
    setAnnouncementOpen(false);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setAnnouncementCourse('');
  };

  const handleQuickReply = (student: string) => {
    toast.success('Reply sent', { description: `Quick reply sent to ${student}` });
  };

  const filteredSubmissions = (tab: string) => {
    if (tab === 'all') return submissionRows;
    if (tab === 'pending') return submissionRows.filter(s => s.status === 'submitted');
    if (tab === 'graded') return submissionRows.filter(s => s.status === 'approved' || s.status === 'graded' || s.status === 'reviewed');
    if (tab === 'revision') return submissionRows.filter(s => s.status === 'rejected');
    return submissionRows;
  };

  const statusBadge = (status: AssignmentSubmission['status']) => {
    switch (status) {
      case 'submitted': return <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case 'approved':
      case 'graded': return <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Graded</Badge>;
      case 'reviewed': return <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Reviewed</Badge>;
      case 'rejected': return <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/20">Revision</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your students, courses, and reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Signed in as</span>
          <Badge variant="default" className="text-xs">{getRoleLabel(user.role)}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrolledStudentCount}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <BookOpen className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instructorCourses.length}</p>
                <p className="text-xs text-muted-foreground">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <ClipboardCheck className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submissionRows.filter((submission) => submission.status === 'submitted').length}</p>
                <p className="text-xs text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                <MessageSquare className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{discussionQueue.filter((discussion) => discussion.needsReply).length}</p>
                <p className="text-xs text-muted-foreground">Discussion Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Course Analytics */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Course Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Completion Rate Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Completion Rate by Course
              </CardTitle>
              <CardDescription>Average completion percentage across your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-52">
                {courseCompletionData.map((course) => (
                  <div key={course.name} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-foreground">{course.rate}%</span>
                    <div className="w-full relative" style={{ height: '160px' }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-t-md ${course.color}/20`}
                        style={{ height: `${course.rate}%` }}
                      >
                        <div
                          className={`absolute bottom-0 w-full rounded-t-md ${course.color}`}
                          style={{ height: '70%' }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight truncate w-full" title={course.name}>
                      {course.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Engagement Metrics + Weekly Activity */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {engagementMetrics.map((metric) => (
                  <div key={metric.label} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${metric.bgColor}`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-sm font-semibold">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Activity</CardTitle>
                <CardDescription className="text-xs">Daily active students (last 7 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1.5 h-16">
                  {weeklyActivity.map((count, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-sm bg-primary/80 transition-all hover:bg-primary"
                        style={{ height: `${(count / 25) * 100}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Course Builder */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-semibold">Course Builder</h2>
        </div>
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Input
                placeholder="Course title"
                value={courseTitle}
                onChange={(event) => setCourseTitle(event.target.value)}
              />
              <Input
                placeholder="Course description"
                value={courseDescription}
                onChange={(event) => setCourseDescription(event.target.value)}
              />
              <Button onClick={handleCreateCourse}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Course
              </Button>
              <Button variant="outline" onClick={handleSaveCourse} disabled={!selectedManagedCourseId}>
                <Pencil className="h-4 w-4 mr-2" />
                Save Course
              </Button>
            </div>
            {selectedManagedCourse && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-3">
                <Badge variant={selectedManagedCourse.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                  {selectedManagedCourse.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {selectedManagedCourse.lessons.length} lessons · Updated {new Date(selectedManagedCourse.updatedAt).toLocaleDateString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-7 text-xs"
                  onClick={() =>
                    updateManagedCourse(selectedManagedCourse.id, {
                      status: selectedManagedCourse.status === 'published' ? 'draft' : 'published',
                    })
                  }
                >
                  {selectedManagedCourse.status === 'published' ? 'Move to Draft' : 'Publish Course'}
                </Button>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Select value={selectedManagedCourseId} onValueChange={handleSelectCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course draft" />
                </SelectTrigger>
                <SelectContent>
                  {instructorCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedManagedLessonId} onValueChange={handleSelectLesson} disabled={!selectedManagedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Edit lesson" />
                </SelectTrigger>
                <SelectContent>
                  {selectedManagedCourse?.lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Lesson title"
                value={lessonTitle}
                onChange={(event) => setLessonTitle(event.target.value)}
              />
              <Input
                placeholder="File name (optional)"
                value={lessonFileName}
                onChange={(event) => setLessonFileName(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Input
                type="number"
                min={1}
                placeholder="Duration min"
                value={lessonDuration}
                onChange={(event) => setLessonDuration(event.target.value)}
              />
              <Button onClick={handleAddLesson} disabled={instructorCourses.length === 0}>
                Add Lesson
              </Button>
              <Button variant="outline" onClick={handleSaveLesson} disabled={!selectedManagedLessonId}>
                Save Lesson
              </Button>
            </div>
            <Textarea
              placeholder="Lesson content"
              value={lessonContent}
              onChange={(event) => setLessonContent(event.target.value)}
              rows={4}
            />

            {selectedManagedLesson && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-border/50 p-3 space-y-3">
                  <p className="text-sm font-medium">Lesson Resources</p>
                  <Input
                    placeholder="Resource title"
                    value={resourceTitle}
                    onChange={(event) => setResourceTitle(event.target.value)}
                  />
                  <Input
                    placeholder="Resource URL or uploaded file link"
                    value={resourceUrl}
                    onChange={(event) => setResourceUrl(event.target.value)}
                  />
                  <Button size="sm" variant="outline" onClick={handleAddResource} className="w-full">
                    Upload Resource
                  </Button>
                  <div className="space-y-1">
                    {selectedManagedLesson.resources.map((resource) => (
                      <p key={resource.id} className="truncate text-xs text-muted-foreground">
                        {resource.title}
                      </p>
                    ))}
                    {selectedManagedLesson.resources.length === 0 && (
                      <p className="text-xs text-muted-foreground">No resources uploaded.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border/50 p-3 space-y-3">
                  <p className="text-sm font-medium">Lesson Quiz</p>
                  <Input placeholder="Quiz title" value={quizTitle} onChange={(event) => setQuizTitle(event.target.value)} />
                  <Input placeholder="Question" value={quizQuestion} onChange={(event) => setQuizQuestion(event.target.value)} />
                  <Textarea
                    placeholder="Options, one per line"
                    value={quizOptions}
                    onChange={(event) => setQuizOptions(event.target.value)}
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Correct index"
                      value={quizCorrectIndex}
                      onChange={(event) => setQuizCorrectIndex(event.target.value)}
                    />
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="Pass %"
                      value={quizPassingScore}
                      onChange={(event) => setQuizPassingScore(event.target.value)}
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCreateQuiz} className="w-full">
                    Save Quiz
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {selectedManagedLesson.quiz ? `${selectedManagedLesson.quiz.questions.length} questions saved` : 'No quiz yet.'}
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 p-3 space-y-3">
                  <p className="text-sm font-medium">Lesson Assignment</p>
                  <Input placeholder="Assignment title" value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} />
                  <Input placeholder="Description" value={assignmentDescription} onChange={(event) => setAssignmentDescription(event.target.value)} />
                  <Textarea
                    placeholder="Instructions / rubric"
                    value={assignmentInstructions}
                    onChange={(event) => setAssignmentInstructions(event.target.value)}
                    rows={4}
                  />
                  <Button size="sm" variant="outline" onClick={handleCreateAssignment} className="w-full">
                    Save Assignment
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {selectedManagedLesson.assignment ? selectedManagedLesson.assignment.title : 'No assignment yet.'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {instructorCourses.length === 0 && (
                <p className="text-sm text-muted-foreground">No instructor course drafts yet.</p>
              )}
              {instructorCourses.map((course) => (
                <div key={course.id} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.lessons.length} lessons · {course.status}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Updated {new Date(course.updatedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  {course.lessons.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {course.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between gap-2 rounded-md bg-card px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm">{lesson.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {lesson.durationMin} min · {lesson.resources.length} resources · {lesson.quiz ? 'Quiz' : 'No quiz'} · {lesson.assignment ? 'Assignment' : 'No assignment'}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleSelectCourse(course.id);
                                setSelectedManagedLessonId(lesson.id);
                                setLessonTitle(lesson.title);
                                setLessonContent(lesson.content);
                                setLessonFileName(lesson.fileName ?? '');
                                setLessonDuration(String(lesson.durationMin));
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateManagedLesson(course.id, lesson.id, { published: !lesson.published })}
                            >
                              {lesson.published ? 'Unpublish' : 'Publish'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 2: Content Management Panel */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-semibold">Manage Course Content</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <Accordion type="multiple" className="w-full">
              {instructorCourses.map((course) => (
                <AccordionItem key={course.id} value={course.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.lessons.length} lessons</p>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-auto mr-3">
                        {course.lessons.filter(l => l.published).length}/{course.lessons.length} published
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      {course.lessons.map((lesson) => {
                        const key = `${course.id}-${lesson.title}`;
                        const Icon = lessonTypeIcon[lesson.type];
                        const isPublished = lesson.published;
                        return (
                          <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${lessonTypeBg[lesson.type]}`}>
                              <Icon className={`h-3.5 w-3.5 ${lessonTypeColor[lesson.type]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{lesson.type} · {lesson.duration}</p>
                            </div>
                            <Badge variant={isPublished ? 'default' : 'secondary'} className="text-xs shrink-0 cursor-pointer" onClick={() => updateManagedLesson(course.id, lesson.id, { published: !lesson.published })}>
                              {isPublished ? 'Published' : 'Draft'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs shrink-0"
                              onClick={() => {
                                setCourseTitle(course.title);
                                setCourseDescription(`${course.title} course draft`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                          </div>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setCourseTitle(course.title);
                          setCourseDescription(`${course.title} course draft`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add New Lesson
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              {instructorCourses.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Create a course draft above to manage lessons, quizzes, assignments, and resources.
                </div>
              )}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 3: Grading Queue */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-semibold">Grading Queue</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{submissionRows.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{submissionRows.filter(s => s.status === 'submitted').length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="graded">
                  Graded
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{submissionRows.filter(s => s.status === 'approved' || s.status === 'graded' || s.status === 'reviewed').length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="revision">
                  Revision
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{submissionRows.filter(s => s.status === 'rejected').length}</Badge>
                </TabsTrigger>
              </TabsList>

              {['all', 'pending', 'graded', 'revision'].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div className="space-y-4 max-h-96 overflow-y-auto mt-4">
                    {filteredSubmissions(tab).map((sub) => (
                      <div key={sub.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-start gap-3">
                          {/* Student avatar */}
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(sub.student)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">{sub.student}</p>
                              {statusBadge(sub.status)}
                              {sub.score !== undefined && (
                                <Badge variant="default" className="text-xs">{sub.score}/100</Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground mt-0.5">{sub.assignment}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {sub.course} · {sub.type} · Submitted {new Date(sub.submittedAt).toLocaleString()}
                            </p>

                            {/* Grade input and actions for pending items */}
                            {sub.status === 'submitted' && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <label className="text-xs text-muted-foreground">Grade:</label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      placeholder="0-100"
                                      className="w-20 h-7 text-xs"
                                      value={gradeInputs[sub.id] || ''}
                                      onChange={(e) => setGradeInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                    />
                                  </div>
                                  <div className="flex gap-1.5">
                                    <Button size="sm" className="h-7 text-xs" onClick={() => handleApproveSubmission(sub.id)}>
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleRequestRevision(sub.id)}>
                                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                                <Textarea
                                  placeholder="Add feedback (optional)..."
                                  className="min-h-[60px] text-xs"
                                  value={feedbackInputs[sub.id] || ''}
                                  onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                />
                              </div>
                            )}

                            {/* Show feedback area for revision items */}
                            {sub.status === 'rejected' && (
                              <div className="mt-2">
                                <Textarea
                                  placeholder="Add rejection comments..."
                                  className="min-h-[60px] text-xs"
                                  value={feedbackInputs[sub.id] || ''}
                                  onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                />
                                <div className="flex gap-1.5 mt-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="Grade 0-100"
                                    className="w-20 h-7 text-xs"
                                    value={gradeInputs[sub.id] || ''}
                                    onChange={(e) => setGradeInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                  />
                                  <Button size="sm" className="h-7 text-xs" onClick={() => handleApproveSubmission(sub.id)}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredSubmissions(tab).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No submissions in this category
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 4 & 5: Communication Hub + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Communication Hub */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Communication Hub</h2>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Announcements
                  </CardTitle>
                  <CardDescription>Send announcements to your classes</CardDescription>
                </div>
                <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Megaphone className="h-4 w-4 mr-1.5" />
                      Send Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Announcement</DialogTitle>
                      <DialogDescription>Notify students across your courses</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          placeholder="Announcement title"
                          value={announcementTitle}
                          onChange={(e) => setAnnouncementTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Course</label>
                        <Select value={announcementCourse} onValueChange={setAnnouncementCourse}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {instructorCourses.map(c => (
                              <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                          placeholder="Write your announcement..."
                          className="min-h-[100px]"
                          value={announcementMessage}
                          onChange={(e) => setAnnouncementMessage(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAnnouncementOpen(false)}>Cancel</Button>
                      <Button onClick={handleSendAnnouncement}>
                        <Send className="h-4 w-4 mr-1.5" />
                        Send
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-3">Recent Student Messages</p>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentMessages.map((msg, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 text-xs font-semibold">
                      {getInitials(msg.student)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{msg.student}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{msg.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{msg.message}</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs mt-1.5 px-2" onClick={() => handleQuickReply(msg.student)}>
                        <Reply className="h-3 w-3 mr-1" />
                        Quick Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule / Calendar Widget */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Upcoming Schedule</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
              <CardDescription>Assignment deadlines, live sessions & office hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {scheduleItems.map((item, i) => {
                  const Icon = scheduleTypeIcon[item.type];
                  const color = scheduleTypeColor[item.type];
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        item.type === 'deadline' ? 'bg-rose-500/10' :
                        item.type === 'live' ? 'bg-primary/10' : 'bg-emerald-500/10'
                      }`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1">{item.course}</Badge>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 capitalize ${
                        item.type === 'deadline' ? 'border-rose-500/30 text-rose-500' :
                        item.type === 'live' ? 'border-primary/30 text-primary' : 'border-emerald-500/30 text-emerald-500'
                      }`}>
                        {item.type === 'deadline' ? 'Deadline' : item.type === 'live' ? 'Live' : 'Office'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Student Progress & Gradebook
          </CardTitle>
          <CardDescription>Enrollment, lesson completion, quiz average, assignment approval, and certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Quiz Avg</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>Certificates</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRows.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{student.course}</Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{student.quizAverage}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{student.assignmentStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{student.certificatesEarned}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {student.lastActive}
                    </TableCell>
                  </TableRow>
                ))}
                {studentRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No student accounts yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discussion Threads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Discussion Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {discussionQueue.map((disc, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{disc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {disc.course} · {disc.replies} replies
                    </p>
                  </div>
                  {disc.needsReply && (
                    <Badge className="text-xs shrink-0 bg-orange-500/10 text-orange-500 border-orange-500/20">
                      Needs Reply
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full h-auto py-4 justify-start gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <PlusCircle className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Create Lesson</p>
                <p className="text-xs text-muted-foreground">Add new content</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full h-auto py-4 justify-start gap-3" onClick={() => window.scrollTo({ top: 520, behavior: 'smooth' })}>
              <FileSearch className="h-5 w-5 text-amber-500" />
              <div className="text-left">
                <p className="font-medium">Review Assignment</p>
                <p className="text-xs text-muted-foreground">{submissionRows.filter(s => s.status === 'submitted').length} pending</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full h-auto py-4 justify-start gap-3" onClick={() => window.scrollTo({ top: 280, behavior: 'smooth' })}>
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <div className="text-left">
                <p className="font-medium">View Analytics</p>
                <p className="text-xs text-muted-foreground">Student performance</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
