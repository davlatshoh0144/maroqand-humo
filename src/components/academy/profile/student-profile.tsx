'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  User,
  MapPin,
  BookOpen,
  Award,
  Trophy,
  Target,
  Edit3,
  CheckCircle2,
  BarChart3,
  Briefcase,
  GraduationCap,
  Star,
  X,
  Flame,
  Clock,
  Download,
  Plus,
  Trash2,
  FileText,
  Lightbulb,
  ChevronRight,
  Linkedin,
  Github,
  Globe,
  Pencil,
  Activity,
  Quote,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const SKILLS_OPTIONS = [
  'Load Booking',
  'Rate Negotiation',
  'HOS Compliance',
  'Broker Communication',
  'BOL/POD Management',
  'DOT Compliance',
  'TMS Software',
  'ELD Monitoring',
  'Flatbed Operations',
  'Reefer Operations',
  'Dispatch Planning',
  'Customer Service',
];

const LEARNING_TRACKS = [
  'Dispatch Fundamentals',
  'Broker Communication',
  'Compliance & Safety',
  'Fleet Management',
  'Full Career Track',
];

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export function StudentProfile() {
  const {
    user,
    enrollments,
    lessonProgress,
    quizAttempts,
    submissions,
    certificates,
    navigate,
    updateProfile,
    courses,
  } = useAppStore();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editCity, setEditCity] = useState(user?.city ?? '');
  const [editBio, setEditBio] = useState(user?.bio ?? '');
  const [editTrack, setEditTrack] = useState('Full Career Track');
  const [editSkills, setEditSkills] = useState<string[]>([
    'Load Booking',
    'Rate Negotiation',
    'Broker Communication',
  ]);

  // Resume builder state
  const [resumeTab, setResumeTab] = useState('preview');
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    {
      id: 'we-1',
      company: 'Regional Logistics Co.',
      role: 'Junior Dispatcher',
      startDate: '2024-01',
      endDate: 'Present',
      description: 'Handled load booking and broker communication for a fleet of 15 trucks. Managed daily dispatch operations and rate negotiations.',
    },
  ]);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([
    {
      id: 'ed-1',
      institution: 'Marokand Humo Academy',
      degree: 'Certificate',
      field: 'Freight Dispatch',
      startDate: '2024-01',
      endDate: '2024-06',
    },
  ]);
  const [resumeSkills, setResumeSkills] = useState<string[]>([
    'Load Booking',
    'Rate Negotiation',
    'Broker Communication',
    'HOS Compliance',
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const userCertificates = useMemo(
    () => certificates.filter((certificate) => certificate.userId === user?.id),
    [certificates, user?.id]
  );
  const userSubmissions = useMemo(
    () => submissions.filter((submission) => submission.userId === user?.id),
    [submissions, user?.id]
  );

  // Computed stats
  const completedCourses = useMemo(() => {
    return courses.filter((c) => {
      const completedLessons = c.lessons.filter((l) =>
        lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user?.id)
      ).length;
      return completedLessons === c.lessons.length;
    }).length;
  }, [lessonProgress, user?.id]);

  const avgQuizScore = useMemo(() => {
    const userAttempts = quizAttempts.filter((attempt) => attempt.userId === user?.id);
    if (userAttempts.length === 0) return 0;
    return Math.round(
      userAttempts.reduce((sum, a) => sum + a.score, 0) / userAttempts.length
    );
  }, [quizAttempts, user?.id]);

  const activeEnrollments = enrollments.filter((e) => e.status === 'active' && e.userId === user?.id).length;

  // Learning statistics
  const totalHoursLearned = useMemo(() => {
    const completedLessonIds = lessonProgress
      .filter((p) => p.completed && p.userId === user?.id)
      .map((p) => p.lessonId);
    let totalMinutes = 0;
    courses.forEach((c) => {
      c.lessons.forEach((l) => {
        if (completedLessonIds.includes(l.id)) {
          totalMinutes += l.durationMin;
        }
      });
    });
    return Math.round(totalMinutes / 60);
  }, [lessonProgress, user?.id]);

  const currentStreak = useMemo(() => {
    const activityDates = new Set(
      lessonProgress
        .filter((progress) => progress.userId === user?.id && (progress.updatedAt || progress.completedAt))
        .map((progress) => new Date(progress.updatedAt || progress.completedAt || '').toDateString())
    );
    if (activityDates.size === 0) return 0;
    let streak = 0;
    const cursor = new Date();
    while (activityDates.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [lessonProgress, user?.id]);

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    let score = 0;
    const total = 6;
    if (user.name && user.name.length > 1) score++;
    if (user.city) score++;
    if (user.bio && user.bio.length > 10) score++;
    if (user.email) score++;
    if (activeEnrollments > 0) score++;
    if (completedCourses > 0) score++;
    return Math.round((score / total) * 100);
  }, [user, activeEnrollments, completedCourses]);

  const profileSuggestions = useMemo(() => {
    if (!user) return [];
    const suggestions: string[] = [];
    if (!user.city) suggestions.push('Add your city/location');
    if (!user.bio || user.bio.length < 10) suggestions.push('Write a bio');
    if (activeEnrollments === 0) suggestions.push('Enroll in a course');
    if (completedCourses === 0) suggestions.push('Complete your first course');
    if (workExperiences.length === 0) suggestions.push('Add work experience to your resume');
    return suggestions;
  }, [user, activeEnrollments, completedCourses, workExperiences.length]);

  // Completed courses as skill badges
  const courseBadges = useMemo(() => {
    return courses
      .filter((c) => {
        const completedLessons = c.lessons.filter((l) =>
          lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user?.id)
        ).length;
        return completedLessons === c.lessons.length;
      })
      .map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
      }));
  }, [lessonProgress, user?.id]);

  // Enrolled courses with progress for skill badges
  const enrolledCourseBadges = useMemo(() => {
    return courses
      .filter((c) => enrollments.some((e) => e.courseId === c.id && e.status === 'active' && e.userId === user?.id))
      .map((c) => {
        const completedLessons = c.lessons.filter((l) =>
          lessonProgress.some((p) => p.lessonId === l.id && p.completed && p.userId === user?.id)
        ).length;
        const percent = Math.round((completedLessons / c.lessons.length) * 100);
        return {
          id: c.id,
          title: c.title,
          category: c.category,
          difficulty: c.difficulty,
          percent,
          completed: percent === 100,
        };
      });
  }, [enrollments, lessonProgress, user?.id]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Please Log In</h2>
        <p className="text-muted-foreground">Log in to view your profile and progress.</p>
        <Button onClick={() => navigate('login')}>Log In</Button>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateProfile({
      name: editName.trim() || user.name,
      city: editCity.trim(),
      bio: editBio.trim(),
    });
    toast.success('Profile updated successfully!');
    setEditOpen(false);
  };

  const toggleSkill = (skill: string) => {
    setEditSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Resume builder handlers
  const addWorkExperience = () => {
    setWorkExperiences((prev) => [
      ...prev,
      {
        id: `we-${Date.now()}`,
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]);
  };

  const removeWorkExperience = (id: string) => {
    setWorkExperiences((prev) => prev.filter((we) => we.id !== id));
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setWorkExperiences((prev) =>
      prev.map((we) => (we.id === id ? { ...we, [field]: value } : we))
    );
  };

  const addEducation = () => {
    setEducationEntries((prev) => [
      ...prev,
      {
        id: `ed-${Date.now()}`,
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
      },
    ]);
  };

  const removeEducation = (id: string) => {
    setEducationEntries((prev) => prev.filter((ed) => ed.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducationEntries((prev) =>
      prev.map((ed) => (ed.id === id ? { ...ed, [field]: value } : ed))
    );
  };

  const addResumeSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !resumeSkills.includes(trimmed)) {
      setResumeSkills((prev) => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const removeResumeSkill = (skill: string) => {
    setResumeSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleDownloadResume = () => {
    // Generate a simple text resume
    const lines: string[] = [];
    lines.push('===========================================');
    lines.push(`  ${user.name}`);
    lines.push(`  ${user.city || 'United States'}`);
    lines.push(`  ${user.email}`);
    lines.push('===========================================');
    lines.push('');
    lines.push('PROFESSIONAL SUMMARY');
    lines.push('-------------------');
    lines.push(user.bio || 'Freight dispatcher trained in load booking, broker communication, and DOT compliance through Marokand Humo Academy.');
    lines.push('');
    lines.push('SKILLS');
    lines.push('------');
    lines.push(resumeSkills.join(', '));
    lines.push('');
    if (workExperiences.length > 0) {
      lines.push('WORK EXPERIENCE');
      lines.push('---------------');
      workExperiences.forEach((we) => {
        lines.push(`${we.role} — ${we.company}`);
        lines.push(`${we.startDate} — ${we.endDate}`);
        if (we.description) lines.push(`  ${we.description}`);
        lines.push('');
      });
    }
    lines.push('EDUCATION');
    lines.push('---------');
    educationEntries.forEach((ed) => {
      lines.push(`${ed.degree} in ${ed.field} — ${ed.institution}`);
      lines.push(`${ed.startDate} — ${ed.endDate}`);
      lines.push('');
    });
    lines.push('CERTIFICATIONS');
    lines.push('--------------');
    if (userCertificates.length > 0) {
      userCertificates.forEach((c) => {
        lines.push(`• ${c.courseName} (${c.credentialId})`);
      });
    } else {
      lines.push('Marokand Humo Academy — Freight Dispatch Program (In Progress)');
    }
    lines.push('');
    lines.push(`Courses Completed: ${completedCourses} | Certificates: ${userCertificates.length} | Avg Quiz Score: ${avgQuizScore}%`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.name.replace(/\s+/g, '_')}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded as a text file.');
  };

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Completion Bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Profile {profileCompletion}% Complete</p>
                {profileSuggestions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {profileSuggestions[0]} to improve your profile
                  </p>
                )}
              </div>
            </div>
            {profileSuggestions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => setEditOpen(true)}
              >
                Complete Profile <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Progress value={profileCompletion} className="h-2" />
          {profileSuggestions.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profileSuggestions.slice(0, 3).map((suggestion, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-full px-2.5 py-1">
                  <Lightbulb className="h-3 w-3 text-amber-500" />
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Header with gradient banner */}
      <Card className="overflow-hidden">
        {/* Gradient banner background */}
        <div className="profile-header-gradient h-24 relative">
          <div className="absolute inset-0 hero-dots-light opacity-50" />
        </div>
        <CardContent className="p-6 -mt-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar overlapping the banner */}
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl font-bold text-primary-foreground ring-4 ring-card shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{user.city || 'Location not set'}</span>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {user.bio || 'No bio yet. Click Edit to add your bio.'}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Load Booking', 'Rate Negotiation', 'Broker Communication'].map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    {skill}
                  </Badge>
                ))}
              </div>
              {/* Social links */}
              <div className="flex items-center gap-2 pt-1">
                <button className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 social-link-hover transition-all" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </button>
                <button className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 social-link-hover transition-all" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </button>
                <button className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 social-link-hover transition-all" aria-label="Website">
                  <Globe className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Statistics with watermark icons + completion ring */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Learning Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Clock, label: 'Hours Learned', value: `${totalHoursLearned}h`, color: 'text-primary' },
                { icon: BookOpen, label: 'Courses Completed', value: completedCourses, color: 'text-emerald-500' },
                { icon: Award, label: 'Certificates', value: userCertificates.length, color: 'text-purple-500' },
                { icon: Flame, label: 'Day Streak', value: currentStreak, color: 'text-orange-500' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/30 relative overflow-hidden">
                  <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <stat.icon className="absolute right-1 bottom-0 h-12 w-12 opacity-[0.04] pointer-events-none" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion percentage ring chart */}
        <Card className="flex flex-col items-center justify-center p-4">
          <div className="relative h-28 w-28">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="url(#profileGrad)" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 - (283 * profileCompletion / 100)}
                className="completion-ring-circle"
              />
              <defs>
                <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className="[stop-color:oklch(0.65_0.18_240)]" />
                  <stop offset="100%" className="[stop-color:oklch(0.55_0.20_280)]" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{profileCompletion}%</span>
              <span className="text-[9px] text-muted-foreground">Complete</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Profile</p>
        </Card>
      </div>

      {/* Skills Radar Chart (CSS-based) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Skills Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* CSS Radar Chart */}
            <div className="radar-chart flex-shrink-0">
              <div className="radar-bg" />
              <div className="radar-fill" />
              <div className="radar-lines" style={{ position: 'absolute', inset: '20%' }} />
              <div className="radar-lines" style={{ position: 'absolute', inset: '40%' }} />
              {/* Axis labels */}
              {['Booking', 'HOS', 'Broker', 'DOT', 'TMS', 'Dispatch'].map((label, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                const x = 50 + 48 * Math.cos(angle);
                const y = 50 + 48 * Math.sin(angle);
                return (
                  <span
                    key={label}
                    className="absolute text-[9px] text-muted-foreground font-medium whitespace-nowrap"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {label}
                  </span>
                );
              })}
              {/* Data points */}
              {[
                { skill: 'Booking', pct: 85 },
                { skill: 'HOS', pct: 70 },
                { skill: 'Broker', pct: 75 },
                { skill: 'DOT', pct: 60 },
                { skill: 'TMS', pct: 50 },
                { skill: 'Dispatch', pct: 80 },
              ].map((point, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                const r = (point.pct / 100) * 45;
                const x = 50 + r * Math.cos(angle);
                const y = 50 + r * Math.sin(angle);
                return (
                  <div
                    key={point.skill}
                    className="absolute h-2.5 w-2.5 rounded-full bg-primary border-2 border-card shadow-sm"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                );
              })}
            </div>
            {/* Skill bars */}
            <div className="flex-1 space-y-3 w-full">
              {[
                { name: 'Load Booking', pct: 85 },
                { name: 'HOS Compliance', pct: 70 },
                { name: 'Broker Communication', pct: 75 },
                { name: 'DOT Compliance', pct: 60 },
                { name: 'TMS Software', pct: 50 },
                { name: 'Dispatch Planning', pct: 80 },
              ].map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{skill.name}</span>
                    <span className="font-medium">{skill.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Badges from Courses */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" /> Course Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledCourseBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {enrolledCourseBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    badge.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-muted/30 border-border/50'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    badge.completed
                      ? 'bg-emerald-500/10'
                      : 'bg-muted/50'
                  }`}>
                    {badge.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{badge.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className={`text-[9px] ${difficultyColor(badge.difficulty)}`}>
                        {badge.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{badge.percent}%</span>
                    </div>
                    {!badge.completed && (
                      <Progress value={badge.percent} className="h-1 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Award className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Enroll in courses to earn skill badges.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('courses')} className="mt-3 gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Browse Courses
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{completedCourses}</p>
            <p className="text-xs text-muted-foreground">Courses Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{avgQuizScore}%</p>
            <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{userSubmissions.length}</p>
            <p className="text-xs text-muted-foreground">Practices Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{userCertificates.length}</p>
            <p className="text-xs text-muted-foreground">Certificates</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Courses */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Active Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {courses
            .filter((c) => enrollments.some((e) => e.courseId === c.id && e.status === 'active'))
            .slice(0, 5)
            .map((course) => {
              const completedLessons = course.lessons.filter((l) =>
                lessonProgress.some((p) => p.lessonId === l.id && p.completed)
              ).length;
              const percent = Math.round((completedLessons / course.lessons.length) * 100);
              return (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{course.title}</p>
                    <span className="text-xs text-muted-foreground">{percent}%</span>
                  </div>
                  <Progress value={percent} className="h-1.5" />
                </div>
              );
            })}
          {activeEnrollments === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active courses. Enroll in a course to start learning!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quiz Scores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" /> Quiz Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizAttempts.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {quizAttempts.slice(-10).reverse().map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    {attempt.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">Quiz {attempt.quizId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        attempt.score >= 80
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : attempt.score >= 60
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }
                    >
                      {attempt.score}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No quiz attempts yet. Complete lessons to take quizzes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/50" />
            {[
              { icon: BookOpen, color: 'bg-primary/10 text-primary', title: 'Completed Lesson: Introduction to Dispatch', time: '2 hours ago' },
              { icon: Trophy, color: 'bg-emerald-500/10 text-emerald-500', title: 'Earned "First Steps" Achievement', time: '5 hours ago' },
              { icon: Target, color: 'bg-amber-500/10 text-amber-500', title: 'Scored 85% on HOS Compliance Quiz', time: '1 day ago' },
              { icon: Award, color: 'bg-purple-500/10 text-purple-500', title: 'Started course: Load Board Training', time: '2 days ago' },
              { icon: Flame, color: 'bg-orange-500/10 text-orange-500', title: '5-day learning streak!', time: '3 days ago' },
            ].map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex items-start gap-3 py-2 relative"
              >
                <div className={`h-6 w-6 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0 z-10`}>
                  <activity.icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Streak Calendar (GitHub-style) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" /> Learning Streak
            </CardTitle>
            <span className="text-xs text-muted-foreground">Last 12 weeks</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-[3px]">
            {Array.from({ length: 84 }, (_, i) => {
              const week = Math.floor(i / 7);
              const day = i % 7;
              // Generate pseudo-random activity based on position
              const hash = ((week * 13 + day * 7 + i * 3) % 11);
              const level = hash < 2 ? 0 : hash < 5 ? 1 : hash < 8 ? 2 : hash < 10 ? 3 : 4;
              const isToday = i === 83;
              const colors = [
                'bg-muted/30',
                'bg-emerald-500/20',
                'bg-emerald-500/40',
                'bg-emerald-500/60',
                'bg-emerald-500',
              ];
              return (
                <motion.div
                  key={i}
                  className={cn(
                    'streak-cell h-[11px] w-[11px] rounded-[2px] cursor-default',
                    colors[level],
                    isToday && 'streak-cell-active ring-1 ring-emerald-400/50'
                  )}
                  initial={level > 0 ? { scale: 0 } : undefined}
                  animate={level > 0 ? { scale: 1 } : undefined}
                  transition={{ duration: 0.2, delay: i * 0.005 }}
                  title={`${level} contributions`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">Less</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-[11px] w-[11px] rounded-[2px]',
                    ['bg-muted/30', 'bg-emerald-500/20', 'bg-emerald-500/40', 'bg-emerald-500/60', 'bg-emerald-500'][level]
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500 streak-fire-glow" /> {currentStreak} day streak</span>
            <span className="flex items-center gap-1"><Target className="h-3 w-3 text-amber-500" /> Best: 12 days</span>
          </div>
        </CardContent>
      </Card>

      {/* Social Proof / Testimonials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Quote className="h-4 w-4 text-primary" /> What Graduates Say
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Sarah K.', role: 'Fleet Dispatcher', text: 'The broker email training was incredibly realistic. I felt prepared on day one of my job.', initials: 'SK', color: 'bg-emerald-500/10 text-emerald-500' },
              { name: 'Marcus D.', role: 'Load Planner', text: 'The load board exercises helped me understand rate negotiations better than any textbook.', initials: 'MD', color: 'bg-primary/10 text-primary' },
              { name: 'Elena R.', role: 'Operations Manager', text: 'I promoted from dispatcher to manager within 6 months. This academy gave me the foundation.', initials: 'ER', color: 'bg-amber-500/10 text-amber-500' },
              { name: 'James T.', role: 'Owner-Operator', text: 'The fleet management module showed me how to track my own trucks efficiently. Game changer.', initials: 'JT', color: 'bg-purple-500/10 text-purple-500' },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold', testimonial.color)}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-[10px] text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resume Builder */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Resume Builder
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadResume}>
              <Download className="h-3.5 w-3.5" /> Download Resume
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={resumeTab} onValueChange={setResumeTab}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="preview" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Preview
              </TabsTrigger>
              <TabsTrigger value="experience" className="gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Experience
              </TabsTrigger>
              <TabsTrigger value="education" className="gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Education
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              {/* Resume Preview Card */}
              <div className="space-y-4 p-5 bg-muted/20 rounded-lg border">
                <div>
                  <h3 className="text-xl font-bold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                    {user.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {user.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {user.email}
                    </span>
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Professional Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.bio || 'Freight dispatcher trained in load booking, broker communication, and DOT compliance through Marokand Humo Academy.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeSkills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {workExperiences.length > 0 && workExperiences.some((we) => we.company) && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Work Experience</h4>
                    <div className="space-y-3">
                      {workExperiences.filter((we) => we.company).map((we) => (
                        <div key={we.id} className="border-l-2 border-primary/30 pl-3">
                          <p className="text-sm font-medium">{we.role}{we.role && we.company ? ' — ' : ''}{we.company}</p>
                          <p className="text-xs text-muted-foreground">
                            {we.startDate && `${we.startDate} — ${we.endDate || 'Present'}`}
                          </p>
                          {we.description && (
                            <p className="text-sm text-muted-foreground mt-1">{we.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Education</h4>
                  <div className="space-y-2">
                    {educationEntries.filter((ed) => ed.institution).map((ed) => (
                      <div key={ed.id} className="flex items-start gap-2">
                        <GraduationCap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">
                            {ed.degree}{ed.degree && ed.field ? ' in ' : ''}{ed.field} — {ed.institution}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ed.startDate && `${ed.startDate} — ${ed.endDate}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Certifications</h4>
                  <div className="space-y-1">
                    {userCertificates.length > 0 ? (
                      userCertificates.map((c) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="text-sm">{c.courseName}</span>
                          <Badge variant="secondary" className="text-[9px] bg-purple-500/10 text-purple-500 border-purple-500/20">
                            {c.credentialId}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Marokand Humo Academy — Freight Dispatch Program (In Progress)</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {completedCourses} courses completed
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" /> {userCertificates.length} certificates
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" /> {avgQuizScore}% avg score
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Work Experience</h4>
                <Button variant="outline" size="sm" onClick={addWorkExperience} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </Button>
              </div>
              {workExperiences.map((we) => (
                <Card key={we.id} className="bg-muted/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {we.role || 'New Entry'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeWorkExperience(we.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Company</label>
                        <Input
                          value={we.company}
                          onChange={(e) => updateWorkExperience(we.id, 'company', e.target.value)}
                          placeholder="e.g., US Logistics Company"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Role</label>
                        <Input
                          value={we.role}
                          onChange={(e) => updateWorkExperience(we.id, 'role', e.target.value)}
                          placeholder="e.g., Freight Dispatcher"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                        <Input
                          value={we.startDate}
                          onChange={(e) => updateWorkExperience(we.id, 'startDate', e.target.value)}
                          placeholder="e.g., 2024-01"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">End Date</label>
                        <Input
                          value={we.endDate}
                          onChange={(e) => updateWorkExperience(we.id, 'endDate', e.target.value)}
                          placeholder="e.g., Present"
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Description</label>
                      <Textarea
                        value={we.description}
                        onChange={(e) => updateWorkExperience(we.id, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        rows={3}
                        className="mt-1 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {workExperiences.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No work experience added yet. Click &quot;Add Experience&quot; to get started.
                </p>
              )}
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Education</h4>
                <Button variant="outline" size="sm" onClick={addEducation} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Education
                </Button>
              </div>
              {educationEntries.map((ed) => (
                <Card key={ed.id} className="bg-muted/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {ed.institution || 'New Entry'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEducation(ed.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Institution</label>
                        <Input
                          value={ed.institution}
                          onChange={(e) => updateEducation(ed.id, 'institution', e.target.value)}
                          placeholder="e.g., Marokand Humo Academy"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Degree</label>
                        <Input
                          value={ed.degree}
                          onChange={(e) => updateEducation(ed.id, 'degree', e.target.value)}
                          placeholder="e.g., Certificate"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Field of Study</label>
                        <Input
                          value={ed.field}
                          onChange={(e) => updateEducation(ed.id, 'field', e.target.value)}
                          placeholder="e.g., Freight Dispatch"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Start</label>
                          <Input
                            value={ed.startDate}
                            onChange={(e) => updateEducation(ed.id, 'startDate', e.target.value)}
                            placeholder="2024-01"
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">End</label>
                          <Input
                            value={ed.endDate}
                            onChange={(e) => updateEducation(ed.id, 'endDate', e.target.value)}
                            placeholder="2024-06"
                            className="mt-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Separator />

              {/* Skills Tag Input */}
              <div>
                <h4 className="text-sm font-medium mb-2">Resume Skills</h4>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {resumeSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs gap-1 pr-1 bg-primary/10 text-primary border-primary/20"
                    >
                      {skill}
                      <button
                        onClick={() => removeResumeSkill(skill)}
                        className="h-4 w-4 rounded-full hover:bg-primary/20 flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addResumeSkill();
                      }
                    }}
                    placeholder="Add a skill..."
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={addResumeSkill} className="gap-1.5 flex-shrink-0">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SKILLS_OPTIONS.filter((s) => !resumeSkills.includes(s)).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => setResumeSkills((prev) => [...prev, skill])}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="e.g., Tashkent, Uzbekistan" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Learning Track</label>
              <Select value={editTrack} onValueChange={setEditTrack}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEARNING_TRACKS.map((track) => (
                    <SelectItem key={track} value={track}>
                      {track}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Skills</label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SKILLS_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      editSkills.includes(skill)
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-muted/30 text-muted-foreground border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} className="gap-1.5">
              <Star className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
