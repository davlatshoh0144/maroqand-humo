'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { getCertificateReadiness } from '@/lib/lms/course-rules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Award,
  Download,
  ExternalLink,
  GraduationCap,
  Star,
  CalendarDays,
  Shield,
  FileText,
  Share2,
  CheckCircle2,
  Clock,
  TrendingUp,
  ScrollText,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { Certificate } from '@/lib/types';
import { jsPDF } from 'jspdf';

/** Generate a random credential ID */
function generateCredentialId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'MHA-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Certificate preview card that looks like a real certificate */
function CertificatePreview({ cert }: { cert: Certificate }) {
  return (
    <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 via-card to-primary/5">
      {/* Decorative border pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-2 border border-primary/10 rounded" />
        <div className="absolute inset-3 border border-primary/5 rounded" />
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30" />

      <div className="relative p-8 text-center space-y-4">
        {/* Academy crest */}
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
          Certificate of Completion
        </p>

        <h3 className="text-lg font-bold text-primary">
          Marokand Humo Academy
        </h3>

        <div className="w-24 h-px bg-primary/20 mx-auto" />

        <p className="text-sm text-muted-foreground">
          This is to certify that
        </p>

        <p className="text-xl font-bold text-foreground">
          {cert.userName}
        </p>

        <p className="text-sm text-muted-foreground">
          has successfully completed the course
        </p>

        <p className="text-lg font-semibold text-foreground">
          {cert.courseName}
        </p>

        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="secondary"
            className={`${
              cert.score >= 90
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : cert.score >= 70
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}
          >
            Score: {cert.score}%
          </Badge>
        </div>

        <div className="w-24 h-px bg-primary/20 mx-auto" />

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            {new Date(cert.issuedAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            {cert.credentialId}
          </div>
        </div>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function CertificateWall() {
  const {
    certificates,
    navigate,
    user,
    enrollments,
    lessonProgress,
    quizAttempts,
    submissions,
    issueCertificate,
    courses,
    assignments,
    quizzes,
  } = useAppStore();
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  const sortedCertificates = useMemo(
    () =>
      certificates
        .filter((certificate) => certificate.userId === user?.id)
        .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()),
    [certificates, user?.id]
  );

  const certificateReadinessRows = useMemo(() => {
    if (!user) return [];
    return courses.filter((course) => {
      if (!course.published) return false;
      const isEnrolled = enrollments.some(
        (e) => e.userId === user.id && e.courseId === course.id && e.status === 'active'
      );
      return isEnrolled;
    }).map((course) => ({
      course,
      readiness: getCertificateReadiness({
        course,
        userId: user.id,
        lessonProgress,
        quizAttempts,
        submissions,
        certificates,
        assignments,
        quizzes,
      }),
    }));
  }, [assignments, certificates, courses, enrollments, lessonProgress, quizAttempts, quizzes, submissions, user]);

  const certificateReadyCourses = certificateReadinessRows
    .filter((row) => row.readiness.eligible)
    .map((row) => row.course);

  // Courses in progress (enrolled, some lessons completed but not all)
  const coursesInProgress = useMemo(() => {
    if (!user) return 0;
    return courses.filter((course) => {
      if (!course.published) return false;
      const isEnrolled = enrollments.some(
        (e) => e.userId === user.id && e.courseId === course.id && e.status === 'active'
      );
      if (!isEnrolled) return false;
      const completedCount = course.lessons.filter((l) =>
        lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user.id)
      ).length;
      return completedCount > 0 && completedCount < course.lessons.length;
    }).length;
  }, [courses, enrollments, lessonProgress, user]);

  const latestEarnedDate = useMemo(() => {
    if (sortedCertificates.length === 0) return null;
    return new Date(sortedCertificates[0].issuedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [sortedCertificates]);

  const handleGenerateCertificate = (courseId: string) => {
    if (!user) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const readiness = getCertificateReadiness({
      course,
      userId: user.id,
      lessonProgress,
      quizAttempts,
      submissions,
      certificates,
      assignments,
      quizzes,
    });

    if (!readiness.eligible) {
      toast.error('Certificate requirements are not complete.', {
        description: readiness.blockers.join(', '),
      });
      return;
    }

    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      userId: user.id,
      courseId: course.id,
      credentialId: generateCredentialId(),
      score: readiness.score,
      issuedAt: new Date().toISOString(),
      verified: false,
      status: 'pending',
      userName: user.name,
      courseName: course.title,
    };

    issueCertificate(cert);
    toast.success('Certificate submitted for approval.', { duration: 3000 });
  };

  const handleDownloadPdf = (cert: Certificate) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Page dimensions (A4 landscape: 297 x 210 mm)
      const pageW = 297;
      const pageH = 210;

      // Border frame
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(2);
      doc.rect(10, 10, pageW - 20, pageH - 20);
      doc.setLineWidth(0.5);
      doc.rect(14, 14, pageW - 28, pageH - 28);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(30, 58, 138);
      doc.text('Certificate of Completion', pageW / 2, 50, { align: 'center' });

      // Academy name
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('Marokand Humo Academy', pageW / 2, 65, { align: 'center' });

      // Decorative line
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.5);
      doc.line(pageW / 2 - 50, 72, pageW / 2 + 50, 72);

      // "This is to certify that"
      doc.setFontSize(12);
      doc.setTextColor(120, 120, 120);
      doc.text('This is to certify that', pageW / 2, 85, { align: 'center' });

      // Student name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(0, 0, 0);
      doc.text(cert.userName, pageW / 2, 100, { align: 'center' });

      // "has successfully completed the course"
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(120, 120, 120);
      doc.text('has successfully completed the course', pageW / 2, 115, { align: 'center' });

      // Course name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.text(cert.courseName, pageW / 2, 130, { align: 'center' });

      // Score badge
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Score: ${cert.score}%`, pageW / 2, 142, { align: 'center' });

      // Decorative line
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.5);
      doc.line(pageW / 2 - 50, 150, pageW / 2 + 50, 150);

      // Date and credential ID
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${new Date(cert.issuedAt).toLocaleDateString()}`, pageW / 4, 170);
      doc.text(`Credential ID: ${cert.credentialId}`, (pageW * 3) / 4, 170, { align: 'right' });

      // Signature line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(pageW / 2 - 40, 185, pageW / 2 + 40, 185);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Academy Director', pageW / 2, 192, { align: 'center' });

      // Save
      doc.save(`certificate-${cert.credentialId}.pdf`);
      toast.success('PDF downloaded!', { description: `Certificate for ${cert.courseName} saved.` });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('PDF generation failed', { description: 'Please try again later.' });
    }
  };

  const handleShareLinkedIn = (cert: Certificate) => {
    const shareUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.courseName)}&organizationName=${encodeURIComponent('Marokand Humo Academy')}&credentialId=${encodeURIComponent(cert.credentialId)}`;
    toast.success('LinkedIn share link ready!', {
      description: 'Opening LinkedIn certification page...',
      action: {
        label: 'Open',
        onClick: () => window.open(shareUrl, '_blank'),
      },
    });
  };

  const handleVerify = (credentialId: string) => {
    useAppStore.setState({ selectedCredentialId: credentialId });
    navigate('certificate-verify');
  };

  // Empty state for no user
  if (!user) {
    return (
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/5 p-8">
          <div className="absolute inset-0 route-map-pattern opacity-50" />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/15 border-2 border-primary/25 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Certificates</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Your earned credentials and certifications
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Sign In to View Certificates</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Log in to see your earned certificates and generate new ones for completed courses.
          </p>
          <Button onClick={() => navigate('login')} className="gap-1.5">
            <Star className="h-4 w-4" /> Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Empty state with generate button
  if (sortedCertificates.length === 0 && certificateReadyCourses.length === 0 && certificateReadinessRows.length === 0) {
    return (
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/5 p-8">
          <div className="absolute inset-0 route-map-pattern opacity-50" />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/15 border-2 border-primary/25 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Certificates</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Your earned credentials and certifications
              </p>
            </div>
          </div>
        </div>

        {/* Empty State with scroll/diploma illustration */}
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/20 flex items-center justify-center">
              <ScrollText className="h-12 w-12 text-primary/60" />
            </div>
          </div>
          <h3 className="text-xl font-semibold">No Certificates Yet</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Certificates unlock after required lessons are complete, course quizzes meet the passing threshold,
            and all course assignments are approved by an instructor.
          </p>
          <Button onClick={() => navigate('courses')} className="gap-1.5">
            <Star className="h-4 w-4" /> Start Completing Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner with graduation cap, route-map pattern, gradient */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/5 p-6 sm:p-8">
        <div className="absolute inset-0 route-map-pattern opacity-50" />
        <div className="absolute inset-0 hero-gradient-light" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="h-14 w-14 rounded-full bg-primary/15 border-2 border-primary/25 flex items-center justify-center flex-shrink-0"
            >
              <GraduationCap className="h-7 w-7 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">Certificates</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Your earned credentials and certifications
              </p>
            </div>
          </div>
          {sortedCertificates.length > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-sm">
              {sortedCertificates.length} Certificate{sortedCertificates.length !== 1 ? 's' : ''} Earned
            </Badge>
          )}
        </div>
      </div>

      {/* Certificate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sortedCertificates.length}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </div>
            <div className="absolute right-2 bottom-1 opacity-[0.04] pointer-events-none">
              <Award className="h-16 w-16" />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{coursesInProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="absolute right-2 bottom-1 opacity-[0.04] pointer-events-none">
              <TrendingUp className="h-16 w-16" />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{latestEarnedDate ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Latest Earned</p>
            </div>
            <div className="absolute right-2 bottom-1 opacity-[0.04] pointer-events-none">
              <Clock className="h-16 w-16" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Certificate Section for completed courses without certs */}
      {certificateReadyCourses.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Ready to Generate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You&apos;ve met the lesson, quiz, and assignment rules for these courses.
            </p>
            {certificateReadyCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.lessons.length} lessons · {course.category}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" className="gap-1.5 flex-shrink-0">
                      <Award className="h-3.5 w-3.5" /> Generate Certificate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Generate Certificate?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Generate a certificate request for &quot;{course.title}&quot;? This will create a unique
                        certificate ID. Public verification works after admin approval.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleGenerateCertificate(course.id)}>
                        Generate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {certificateReadinessRows.some((row) => !row.readiness.eligible && !row.readiness.hasCertificate) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Certificate Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificateReadinessRows
              .filter((row) => !row.readiness.eligible && !row.readiness.hasCertificate)
              .map(({ course, readiness }) => (
                <div key={course.id} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Lessons {readiness.completedRequiredLessons}/{readiness.requiredLessons} · Quiz avg {readiness.quizAverage}% · Assignments {readiness.approvedAssignments}/{readiness.requiredAssignments}
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit text-xs">
                      Locked
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {readiness.blockers.map((blocker) => (
                      <Badge key={blocker} variant="outline" className="text-xs text-muted-foreground">
                        {blocker}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Certificate Grid */}
      {sortedCertificates.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {sortedCertificates.map((cert) => {
            const scoreColor =
              cert.score >= 90
                ? 'text-emerald-500'
                : cert.score >= 70
                  ? 'text-amber-500'
                  : 'text-red-500';

            return (
              <motion.div key={cert.id} variants={cardVariants}>
                <Card className="overflow-hidden group holo-border hover:-translate-y-1 transition-all duration-300">
                  {/* Certificate header accent */}
                  <div className="h-2 bg-gradient-to-r from-primary/80 via-purple-500/60 to-primary/40" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${scoreColor} ${
                          cert.score >= 90
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : cert.score >= 70
                              ? 'bg-amber-500/10 border-amber-500/20'
                              : 'bg-red-500/10 border-red-500/20'
                        }`}
                      >
                        {cert.score}%
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2 leading-tight">{cert.courseName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Issued {new Date(cert.issuedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        ID: {cert.credentialId}
                      </div>
                      {/* Verified/Unverified badge with animated checkmark */}
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        {cert.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 verified-badge">
                            <CheckCircle2 className="h-3.5 w-3.5 check-icon" />
                            Approved
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {cert.status === 'rejected' ? 'Rejected' : 'Pending approval'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => setPreviewCert(cert)}
                      >
                        <Award className="h-3.5 w-3.5" /> View Certificate
                      </Button>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs download-animate"
                          onClick={() => handleDownloadPdf(cert)}
                        >
                          <Download className="h-3 w-3" /> PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => handleShareLinkedIn(cert)}
                        >
                          <Share2 className="h-3 w-3" /> Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => handleVerify(cert.credentialId)}
                        >
                          <ExternalLink className="h-3 w-3" /> Verify
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Certificate Preview Dialog */}
      <AnimatePresence>
        {previewCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setPreviewCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <CertificatePreview cert={previewCert} />
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPdf(previewCert)}
                  className="gap-1.5 download-animate"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareLinkedIn(previewCert)}
                  className="gap-1.5"
                >
                  <Share2 className="h-4 w-4" /> Share on LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify(previewCert.credentialId)}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Verify
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mx-auto mt-3 block text-muted-foreground"
                onClick={() => setPreviewCert(null)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
