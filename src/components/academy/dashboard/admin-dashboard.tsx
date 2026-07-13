'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import type { UserRole } from '@/lib/types';
import { getRoleLabel, normalizeRole } from '@/lib/auth/access-control';
import { OperationsDashboard } from '@/components/academy/dashboard/operations-dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  GraduationCap,
  DollarSign,
  BookOpen,
  Shield,
  FileCheck,
  Activity,
  BarChart3,
  ChevronRight,
  TrendingUp,
  CreditCard,
  PieChart,
  Server,
  Database,
  Globe,
  AlertTriangle,
  Wifi,
  ShieldAlert,
  MessageSquare,
  Eye,
  XCircle,
  CheckCircle2,
  Settings,
  Bell,
  Award,
  MapPin,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Admin' },
];

// System health data
const systemHealth = [
  { name: 'Client Store', value: 'Synced', status: 'healthy' as const, icon: Zap },
  { name: 'Supabase DB', value: 'Connected', status: 'healthy' as const, icon: Database },
  { name: 'Auth + RLS', value: 'Enabled', status: 'healthy' as const, icon: ShieldAlert },
  { name: 'Review Queue', value: 'Tracked', status: 'healthy' as const, icon: AlertTriangle },
];

// Content moderation data
const flaggedDiscussions = [
  { id: 1, title: 'Make money fast with this dispatch trick!!!', author: 'spam_user_42', course: 'Dispatch Fundamentals', reason: 'Spam', flaggedAt: '2 hours ago' },
  { id: 2, title: 'Why dispatchers are all [expletive]', author: 'angry_student', course: 'Broker Communication', reason: 'Inappropriate language', flaggedAt: '5 hours ago' },
  { id: 3, title: 'FREE CERTIFICATE GENERATOR LINK', author: 'bot_account', course: 'Load Board Training', reason: 'Spam', flaggedAt: '1 day ago' },
];

const pendingCourseReviews = [
  { id: 1, title: 'Advanced Fleet Management', author: 'Gulnora Karimova', submittedAt: '3 days ago', lessons: 12 },
  { id: 2, title: 'International Shipping Compliance', author: 'Alisher Karimov', submittedAt: '1 week ago', lessons: 8 },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const healthDotColor = { healthy: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-rose-500' };

export function AdminDashboard() {
  const {
    user,
    courses,
    accounts,
    updateUserRole,
    updateAccountStatus,
    createAccount,
    assignCourseToStudent,
    certificates,
    approveCertificate,
    leads,
    analyticsEvents,
    enrollments,
    lessonProgress,
  } = useAppStore();
  const [flaggedItems, setFlaggedItems] = useState(flaggedDiscussions);
  const [pendingCourses, setPendingCourses] = useState(pendingCourseReviews);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as UserRole,
  });
  const [courseAssignment, setCourseAssignment] = useState({
    userId: '',
    courseId: '',
  });

  // Settings state
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    emailNotifications: true,
    certificateAutoApproval: false,
  });

  if (!user) return null;

  const studentCount = accounts.filter((account) => normalizeRole(account.role) === 'student').length;
  const instructorCount = accounts.filter((account) => normalizeRole(account.role) === 'instructor').length;
  const pendingCertificates = certificates.filter((certificate) => certificate.status === 'pending' || (!certificate.verified && certificate.status !== 'rejected'));
  const courseViews = analyticsEvents.filter((event) => event.type === 'course_view');
  const mostViewedCourse = courses
    .map((course) => ({
      course,
      views: courseViews.filter((event) => event.courseId === course.id).length,
      enrollments: enrollments.filter((enrollment) => enrollment.courseId === course.id && enrollment.status === 'active').length,
      completedLessons: lessonProgress.filter((progress) =>
        progress.completed && course.lessons.some((lesson) => lesson.id === progress.lessonId)
      ).length,
    }))
    .sort((a, b) => b.views - a.views)[0];
  const completionRate = lessonProgress.length > 0
    ? Math.round((lessonProgress.filter((progress) => progress.completed).length / lessonProgress.length) * 100)
    : 0;
  const courseAnalyticsBars = courses.slice(0, 6).map((course) => ({
    label: course.title.split(' ')[0],
    value:
      enrollments.filter((enrollment) => enrollment.courseId === course.id).length +
      courseViews.filter((event) => event.courseId === course.id).length,
  }));
  const maxCourseActivity = Math.max(1, ...courseAnalyticsBars.map((item) => item.value));
  const roleDistribution = [
    { name: 'Students', count: studentCount, color: 'bg-primary' },
    { name: 'Instructors', count: instructorCount, color: 'bg-emerald-500' },
    { name: 'Admins', count: accounts.filter((account) => normalizeRole(account.role) === 'admin').length, color: 'bg-amber-500' },
  ];
  const roleTotal = Math.max(1, accounts.length);
  const studentGeoData = Object.entries(
    accounts
      .filter((account) => normalizeRole(account.role) === 'student')
      .reduce<Record<string, number>>((acc, account) => {
        const key = account.city?.trim() || 'Unspecified';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})
  ).map(([country, count]) => ({ country, count }));

  const handleUserRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole(userId, newRole);
    toast.success('Role updated', { description: `User role changed to ${newRole}` });
  };

  const handleCertAction = (certificateId: string, student: string, action: 'approve' | 'reject') => {
    approveCertificate(certificateId, action === 'approve');
    toast.success(`Certificate ${action}d`, { description: `${student}'s certificate has been ${action}d` });
  };

  const handleCreateAccount = async () => {
    if (!newAccount.name.trim() || !newAccount.email.trim() || newAccount.password.length < 8) {
      toast.error('Name, email, and an 8+ character password are required.');
      return;
    }
    const created = await createAccount({
      name: newAccount.name,
      email: newAccount.email,
      password: newAccount.password,
      role: newAccount.role,
    });
    if (!created) {
      toast.error('Account already exists for this email.');
      return;
    }
    toast.success('Account created', { description: `${newAccount.name} was added as ${newAccount.role}.` });
    setNewAccount({ name: '', email: '', password: '', role: 'student' });
  };

  const handleAccountStatusToggle = (userId: string, nextStatus: 'active' | 'suspended') => {
    if (userId === user.id) {
      toast.error('You cannot disable your own admin account.');
      return;
    }
    updateAccountStatus(userId, nextStatus);
    toast.success(nextStatus === 'active' ? 'Account enabled' : 'Account disabled');
  };

  const handleAssignCourse = () => {
    if (!courseAssignment.userId || !courseAssignment.courseId) {
      toast.error('Select a student and a course.');
      return;
    }
    assignCourseToStudent(courseAssignment.userId, courseAssignment.courseId);
    const account = accounts.find((item) => item.id === courseAssignment.userId);
    const course = courses.find((item) => item.id === courseAssignment.courseId);
    toast.success('Course assigned', {
      description: `${course?.title ?? 'Course'} assigned to ${account?.name ?? 'student'}.`,
    });
  };

  const handleModerationAction = (id: number, action: 'approve' | 'reject') => {
    setFlaggedItems(prev => prev.filter(item => item.id !== id));
    if (action === 'approve') {
      toast.success('Content approved', { description: 'The discussion has been restored' });
    } else {
      toast.success('Content removed', { description: 'The discussion has been deleted' });
    }
  };

  const handleCourseReviewAction = (id: number, action: 'approve' | 'reject') => {
    setPendingCourses(prev => prev.filter(item => item.id !== id));
    if (action === 'approve') {
      toast.success('Course approved', { description: 'The course has been published' });
    } else {
      toast.success('Course rejected', { description: 'The course submission has been rejected' });
    }
  };

  const handleSettingToggle = (key: keyof typeof settings, label: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${label} ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform management and oversight
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Signed in as</span>
          <Badge variant="destructive" className="text-xs">{getRoleLabel(user.role)}</Badge>
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
                <p className="text-2xl font-bold">{accounts.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <GraduationCap className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studentCount}</p>
                <p className="text-xs text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instructorCount}</p>
                <p className="text-xs text-muted-foreground">Instructors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                <BookOpen className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <OperationsDashboard />

      {/* Section 1: Course Analytics */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Course Analytics</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Enrollments</p>
                  <p className="text-xl font-bold">{enrollments.length}</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Stored locally
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="text-xl font-bold">{completionRate}%</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> +12.4% YoY
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Most Viewed</p>
                  <p className="text-xl font-bold truncate max-w-28">{mostViewedCourse?.course.title ?? 'No views'}</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                  <Activity className="h-4 w-4 text-rose-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> {mostViewedCourse?.views ?? 0} views
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Leads</p>
                  <p className="text-xl font-bold">{leads.length}</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <PieChart className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> {pendingCertificates.length} certs pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart + Plan Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Course Activity
              </CardTitle>
              <CardDescription>Enrollments and views by course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-56">
                {courseAnalyticsBars.map((item, i) => {
                  const heightPct = Math.max(4, (item.value / maxCourseActivity) * 100);
                  return (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-foreground">
                        {item.value}
                      </span>
                      <div className="w-full relative" style={{ height: '170px' }}>
                        {/* Gradient fill */}
                        <div
                          className="absolute bottom-0 w-full rounded-t-md"
                          style={{
                            height: `${heightPct}%`,
                            background: 'linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary) / 0.4))',
                          }}
                        />
                        {/* Trend line dots */}
                        {i > 0 && (
                          <div
                            className="absolute w-2 h-2 rounded-full bg-primary"
                            style={{
                              bottom: `${heightPct}%`,
                              left: '50%',
                              transform: 'translateX(-50%) translateY(50%)',
                            }}
                          />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-amber-500" />
                Role Distribution
              </CardTitle>
              <CardDescription>Current account roles</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Stacked horizontal bar */}
              <div className="flex h-8 rounded-lg overflow-hidden mb-4">
                {roleDistribution.map((plan) => (
                  <div
                    key={plan.name}
                    className={`${plan.color} flex items-center justify-center transition-all hover:opacity-80`}
                    style={{ width: `${(plan.count / roleTotal) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">{Math.round((plan.count / roleTotal) * 100)}%</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {roleDistribution.map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-sm ${plan.color}`} />
                      <span className="text-sm text-foreground">{plan.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{plan.count.toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Accounts</span>
                  <span className="text-sm font-bold">{accounts.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Section 2: System Health + Content Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-semibold">System Health</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-500" />
                Platform Status
              </CardTitle>
              <CardDescription>Local platform status indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {systemHealth.map((item) => (
                  <div key={item.name} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${healthDotColor[item.status]}`} />
                        <span className="text-xs text-emerald-500 font-medium">OK</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">All Systems Operational</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on this browser session and local app state.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Moderation Queue */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl font-semibold">Content Moderation</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                Moderation Queue
              </CardTitle>
              <CardDescription>Flagged content and pending reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Flagged Discussions */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Flagged Discussions ({flaggedItems.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {flaggedItems.map((item) => (
                      <div key={item.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              by {item.author} · {item.course} · {item.flaggedAt}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1 bg-rose-500/10 text-rose-500 border-rose-500/20">
                              {item.reason}
                            </Badge>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleModerationAction(item.id, 'approve')}>
                              <Eye className="h-3.5 w-3.5 text-emerald-500" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleModerationAction(item.id, 'reject')}>
                              <XCircle className="h-3.5 w-3.5 text-rose-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {flaggedItems.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No flagged discussions</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Pending Course Reviews */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Pending Course Reviews ({pendingCourses.length})
                  </p>
                  <div className="space-y-2">
                    {pendingCourses.map((item) => (
                      <div key={item.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              by {item.author} · {item.lessons} lessons · {item.submittedAt}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleCourseReviewAction(item.id, 'approve')}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleCourseReviewAction(item.id, 'reject')}>
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingCourses.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No pending reviews</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Section 3: Settings + Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings Quick Access */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Quick Settings</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Platform Settings
              </CardTitle>
              <CardDescription>Toggle key platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                      <ShieldAlert className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Maintenance Mode</p>
                      <p className="text-xs text-muted-foreground">Disable platform access for updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={() => handleSettingToggle('maintenanceMode', 'Maintenance Mode')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Users className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Registrations</p>
                      <p className="text-xs text-muted-foreground">Allow new user sign-ups</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.newRegistrations}
                    onCheckedChange={() => handleSettingToggle('newRegistrations', 'New Registrations')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Bell className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Send automated emails to users</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleSettingToggle('emailNotifications', 'Email Notifications')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Certificate Auto-Approval</p>
                      <p className="text-xs text-muted-foreground">Auto-approve certificates above 80%</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.certificateAutoApproval}
                    onCheckedChange={() => handleSettingToggle('certificateAutoApproval', 'Certificate Auto-Approval')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Student Geography</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-500" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Top regions by student count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentGeoData.map((item) => (
                  <div key={item.country} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.country}</span>
                      </div>
                      <span className="text-sm font-semibold">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/80 transition-all hover:bg-primary"
                        style={{ width: `${(item.count / Math.max(1, studentCount)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {studentGeoData.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No student profile locations yet.</p>
                )}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{studentCount} students in stored accounts</span>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info(`${studentGeoData.length} locations recorded`)}>
                  View All Regions
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            User Management
          </CardTitle>
          <CardDescription>Manage user roles and access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 md:grid-cols-5">
            <Input
              placeholder="Full name"
              value={newAccount.name}
              onChange={(event) => setNewAccount((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              type="email"
              placeholder="Email"
              value={newAccount.email}
              onChange={(event) => setNewAccount((prev) => ({ ...prev, email: event.target.value }))}
            />
            <Input
              type="password"
              placeholder="Temporary password"
              value={newAccount.password}
              onChange={(event) => setNewAccount((prev) => ({ ...prev, password: event.target.value }))}
            />
            <Select value={newAccount.role} onValueChange={(value) => setNewAccount((prev) => ({ ...prev, role: value as UserRole }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreateAccount}>Create Account</Button>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 md:grid-cols-3">
            <Select
              value={courseAssignment.userId}
              onValueChange={(value) => setCourseAssignment((prev) => ({ ...prev, userId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  .filter((account) => normalizeRole(account.role) === 'student' && account.status === 'active')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select
              value={courseAssignment.courseId}
              onValueChange={(value) => setCourseAssignment((prev) => ({ ...prev, courseId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleAssignCourse}>Assign Course</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleUserRoleChange(u.id, v as UserRole)}
                      >
                        <SelectTrigger className="w-28 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.status === 'active' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={u.id === user.id}
                        onClick={() => handleAccountStatusToggle(u.id, u.status === 'active' ? 'suspended' : 'active')}
                      >
                        {u.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Course Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {courses.map((course) => {
                const enrolledCount = enrollments.filter((enrollment) => enrollment.courseId === course.id && enrollment.status === 'active').length;
                return (
                  <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {enrolledCount.toLocaleString()} active students · Updated {new Date(course.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={course.published ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {course.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Certificate Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-500" />
              Certificate Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {certificates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No certificates have been issued yet.</p>
              )}
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cert.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {cert.courseName} · Score: {cert.score}% · {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {cert.status === 'pending' || (!cert.verified && cert.status !== 'rejected') ? (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleCertAction(cert.id, cert.userName, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleCertAction(cert.id, cert.userName, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="default" className="text-xs shrink-0">
                      {cert.status === 'rejected' ? 'Rejected' : 'Approved'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Contact & Leads
          </CardTitle>
          <CardDescription>Stored contact, request information, and newsletter submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {leads.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No lead submissions yet.</p>
            )}
            {[...leads].reverse().map((lead) => (
              <div key={lead.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{lead.name || lead.email}</p>
                    <Badge variant="secondary" className="text-xs">
                      {lead.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead.email}
                    {lead.subject ? ` · ${lead.subject}` : ''}
                    {lead.courseInterest ? ` · ${lead.courseInterest}` : ''}
                  </p>
                  {lead.message && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lead.message}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {analyticsEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No tracked platform events yet.</p>
            )}
            {[...analyticsEvents].reverse().slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{event.type.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.courseId || event.lessonId || event.userId || 'Platform event'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(event.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
