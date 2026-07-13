'use client';

import { BookOpen, Target, Users, Award, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: BookOpen,
    title: 'Practical Training',
    description:
      'Hands-on exercises with simulated load boards, broker emails, and dispatch scenarios, not just theory.',
    color: 'primary',
    stat: { value: 'Practice-based', label: 'Learning' },
  },
  {
    icon: Target,
    title: 'Realistic Scenarios',
    description:
      'Lessons are built around realistic situations dispatchers commonly handle on the dispatch desk.',
    color: 'emerald',
    stat: { value: 'Scenario-led', label: 'Training' },
  },
  {
    icon: Users,
    title: 'Instructor Guidance',
    description:
      'Dispatch and operations trainers guide learners through practical workflows and review points.',
    color: 'amber',
    stat: { value: 'Guided', label: 'Support' },
  },
  {
    icon: Award,
    title: 'Certificates',
    description:
      'Earn course completion certificates that can help explain the training you finished.',
    color: 'orange',
    stat: { value: 'Shareable', label: 'Completion' },
  },
  {
    icon: Briefcase,
    title: 'Career Preparation',
    description:
      'Resume practice, interview preparation, and career-readiness resources help you present your skills professionally.',
    color: 'rose',
    stat: { value: 'Career-ready', label: 'Tools' },
  },
];

const colorMap: Record<string, { bg: string; iconBg: string; iconText: string; gradient: string; glow: string; borderHover: string }> = {
  primary: {
    bg: 'bg-gradient-to-br from-primary/5 to-primary/10',
    iconBg: 'bg-primary/15',
    iconText: 'text-primary',
    gradient: 'from-primary/10 via-transparent to-primary/5',
    glow: 'group-hover:shadow-primary/15',
    borderHover: 'hover:border-primary/30',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-500/5 to-emerald-500/10',
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-500',
    gradient: 'from-emerald-500/10 via-transparent to-emerald-500/5',
    glow: 'group-hover:shadow-emerald-500/15',
    borderHover: 'hover:border-emerald-500/30',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500/5 to-amber-500/10',
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-500',
    gradient: 'from-amber-500/10 via-transparent to-amber-500/5',
    glow: 'group-hover:shadow-amber-500/15',
    borderHover: 'hover:border-amber-500/30',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500/5 to-orange-500/10',
    iconBg: 'bg-orange-500/15',
    iconText: 'text-orange-500',
    gradient: 'from-orange-500/10 via-transparent to-orange-500/5',
    glow: 'group-hover:shadow-orange-500/15',
    borderHover: 'hover:border-orange-500/30',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-500/5 to-rose-500/10',
    iconBg: 'bg-rose-500/15',
    iconText: 'text-rose-500',
    gradient: 'from-rose-500/10 via-transparent to-rose-500/5',
    glow: 'group-hover:shadow-rose-500/15',
    borderHover: 'hover:border-rose-500/30',
  },
};

export function WhyUs() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
            Why Marokand Humo
          </h2>
          <p className="animate-fade-up stagger-1 mt-4 text-lg text-muted-foreground">
            Training tools for building practical USA truck dispatch skills
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature, index) => {
            const colors = colorMap[feature.color];
            return (
              <Card
                key={feature.title}
                className={`group border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colors.borderHover} overflow-hidden relative animate-slide-up`}
                style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
              >
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[1px] pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, var(--primary), transparent 60%)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                />
                <div className={`h-1.5 w-full bg-gradient-to-r ${colors.gradient} transition-all duration-300 group-hover:h-2`} />
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${colors.iconBg} ${colors.iconText} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${colors.glow}`}>
                    <feature.icon className="h-7 w-7 transition-transform duration-300" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  <div className="mt-auto pt-2 border-t border-border/30 w-full">
                    <p className="font-bold text-foreground">{feature.stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{feature.stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
