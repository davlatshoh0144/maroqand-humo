'use client';

import { motion, type Variants } from 'framer-motion';
import { Briefcase, Truck, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store/app-store';

const careerPaths = [
  {
    icon: Briefcase,
    title: 'Freight Dispatcher',
    salary: 'Skill Area',
    salaryNote: '',
    description:
      'Practice load assignments, broker communication, and driver coordination workflows used in trucking operations.',
    skills: ['Load Booking', 'Rate Negotiation', 'Carrier Relations'],
    color: 'primary' as const,
  },
  {
    icon: Truck,
    title: 'Fleet Manager',
    salary: 'Operations Path',
    salaryNote: '',
    description:
      'Learn how fleet teams think about operations, maintenance scheduling, compliance habits, and team coordination.',
    skills: ['Fleet Operations', 'Compliance', 'Team Leadership'],
    color: 'emerald' as const,
  },
  {
    icon: DollarSign,
    title: 'Independent Dispatcher',
    salary: 'Independent Path',
    salaryNote: '',
    description:
      'Practice the business, communication, and workflow skills used by independent dispatch services.',
    skills: ['Business Ownership', 'Remote Work', 'Client Management'],
    color: 'amber' as const,
  },
];

const colorStyles = {
  primary: {
    iconBg: 'bg-primary/15',
    iconText: 'text-primary',
    salaryText: 'text-primary',
    borderHover: 'hover:border-primary/30',
    skillBg: 'bg-primary/10 text-primary',
    buttonVariant: 'default' as const,
    gradient: 'from-primary/8 via-transparent to-primary/5',
  },
  emerald: {
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-500',
    salaryText: 'text-emerald-600 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-500/30',
    skillBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    buttonVariant: 'outline' as const,
    gradient: 'from-emerald-500/8 via-transparent to-emerald-500/5',
  },
  amber: {
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-500',
    salaryText: 'text-amber-600 dark:text-amber-400',
    borderHover: 'hover:border-amber-500/30',
    skillBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    buttonVariant: 'outline' as const,
    gradient: 'from-amber-500/8 via-transparent to-amber-500/5',
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export function CareerOutcomes() {
  const { navigate } = useAppStore();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 text-sm font-medium">
            <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
            Career Paths
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Skills That Support Dispatch Career Paths
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore the types of roles learners often prepare for. Training does not guarantee employment.
          </p>
        </div>

        {/* Career Path Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {careerPaths.map((path, i) => {
            const styles = colorStyles[path.color];
            return (
              <motion.div
                key={path.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
              >
                <Card
                  className={`group h-full border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${styles.borderHover} overflow-hidden`}
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${styles.gradient}`} />
                  <CardContent className="flex h-full flex-col p-6">
                    {/* Icon */}
                    <div
                      className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconText} transition-transform group-hover:scale-110`}
                    >
                      <path.icon className="h-7 w-7" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground">{path.title}</h3>

                    {/* Salary */}
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-2xl font-extrabold ${styles.salaryText}`}>
                        {path.salary}
                      </span>
                      <span className="text-sm text-muted-foreground">{path.salaryNote}</span>
                    </div>

                    {/* Description */}
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {path.description}
                    </p>

                    {/* Skills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {path.skills.map((skill) => (
                        <span
                          key={skill}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.skillBg}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-6">
                      <Button
                        variant={styles.buttonVariant}
                        className="w-full group/btn"
                        onClick={() => navigate('courses')}
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-emerald-500/10 border border-primary/20 p-8 text-center">
            {/* Decorative elements */}
            <div className="absolute inset-0 -z-0">
              <div className="absolute inset-0 logistics-blueprint-grid opacity-30" />
            </div>

            <div className="relative z-10">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                Build practical skills for dispatch interviews, portfolio work, and on-the-job conversations
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Course materials are designed for practice and career readiness, not guaranteed placement.
              </p>
              <Button
                size="lg"
                className="mt-5 shadow-lg shadow-primary/25"
                onClick={() => navigate('signup')}
              >
                Explore Training Paths
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
