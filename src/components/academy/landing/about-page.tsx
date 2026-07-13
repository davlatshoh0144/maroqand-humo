'use client';

import Image from 'next/image';
import {
  Target,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Users,
  Award,
  Globe,
  CheckCircle,
  Shield,
  Heart,
  Lightbulb,
  Truck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { instructors } from '@/lib/data/instructors';
import { useAppStore } from '@/lib/store/app-store';
import { motion } from 'framer-motion';

const values = [
  {
    icon: BookOpen,
    title: 'Practical Skills',
    description:
      'Every lesson is built around real dispatch scenarios, not theory. Students practice with simulated load boards, broker emails, and fleet management tools.',
  },
  {
    icon: Target,
    title: 'Industry Knowledge',
    description:
      'Our curriculum covers USA trucking regulations, DOT compliance, HOS rules, and freight accounting — taught by professionals who live it every day.',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description:
      'From resume practice to interview preparation, we help learners prepare clear career materials and talk through dispatch workflows.',
  },
  {
    icon: GraduationCap,
    title: 'Student Success',
    description:
      'We focus on practical exercises, feedback points, and portfolio artifacts learners can use to explain what they practiced.',
  },
];

const stats = [
  { label: 'Scenario-Based Learning', value: 'Practice', icon: Users },
  { label: 'Course Library', value: 'Structured', icon: BookOpen },
  { label: 'Completion Evidence', value: 'Portfolio', icon: Award },
  { label: 'Online Access', value: 'Remote', icon: Globe },
];

const milestones = [
  { year: '2021', title: 'Academy Founded', description: 'Started with a vision to train dispatchers worldwide' },
  { year: '2022', title: 'Expanded Curriculum', description: 'Added broker communication and load-board practice lessons' },
  { year: '2023', title: 'Career Readiness Tools', description: 'Introduced resume practice, portfolio review, and interview preparation resources' },
  { year: '2024', title: 'Remote Learning Focus', description: 'Improved training for learners practicing from different regions' },
  { year: '2025', title: 'AI-Powered Learning', description: 'Launched AI chatbot and adaptive learning tools' },
];

export function AboutPage() {
  const { navigate, user } = useAppStore();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute inset-0 logistics-blueprint-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              About Us
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              About Marokand{' '}
              <span className="text-gradient">Humo Academy</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              We train the next generation of USA truck dispatch professionals
              with practical, real-world education.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Marokand Humo Academy was founded with a single goal: to bridge the
              gap between aspiring logistics professionals and the USA trucking
              industry. We believe that great dispatchers are made, not born —
              and that practical training can help learners understand freight
              dispatch work before they pursue opportunities.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Our mission is to provide accessible, high-quality, practical
              education that helps students practice dispatch workflows in a safer learning environment. We do not just teach theory; we simulate the tools,
              scenarios, and challenges that dispatchers face every day.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                Our Story
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                From a Single Idea to a Global Academy
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Marokand Humo Academy started in 2021 when a group of
                  experienced dispatch professionals noticed a critical gap in the
                  market: there was no structured, practical training program for
                  people who wanted to become USA truck dispatchers — especially
                  those based outside the United States.
                </p>
                <p>
                  Our founders, each with over a decade of experience in freight
                  operations, compliance, and fleet management, combined their
                  expertise to create a curriculum that mirrors the real work of a
                  dispatcher. What began as a small online course has grown into a
                  broader online academy for learners in different regions.
                </p>
                <p>
                  Today, we continue to evolve our programs based on industry
                  changes, student feedback, and the latest regulations to ensure
                  the material stays practical, current, and clear.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50">
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center">
                    <Image
                      src="/logo-simple.png"
                      alt="Marokand Humo Academy"
                      width={120}
                      height={120}
                      className="mx-auto mb-4 opacity-80"
                    />
                    <p className="text-2xl font-bold">Est. 2021</p>
                    <p className="text-muted-foreground mt-1">
                      Tashkent, Uzbekistan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values - with icon animations */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What We Stand For
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our core values guide everything we do — from course design to
              student support
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="group border-border/50 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                      <value.icon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="border-border/50 bg-card/50 text-center hover-lift card-shine">
                  <CardContent className="flex flex-col items-center p-6">
                    <stat.icon className="mb-3 h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold sm:text-4xl">
                      {stat.value}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <TrendingUp className="mr-1 h-3 w-3" />
              Our Journey
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Company Milestones
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Key moments in our growth from startup to global academy
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent sm:-translate-x-px" />
            {milestones.map((milestone, i) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`relative flex items-start gap-6 mb-8 last:mb-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 sm:left-1/2 w-4 h-4 -translate-x-2 sm:-translate-x-2 mt-1.5 z-10">
                  <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-background shadow-md shadow-primary/20" />
                </div>
                {/* Content */}
                <div className={`ml-16 sm:ml-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'sm:pr-8 sm:text-right' : 'sm:pl-8 sm:text-left'}`}>
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">{milestone.year}</Badge>
                  <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                </div>
                {/* Spacer for the other side */}
                <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team - with flip cards */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Industry professionals with real dispatch and compliance experience
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="flip-card h-72">
                <div className="flip-card-inner w-full h-full">
                  {/* Front of card */}
                  <div className="flip-card-front w-full h-full">
                    <Card className="w-full h-full border-border/50 bg-card/50">
                      <CardContent className="flex flex-col items-center p-6 text-center h-full justify-center">
                        <div className="mb-4 h-20 w-20 overflow-hidden rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                          <Image
                            src={instructor.avatar}
                            alt={instructor.name}
                            width={80}
                            height={80}
                            className="h-auto w-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold">{instructor.name}</h3>
                        <p className="mt-1 text-sm text-primary">
                          {instructor.specialization}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {instructor.experience} experience
                          </Badge>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Hover to learn more →
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Back of card */}
                  <div className="flip-card-back w-full h-full">
                    <Card className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                      <CardContent className="flex flex-col items-center p-6 text-center h-full justify-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <Award className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-foreground">{instructor.name}</h3>
                        <p className="text-xs text-primary font-medium mt-1">{instructor.specialization}</p>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-5">
                          {instructor.bio}
                        </p>
                        <Badge variant="secondary" className="mt-3 text-xs">
                          {instructor.experience}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-primary/5 relative overflow-hidden">
        {/* Parallax background */}
        <div className="absolute inset-0 logistics-blueprint-grid opacity-30" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Build Dispatch Skills?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join learners building practical logistics knowledge with
              Marokand Humo Academy.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? 'courses' : 'signup')}
                className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Start Learning Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('courses')}
                className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Browse Courses
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Free to start
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
