'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Heart,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  GraduationCap,
  FileText,
  Lightbulb,
  X,
  Wifi,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
type LocationType = 'Remote' | 'Hybrid' | 'On-site';
type ExperienceLevel = 'Entry' | 'Mid' | 'Senior';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: LocationType;
  jobType: JobType;
  salaryMin: number;
  salaryMax: number;
  experienceLevel: ExperienceLevel;
  postedDaysAgo: number;
  requirements: string[];
  benefits: string[];
  description: string;
  featured?: boolean;
}

// ─── Job Listing Data ────────────────────────────────────────────────────────

const jobListings: JobListing[] = [
  {
    id: 'job-1',
    title: 'Senior Dispatch Coordinator',
    company: 'Marokand Logistics',
    location: 'Chicago, IL',
    locationType: 'Hybrid',
    jobType: 'Full-time',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'Senior',
    postedDaysAgo: 1,
    featured: true,
    requirements: ['3+ years dispatch experience', 'Proficiency in TMS systems (McLeod, TMW)', 'Strong broker negotiation skills', 'CDL knowledge preferred'],
    benefits: ['Health, dental, vision insurance', '401(k) with company match', 'Flexible remote days', 'Annual performance bonus'],
    description: 'Lead a team of 4 dispatchers managing 80+ trucks across the Midwest. Coordinate with brokers, plan routes, and ensure on-time delivery. You will be the go-to person for resolving operational issues and optimizing load assignments.',
  },
  {
    id: 'job-2',
    title: 'Dispatcher / Load Planner',
    company: 'Swift Freight Solutions',
    location: 'Dallas, TX',
    locationType: 'On-site',
    jobType: 'Full-time',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'Mid',
    postedDaysAgo: 3,
    requirements: ['1+ year dispatch or logistics experience', 'Load board proficiency', 'Excellent phone/email communication', 'Knowledge of HOS regulations'],
    benefits: ['Medical and dental insurance', 'Paid training and certifications', 'Overtime compensation', 'Relocation assistance'],
    description: 'Manage daily dispatch operations for a fleet of 25 dry van trucks. Book loads from load boards and direct shippers, negotiate rates, and plan efficient routes. Ideal for someone who thrives in a fast-paced environment.',
  },
  {
    id: 'job-3',
    title: 'Remote Freight Dispatcher',
    company: 'National Carrier Network',
    location: 'Remote (US)',
    locationType: 'Remote',
    jobType: 'Full-time',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'Mid',
    postedDaysAgo: 5,
    requirements: ['2+ years remote dispatch experience', 'Reliable home internet (50+ Mbps)', 'Experience with multi-carrier dispatch', 'Strong organizational skills'],
    benefits: ['Fully remote position', 'Home office stipend', 'Flexible hours (core 10am-3pm CT)', 'Unlimited PTO'],
    description: 'Work from home dispatching for 3 small carriers. Handle load booking, driver check-ins, and broker communications. Must be self-motivated and able to manage multiple accounts simultaneously.',
  },
  {
    id: 'job-4',
    title: 'Junior Dispatcher Trainee',
    company: 'Humo Express',
    location: 'Tashkent, UZ / Remote',
    locationType: 'Hybrid',
    jobType: 'Full-time',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'Entry',
    postedDaysAgo: 2,
    featured: true,
    requirements: ['Marokand Humo Academy certification', 'Basic knowledge of trucking operations', 'Strong English communication', 'Willingness to learn TMS systems'],
    benefits: ['Paid 8-week training program', 'Mentorship from senior dispatchers', 'Career advancement path', 'Health insurance from day 1'],
    description: 'Start your dispatch career with our structured training program. You will shadow senior dispatchers, learn load booking on live boards, and gradually take on your own accounts. Academy graduates preferred.',
  },
  {
    id: 'job-5',
    title: 'Brokerage Operations Specialist',
    company: 'Atlas Freight Brokerage',
    location: 'Atlanta, GA',
    locationType: 'On-site',
    jobType: 'Full-time',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'Mid',
    postedDaysAgo: 7,
    requirements: ['2+ years freight brokerage experience', 'Active broker authority or willing to obtain', 'Strong carrier relationship network', 'Load board premium access'],
    benefits: ['Competitive commission structure', 'Health and wellness benefits', 'Annual conference attendance', 'Performance-based profit sharing'],
    description: 'Manage carrier relationships and book freight for our growing brokerage. Source carriers, negotiate rates, and ensure coverage on 50+ loads per week. You will also help onboard new carriers and maintain compliance documentation.',
  },
  {
    id: 'job-6',
    title: 'Fleet Dispatcher - Reefer Division',
    company: 'Cold Chain Carriers',
    location: 'Fresno, CA',
    locationType: 'On-site',
    jobType: 'Full-time',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'Mid',
    postedDaysAgo: 4,
    requirements: ['1+ year reefer dispatch experience', 'Knowledge of temperature-sensitive freight', 'Familiarity with produce shipping seasons', 'Bilingual English/Spanish preferred'],
    benefits: ['Sector-specific bonuses', 'Health insurance', 'Paid time off', 'Seasonal profit sharing'],
    description: 'Dispatch 15 reefer units handling temperature-controlled freight across California and the Pacific Northwest. Coordinate pickup/delivery appointments, monitor reefer unit settings, and manage produce season surges.',
  },
  {
    id: 'job-7',
    title: 'Night Shift Dispatcher',
    company: 'Midnight Express Logistics',
    location: 'Memphis, TN',
    locationType: 'On-site',
    jobType: 'Full-time',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'Entry',
    postedDaysAgo: 6,
    requirements: ['Available 10 PM - 6 AM shift', 'Basic dispatch knowledge', 'Ability to work independently', 'Problem-solving under pressure'],
    benefits: ['Night shift differential (+15%)', 'Health benefits', '4-day work week option', 'Free meals during shift'],
    description: 'Handle overnight dispatch operations including driver check-ins, load tracking, and issue resolution. Perfect for entry-level dispatchers looking to gain experience. Training provided for the first 2 weeks on day shift.',
  },
  {
    id: 'job-8',
    title: 'Part-Time Dispatch Assistant',
    company: 'Local Haul Co.',
    location: 'Portland, OR',
    locationType: 'Hybrid',
    jobType: 'Part-time',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: 'Entry',
    postedDaysAgo: 2,
    requirements: ['Enrolled in or completed dispatch training', 'Familiarity with load boards', 'Good phone etiquette', 'Available 20 hrs/week'],
    benefits: ['Flexible scheduling', 'Remote work options', 'Professional development support', 'Path to full-time role'],
    description: 'Assist the dispatch team with load posting, carrier calls, and data entry. Great opportunity for students currently enrolled in dispatch training programs. Hours are flexible around your class schedule.',
  },
];

// Resume tips data
const resumeTips = [
  { id: 'rt-1', icon: FileText, title: 'Highlight TMS Proficiency', description: 'List specific TMS platforms you know (McLeod, TMW, Ascend) — recruiters search for these keywords.', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'rt-2', icon: DollarSign, title: 'Quantify Your Results', description: 'Include metrics like volume of freight managed and on-time delivery performance', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'rt-3', icon: GraduationCap, title: 'Lead with Certifications', description: 'Place your Marokand Humo Academy certification prominently. It proves you have formal dispatch training.', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'rt-4', icon: Lightbulb, title: 'Show Regulatory Knowledge', description: 'Mention DOT/FMCSA compliance experience, HOS management, and safety record — these are non-negotiable skills.', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
];

const locationTypeConfig: Record<LocationType, { icon: React.ElementType; color: string; bg: string }> = {
  Remote: { icon: Wifi, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  Hybrid: { icon: Users, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  'On-site': { icon: Building2, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
};

const experienceConfig: Record<ExperienceLevel, { color: string; bg: string }> = {
  Entry: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  Mid: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  Senior: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
};

// ─── Job Detail View ─────────────────────────────────────────────────────────

function JobDetailView({ job, onBack }: { job: JobListing; onBack: () => void }) {
  const { savedJobIds, toggleSavedJob } = useAppStore();
  const isSaved = savedJobIds.includes(job.id);
  const locConfig = locationTypeConfig[job.locationType];
  const expConfig = experienceConfig[job.experienceLevel];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {job.featured && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                <Star className="h-3 w-3 fill-amber-500" /> Featured
              </Badge>
            )}
            <Badge variant="outline" className={cn('gap-1', locConfig.bg, locConfig.color)}>
              <locConfig.icon className="h-3 w-3" /> {job.locationType}
            </Badge>
            <Badge variant="outline" className={cn(expConfig.bg, expConfig.color)}>
              {job.experienceLevel} Level
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Building2 className="h-4 w-4" /> {job.company}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant={isSaved ? 'default' : 'outline'}
            size="sm"
            className="gap-1"
            onClick={() => {
              toggleSavedJob(job.id);
              toast.success(isSaved ? 'Job removed from saved' : 'Job saved!', { description: job.title });
            }}
          >
            <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
            {isSaved ? 'Saved' : 'Save Job'}
          </Button>
          <Button size="sm" className="gap-1" onClick={() => toast.info('Use the student application form to apply for academy-supported opportunities.')}>
            <ExternalLink className="h-4 w-4" /> Apply Now
          </Button>
        </div>
      </div>

      <Separator />

      {/* Key Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <DollarSign className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">
              {job.salaryMin === 0 ? 'Competitive' : `${job.salaryMin >= 1000 ? `$${(job.salaryMin / 1000).toFixed(0)}K` : `$${job.salaryMin}`} – ${job.salaryMax >= 1000 ? `$${(job.salaryMax / 1000).toFixed(0)}K` : `$${job.salaryMax}`}`}
            </p>
            <p className="text-[10px] text-muted-foreground">{job.salaryMin === 0 ? 'compensation' : job.jobType === 'Part-time' ? '/hour' : '/year'}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <MapPin className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{job.location}</p>
            <p className="text-[10px] text-muted-foreground">{job.locationType}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <Briefcase className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{job.jobType}</p>
            <p className="text-[10px] text-muted-foreground">Employment type</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 text-sky-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{job.postedDaysAgo === 1 ? 'Yesterday' : `${job.postedDaysAgo} days ago`}</p>
            <p className="text-[10px] text-muted-foreground">Posted</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Job Description</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">{job.description}</p>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Requirements</h3>
        <ul className="space-y-2">
          {job.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                {i + 1}
              </span>
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Benefits */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <div className="flex flex-wrap gap-2">
          {job.benefits.map((benefit, i) => (
            <Badge key={i} variant="outline" className="bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
              {benefit}
            </Badge>
          ))}
        </div>
      </div>

      {/* Apply CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Interested in this position?</p>
            <p className="text-sm text-muted-foreground">Apply now and get your application reviewed within 48 hours.</p>
          </div>
          <Button className="gap-1 shrink-0" onClick={() => toast.info('Use the student application form to apply for academy-supported opportunities.')}>
            <ExternalLink className="h-4 w-4" /> Apply Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CareerCenter() {
  const { savedJobIds, toggleSavedJob } = useAppStore();
  const [filterJobType, setFilterJobType] = useState<JobType | 'All'>('All');
  const [filterLocation, setFilterLocation] = useState<LocationType | 'All'>('All');
  const [filterExperience, setFilterExperience] = useState<ExperienceLevel | 'All'>('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let jobs = jobListings;
    if (filterJobType !== 'All') jobs = jobs.filter((j) => j.jobType === filterJobType);
    if (filterLocation !== 'All') jobs = jobs.filter((j) => j.locationType === filterLocation);
    if (filterExperience !== 'All') jobs = jobs.filter((j) => j.experienceLevel === filterExperience);
    if (showSavedOnly) jobs = jobs.filter((j) => savedJobIds.includes(j.id));
    return jobs;
  }, [filterJobType, filterLocation, filterExperience, showSavedOnly, savedJobIds]);

  const savedCount = savedJobIds.length;

  // If a job is selected, show detail view
  if (selectedJob) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <JobDetailView job={selectedJob} onBack={() => setSelectedJob(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-primary/5 border border-amber-500/10 p-6 md:p-8"
      >
        <div className="absolute top-4 right-4 opacity-10">
          <Briefcase className="h-24 w-24 text-amber-500" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Career Center</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            Explore trucking dispatch positions from top companies. Find your next role in logistics and freight management.
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Briefcase className="h-4 w-4 text-amber-500" /> {jobListings.length} positions
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500" /> {savedCount} saved
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <Button
          variant={showSavedOnly ? 'default' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={() => setShowSavedOnly(!showSavedOnly)}
        >
          <Heart className={cn('h-3.5 w-3.5', showSavedOnly && 'fill-current')} />
          Saved ({savedCount})
        </Button>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Job Type Filter */}
        {(['All', 'Full-time', 'Part-time', 'Contract', 'Remote'] as const).map((type) => (
          <Button
            key={type}
            variant={filterJobType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterJobType(type)}
          >
            {type}
          </Button>
        ))}

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Location Filter */}
        {(['All', 'Remote', 'Hybrid', 'On-site'] as const).map((type) => (
          <Button
            key={type}
            variant={filterLocation === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterLocation(type)}
          >
            {type}
          </Button>
        ))}

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Experience Filter */}
        {(['All', 'Entry', 'Mid', 'Senior'] as const).map((level) => (
          <Button
            key={level}
            variant={filterExperience === level ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterExperience(level)}
          >
            {level}
          </Button>
        ))}
      </motion.div>

      {/* Results */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredJobs.length} of {jobListings.length} positions
      </p>

      {/* Job Listings */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredJobs.map((job, i) => {
            const locConfig = locationTypeConfig[job.locationType];
            const expConfig = experienceConfig[job.experienceLevel];
            const isSaved = savedJobIds.includes(job.id);
            const isExpanded = expandedJob === job.id;

            return (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={cn(
                  'group hover:shadow-md transition-all duration-200 border-border/50',
                  job.featured && 'border-amber-500/30 bg-amber-500/[0.02]'
                )}>
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-base font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
                              onClick={() => setSelectedJob(job)}
                            >
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3.5 w-3.5" /> {job.company}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => {
                              toggleSavedJob(job.id);
                              toast.success(isSaved ? 'Job removed from saved' : 'Job saved!', { description: job.title });
                            }}
                          >
                            <Heart className={cn('h-4 w-4', isSaved ? 'text-red-500 fill-red-500' : 'text-muted-foreground/40 group-hover:text-muted-foreground')} />
                          </Button>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {job.featured && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-[10px]">
                              <Star className="h-2.5 w-2.5 fill-amber-500" /> Featured
                            </Badge>
                          )}
                          <Badge variant="outline" className={cn('gap-1 text-[10px]', locConfig.bg, locConfig.color)}>
                            <locConfig.icon className="h-2.5 w-2.5" /> {job.locationType}
                          </Badge>
                          <Badge variant="outline" className={cn('text-[10px]', expConfig.bg, expConfig.color)}>
                            {job.experienceLevel}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {job.jobType}
                          </Badge>
                        </div>

                        {/* Salary + Location */}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-foreground font-semibold">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                            {job.salaryMin === 0 ? 'Competitive' : `${job.salaryMin >= 1000 ? `$${(job.salaryMin / 1000).toFixed(0)}K` : `$${job.salaryMin}`} – ${job.salaryMax >= 1000 ? `$${(job.salaryMax / 1000).toFixed(0)}K` : `$${job.salaryMax}`}${job.jobType === 'Part-time' ? '/hr' : '/yr'}`}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" /> {job.postedDaysAgo}d ago
                          </span>
                        </div>

                        {/* Expandable description preview */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{job.description}</p>
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Requirements:</p>
                                <ul className="space-y-0.5">
                                  {job.requirements.slice(0, 3).map((req, idx) => (
                                    <li key={idx} className="text-xs text-foreground/60 flex items-start gap-1">
                                      <span className="text-primary mt-0.5">•</span> {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <Button size="sm" className="gap-1" onClick={() => setSelectedJob(job)}>
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          {isExpanded ? 'Less' : 'More'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/30 mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No jobs match your filters</h3>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or clearing saved-only view</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterJobType('All');
              setFilterLocation('All');
              setFilterExperience('All');
              setShowSavedOnly(false);
            }}
          >
            <X className="h-3.5 w-3.5 mr-1" /> Clear all filters
          </Button>
        </motion.div>
      )}

      {/* Resume Tips Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Resume Tips for Dispatchers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resumeTips.map((tip, i) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Card className="h-full border-border/50 hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg mb-3', tip.bg)}>
                    <tip.icon className={cn('h-4 w-4', tip.color)} />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
