'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { normalizeRole } from '@/lib/auth/access-control';
import type { CrmRecord, LessonAttendance, StudentApplicationStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  ListChecks,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const crmStatuses: { value: CrmRecord['status']; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

const applicationStatuses: StudentApplicationStatus[] = ['applied', 'reviewing', 'accepted', 'rejected', 'enrolled'];

const applicationStatusLabels: Record<StudentApplicationStatus, string> = {
  applied: 'Applied',
  reviewing: 'Reviewing',
  accepted: 'Accepted',
  rejected: 'Rejected',
  enrolled: 'Enrolled',
};

const attendanceStatuses: { value: LessonAttendance['status']; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
  { value: 'absent', label: 'Absent' },
];

function percent(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.min(100, Math.round((numerator / denominator) * 100));
}

function formatDate(value?: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function textValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export function OperationsDashboard() {
  const {
    accounts,
    applications,
    attendance,
    auditLogs,
    certificates,
    cohorts,
    cohortEnrollments,
    courses,
    crmRecords,
    enrollments,
    leads,
    lessonProgress,
    navigate,
    recordAttendance,
    updateCrmRecord,
    updateApplicationStatus,
  } = useAppStore();
  const [certificateSearch, setCertificateSearch] = useState('');
  const [attendanceForm, setAttendanceForm] = useState({
    userId: '',
    courseId: '',
    lessonId: '',
    cohortId: '',
    status: 'present' as LessonAttendance['status'],
    notes: '',
  });
  const [crmForm, setCrmForm] = useState({
    recordId: '',
    status: 'new' as CrmRecord['status'],
    notes: '',
    followUpAt: '',
  });

  const students = useMemo(
    () => accounts.filter((account) => normalizeRole(account.role) === 'student' && account.status === 'active'),
    [accounts]
  );
  const selectedCourse = courses.find((course) => course.id === attendanceForm.courseId);
  const selectedStudent = students.find((student) => student.id === attendanceForm.userId);
  const selectedCrmRecord = crmRecords.find((record) => record.id === crmForm.recordId);
  const activeEnrollmentRows = enrollments.filter((enrollment) => enrollment.status === 'active');
  const activeStudentIds = new Set(activeEnrollmentRows.map((enrollment) => enrollment.userId));
  const graduateIds = new Set(
    certificates
      .filter((certificate) => certificate.verified || certificate.status === 'approved')
      .map((certificate) => certificate.userId)
  );
  const completedLessonSlots = activeEnrollmentRows.reduce((total, enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    if (!course) return total;
    const courseLessonIds = new Set(course.lessons.map((lesson) => lesson.id));
    return total + lessonProgress.filter((progress) =>
      progress.userId === enrollment.userId && progress.completed && courseLessonIds.has(progress.lessonId)
    ).length;
  }, 0);
  const assignedLessonSlots = activeEnrollmentRows.reduce((total, enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    return total + (course?.lessons.length ?? 0);
  }, 0);
  const completionRate = percent(completedLessonSlots, assignedLessonSlots);
  const graduationRate = percent(graduateIds.size, Math.max(activeStudentIds.size, graduateIds.size));
  const missedLessons = attendance.filter((entry) => entry.status === 'absent');
  const selectedStudentCompletion = selectedCourse && selectedStudent
    ? percent(
        lessonProgress.filter((progress) =>
          progress.userId === selectedStudent.id &&
          progress.completed &&
          selectedCourse.lessons.some((lesson) => lesson.id === progress.lessonId)
        ).length,
        selectedCourse.lessons.length
      )
    : completionRate;

  const coursePerformance = courses.map((course) => {
    const courseEnrollments = activeEnrollmentRows.filter((enrollment) => enrollment.courseId === course.id);
    const lessonIds = new Set(course.lessons.map((lesson) => lesson.id));
    const completed = courseEnrollments.reduce(
      (total, enrollment) =>
        total + lessonProgress.filter((progress) =>
          progress.userId === enrollment.userId && progress.completed && lessonIds.has(progress.lessonId)
        ).length,
      0
    );
    return {
      id: course.id,
      title: course.title,
      activeStudents: courseEnrollments.length,
      completion: percent(completed, courseEnrollments.length * course.lessons.length),
    };
  });

  const certificateRows = certificates.filter((certificate) => {
    const query = certificateSearch.trim().toLowerCase();
    if (!query) return true;
    return [certificate.credentialId, certificate.userName, certificate.courseName]
      .some((value) => value.toLowerCase().includes(query));
  });

  const crmCounts = {
    leads: crmRecords.filter((record) => record.type === 'lead').length + leads.length,
    applicants: applications.length + crmRecords.filter((record) => record.type === 'applicant').length,
    students: students.length + crmRecords.filter((record) => record.type === 'student').length,
    graduates: graduateIds.size + crmRecords.filter((record) => record.type === 'graduate').length,
  };

  const recentCrmRows = [
    ...crmRecords.map((record) => ({
      id: record.id,
      label: record.name,
      detail: record.email,
      type: record.type,
      status: record.status,
      followUpAt: record.followUpAt,
      createdAt: record.updatedAt,
    })),
    ...applications.map((application) => ({
      id: application.id,
      label: application.applicantName,
      detail: application.email,
      type: 'applicant',
      status: application.status,
      followUpAt: undefined,
      createdAt: application.updatedAt,
    })),
    ...leads.map((lead) => ({
      id: lead.id,
      label: lead.name || lead.email,
      detail: lead.courseInterest || lead.subject || lead.email,
      type: 'lead',
      status: lead.status,
      followUpAt: undefined,
      createdAt: lead.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = (applicationId: string, status: StudentApplicationStatus) => {
    updateApplicationStatus(applicationId, status);
    toast.success('Application status updated', { description: applicationStatusLabels[status] });
  };

  const handleRecordAttendance = () => {
    if (!attendanceForm.userId || !attendanceForm.courseId || !attendanceForm.lessonId) {
      toast.error('Select a student, course, and lesson.');
      return;
    }

    recordAttendance({
      userId: attendanceForm.userId,
      courseId: attendanceForm.courseId,
      lessonId: attendanceForm.lessonId,
      cohortId: attendanceForm.cohortId || undefined,
      status: attendanceForm.status,
      notes: attendanceForm.notes.trim() || undefined,
    });
    toast.success('Attendance recorded');
  };

  const handleSelectCrmRecord = (recordId: string) => {
    const record = crmRecords.find((item) => item.id === recordId);
    setCrmForm({
      recordId,
      status: record?.status ?? 'new',
      notes: record?.notes ?? '',
      followUpAt: record?.followUpAt ? record.followUpAt.slice(0, 10) : '',
    });
  };

  const handleUpdateCrmRecord = () => {
    if (!crmForm.recordId) {
      toast.error('Select a CRM record.');
      return;
    }

    updateCrmRecord(crmForm.recordId, {
      status: crmForm.status,
      notes: crmForm.notes.trim() || undefined,
      followUpAt: crmForm.followUpAt ? new Date(`${crmForm.followUpAt}T09:00:00`).toISOString() : undefined,
    });
    toast.success('CRM record updated', { description: selectedCrmRecord?.name ?? 'Contact status saved.' });
  };

  return (
    <section className="space-y-6" aria-labelledby="operations-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="operations-heading" className="text-xl font-semibold">LMS Operations</h2>
          <p className="text-sm text-muted-foreground">Applications, cohorts, attendance, CRM, certificates, analytics, and audit logs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {applicationStatuses.map((status) => (
            <Badge key={status} variant="outline" className="capitalize">
              {applicationStatusLabels[status]} {applications.filter((application) => application.status === status).length}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserRoundCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xl font-bold">{applications.length}</p>
                <p className="text-xs text-muted-foreground">Applicants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xl font-bold">{activeStudentIds.size}</p>
                <p className="text-xs text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xl font-bold">{graduationRate}%</p>
                <p className="text-xs text-muted-foreground">Graduation Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserRoundCheck className="h-5 w-5 text-primary" />
            Student Applications
          </CardTitle>
          <CardDescription>Admissions pipeline for training program applicants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applications.slice(0, 8).map((application) => (
              <div key={application.id} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{application.applicantName}</p>
                      <Badge variant={application.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {applicationStatusLabels[application.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {application.email} {application.city ? `- ${application.city}` : ''} - Applied {formatDate(application.createdAt)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{application.motivation}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {applicationStatuses.filter((status) => status !== application.status).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={status === 'accepted' || status === 'enrolled' ? 'default' : 'outline'}
                        className="h-7 text-xs"
                        onClick={() => handleStatusChange(application.id, status)}
                      >
                        {applicationStatusLabels[status]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No student applications have been submitted yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-emerald-500" />
              Cohorts & Attendance
            </CardTitle>
            <CardDescription>Record attendance and track cohort capacity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {cohorts.map((cohort) => {
                const cohortCount = cohortEnrollments.filter((enrollment) => enrollment.cohortId === cohort.id && enrollment.status === 'active').length;
                const instructor = accounts.find((account) => account.id === cohort.instructorId);
                return (
                  <div key={cohort.id} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{cohort.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(cohort.startsAt)} - {formatDate(cohort.endsAt)} - capacity {cohort.capacity}
                        </p>
                        <p className="text-xs text-muted-foreground">Instructor: {instructor?.name ?? 'Unassigned'}</p>
                      </div>
                      <Badge variant="outline">{cohort.status}</Badge>
                    </div>
                    <Progress className="mt-3" value={percent(cohortCount, cohort.capacity)} />
                    <p className="mt-1 text-xs text-muted-foreground">{cohortCount} enrolled</p>
                  </div>
                );
              })}
            </div>

            <Separator />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={attendanceForm.userId} onValueChange={(value) => setAttendanceForm((prev) => ({ ...prev, userId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cohort</Label>
                <Select value={attendanceForm.cohortId} onValueChange={(value) => setAttendanceForm((prev) => ({ ...prev, cohortId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts.map((cohort) => (
                      <SelectItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={attendanceForm.courseId}
                  onValueChange={(value) => {
                    const course = courses.find((item) => item.id === value);
                    setAttendanceForm((prev) => ({ ...prev, courseId: value, lessonId: course?.lessons[0]?.id ?? '' }));
                  }}
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
              </div>
              <div className="space-y-2">
                <Label>Lesson</Label>
                <Select value={attendanceForm.lessonId} onValueChange={(value) => setAttendanceForm((prev) => ({ ...prev, lessonId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedCourse?.lessons ?? []).map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={attendanceForm.status} onValueChange={(value) => setAttendanceForm((prev) => ({ ...prev, status: value as LessonAttendance['status'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Completion</Label>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{selectedStudent?.name ?? 'Selected student'}</span>
                    <span className="font-semibold">{selectedStudentCompletion}%</span>
                  </div>
                  <Progress className="mt-2" value={selectedStudentCompletion} />
                </div>
              </div>
            </div>
            <Textarea
              value={attendanceForm.notes}
              onChange={(event) => setAttendanceForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Attendance notes"
            />
            <Button onClick={handleRecordAttendance}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Record Attendance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Missed Lesson Alerts
            </CardTitle>
            <CardDescription>Recorded absences that need follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {missedLessons.slice(0, 12).map((entry) => {
                const student = accounts.find((account) => account.id === entry.userId);
                const course = courses.find((item) => item.id === entry.courseId);
                const lesson = course?.lessons.find((item) => item.id === entry.lessonId);
                return (
                  <div key={entry.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{student?.name ?? 'Student'}</p>
                        <p className="text-xs text-muted-foreground">{course?.title ?? 'Course'} - {lesson?.title ?? 'Lesson'}</p>
                        {entry.notes && <p className="mt-1 text-xs text-muted-foreground">{entry.notes}</p>}
                      </div>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-600">Missed</Badge>
                    </div>
                  </div>
                );
              })}
              {missedLessons.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No missed lessons are currently recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-orange-500" />
                Certificate Registry
              </CardTitle>
              <CardDescription>Search issued certificates and open the public verification page</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('certificate-verify')}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Public Verification
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={certificateSearch}
              onChange={(event) => setCertificateSearch(event.target.value)}
              placeholder="Search certificate ID, student, or course"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificateRows.map((certificate) => {
                  const status = certificate.status ?? (certificate.verified ? 'approved' : 'pending');
                  return (
                    <TableRow key={certificate.id}>
                      <TableCell className="font-mono text-xs">{certificate.credentialId}</TableCell>
                      <TableCell>{certificate.userName}</TableCell>
                      <TableCell className="hidden md:table-cell">{certificate.courseName}</TableCell>
                      <TableCell>
                        <Badge variant={status === 'rejected' ? 'destructive' : status === 'approved' ? 'default' : 'secondary'}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{certificate.score}%</TableCell>
                    </TableRow>
                  );
                })}
                {certificateRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      No matching certificates found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              CRM Pipeline
            </CardTitle>
            <CardDescription>Lead, applicant, student, and graduate records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(crmCounts).map(([label, value]) => (
                <div key={label} className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs capitalize text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentCrmRows.slice(0, 10).map((row) => (
                <div key={`${row.type}-${row.id}`} className="flex items-start justify-between gap-3 rounded-lg bg-muted/30 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.detail}</p>
                    {row.followUpAt && (
                      <p className="truncate text-xs text-muted-foreground">Follow up {formatDate(row.followUpAt)}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="capitalize">{row.type}</Badge>
                    <span className="text-[10px] capitalize text-muted-foreground">{row.status}</span>
                  </div>
                </div>
              ))}
              {recentCrmRows.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No CRM records yet.</p>
              )}
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>CRM record</Label>
                <Select value={crmForm.recordId} onValueChange={handleSelectCrmRecord}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {crmRecords.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {record.name} - {record.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact status</Label>
                <Select
                  value={crmForm.status}
                  onValueChange={(value) => setCrmForm((prev) => ({ ...prev, status: value as CrmRecord['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {crmStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crm-follow-up">Follow-up date</Label>
                <Input
                  id="crm-follow-up"
                  type="date"
                  value={crmForm.followUpAt}
                  onChange={(event) => setCrmForm((prev) => ({ ...prev, followUpAt: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="crm-notes">Notes</Label>
                <Textarea
                  id="crm-notes"
                  value={crmForm.notes}
                  onChange={(event) => setCrmForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Contact notes and next step"
                  rows={3}
                />
              </div>
            </div>
            <Button className="mt-3" onClick={handleUpdateCrmRecord}>
              Save CRM Update
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Course Performance
            </CardTitle>
            <CardDescription>Completion and enrollment performance by course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coursePerformance.map((course) => (
                <div key={course.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{course.title}</span>
                    <span className="whitespace-nowrap text-muted-foreground">{course.activeStudents} active - {course.completion}%</span>
                  </div>
                  <Progress value={course.completion} />
                </div>
              ))}
              {coursePerformance.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No course performance data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Admin Audit Logs
          </CardTitle>
          <CardDescription>Recent persisted administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {auditLogs.slice(0, 15).map((log, index) => (
              <div key={textValue(log.id, `audit-${index}`)} className="flex items-start justify-between gap-3 border-b border-border/50 pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{textValue(log.action, 'admin_action').replaceAll('_', ' ')}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {textValue(log.actor_id, 'system')} - {JSON.stringify(log.metadata ?? {})}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(textValue(log.created_at))}</span>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4" />
                No persisted admin audit logs yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
