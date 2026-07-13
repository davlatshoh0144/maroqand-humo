'use client';

import { motion, type Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    name: 'New Dispatcher',
    role: 'Aspiring Dispatcher',
    initials: 'ND',
    quote:
      'The simulated load board practice helped me understand how dispatchers compare lanes, organize details, and prepare broker questions before reaching out.',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'Career Student',
    role: 'Dispatch Student',
    initials: 'CS',
    quote:
      'Broker Mail practice made the communication side feel less abstract. I could practice professional replies, rate questions, and follow-up messages in a safe environment.',
    color: 'bg-primary/15 text-primary',
  },
  {
    name: 'Operations Learner',
    role: 'Operations Learner',
    initials: 'OL',
    quote:
      'The fleet lessons helped me connect dispatch decisions with driver schedules, maintenance notes, and customer expectations.',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    name: 'Compliance Student',
    role: 'Compliance Student',
    initials: 'CP',
    quote:
      'The compliance course gave me a clearer way to think about HOS, documentation, and when a dispatcher should slow down and verify details.',
    color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    name: 'Owner-Operator',
    role: 'Owner-Operator Learner',
    initials: 'OO',
    quote:
      'The training helped me practice dispatch decisions from a business point of view, including lanes, costs, communication, and record keeping.',
    color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    name: 'Remote Student',
    role: 'Remote Learner',
    initials: 'RS',
    quote:
      'The lessons made US dispatch terminology and time-zone communication easier to understand before practicing with real-world workflows.',
    color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export function Testimonials() {
  return (
    <section className="py-20 sm:py-24 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 text-sm font-medium">
            Learning Paths
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Student Learning Paths
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Practical ways students use the training tools while building dispatch skills.
          </p>
        </div>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={cardVariants}>
              <Card className="h-full border-border/50 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
                <CardContent className="flex h-full flex-col p-6">
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${testimonial.color}`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
