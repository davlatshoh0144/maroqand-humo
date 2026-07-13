'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store/app-store';
import { CheckCircle2, ClipboardList, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export function StudentApplicationPage() {
  const { cohorts, courses, submitApplication } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<'applied' | null>(null);
  const [form, setForm] = useState({
    applicantName: '',
    email: '',
    phone: '',
    city: '',
    experienceLevel: 'new' as const,
    preferredCohortId: '',
    courseInterest: '',
    motivation: '',
  });

  const cohortOptions = useMemo(
    () => cohorts.filter((cohort) => cohort.status === 'planned' || cohort.status === 'active'),
    [cohorts]
  );

  const selectedCohort = cohortOptions.find((cohort) => cohort.id === form.preferredCohortId);
  const selectedCourse = selectedCohort?.courseId
    ? courses.find((course) => course.id === selectedCohort.courseId)
    : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.applicantName.trim() || !form.email.trim() || !form.motivation.trim()) {
      toast.error('Name, email, and motivation are required.');
      return;
    }

    setIsSubmitting(true);
    const created = await submitApplication({
      applicantName: form.applicantName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
      city: form.city.trim() || undefined,
      experienceLevel: form.experienceLevel,
      preferredCohortId: form.preferredCohortId || undefined,
      courseInterest: form.courseInterest.trim() || selectedCourse?.title,
      motivation: form.motivation.trim(),
    });
    setIsSubmitting(false);

    if (!created) {
      toast.error('Application could not be submitted.');
      return;
    }

    setSubmittedStatus('applied');
    toast.success('Application submitted', {
      description: 'Admissions will review your application and update your status.',
    });
    setForm({
      applicantName: '',
      email: '',
      phone: '',
      city: '',
      experienceLevel: 'new',
      preferredCohortId: '',
      courseInterest: '',
      motivation: '',
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="space-y-3">
            <Badge variant="secondary" className="gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              Student Application
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Apply to Marokand Humo Academy</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Submit your training application for review. Accepted applicants are enrolled by the academy team into the right cohort and course track.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="application-name">Full name</Label>
                    <Input
                      id="application-name"
                      value={form.applicantName}
                      onChange={(event) => setForm((prev) => ({ ...prev, applicantName: event.target.value }))}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="application-email">Email</Label>
                    <Input
                      id="application-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="application-phone">Phone</Label>
                    <Input
                      id="application-phone"
                      value={form.phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="application-city">City</Label>
                    <Input
                      id="application-city"
                      value={form.city}
                      onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                      autoComplete="address-level2"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Dispatch experience</Label>
                    <Select
                      value={form.experienceLevel}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          experienceLevel: value as typeof form.experienceLevel,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New to dispatch</SelectItem>
                        <SelectItem value="some_experience">Some logistics experience</SelectItem>
                        <SelectItem value="working_dispatcher">Working dispatcher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred cohort</Label>
                    <Select
                      value={form.preferredCohortId}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, preferredCohortId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cohort" />
                      </SelectTrigger>
                      <SelectContent>
                        {cohortOptions.map((cohort) => (
                          <SelectItem key={cohort.id} value={cohort.id}>
                            {cohort.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application-interest">Course interest</Label>
                  <Input
                    id="application-interest"
                    value={form.courseInterest}
                    onChange={(event) => setForm((prev) => ({ ...prev, courseInterest: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application-motivation">Why do you want to join?</Label>
                  <Textarea
                    id="application-motivation"
                    value={form.motivation}
                    onChange={(event) => setForm((prev) => ({ ...prev, motivation: event.target.value }))}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['Applied', 'Reviewing', 'Accepted', 'Rejected', 'Enrolled'] as const).map((status, index) => (
                <div key={status} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">{status}</span>
                </div>
              ))}
              {submittedStatus && (
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  Current status: Applied
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Active Cohorts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cohortOptions.map((cohort) => (
                <div key={cohort.id} className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{cohort.name}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {cohort.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Starts {new Date(cohort.startsAt).toLocaleDateString()} · Capacity {cohort.capacity}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
