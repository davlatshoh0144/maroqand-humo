'use client';

import { useState, useCallback } from 'react';
import {
  Check,
  X,
  HelpCircle,
  Quote,
  Building2,
  Zap,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAppStore } from '@/lib/store/app-store';
import { motion } from 'framer-motion';

const featureComparison = [
  { feature: 'Course lessons', free: 'First lesson only', pro: 'All lessons', career: 'All lessons' },
  { feature: 'Quizzes & feedback', free: '—', pro: '✓', career: '✓' },
  { feature: 'Practice assignments', free: '1 per course', pro: 'Unlimited', career: 'Unlimited + review' },
  { feature: 'Certificates', free: '—', pro: '✓', career: '✓' },
  { feature: 'Discussion access', free: 'Community', pro: 'Instructor replies', career: 'Priority + 1-on-1' },
  { feature: 'Notes', free: '5 per course', pro: 'Unlimited', career: 'Unlimited' },
  { feature: 'Load board exercises', free: 'Basic view', pro: 'Full training', career: 'Full training' },
  { feature: 'Broker mail practice', free: '—', pro: '✓', career: '✓' },
  { feature: 'Fleet visibility lessons', free: '—', pro: '—', career: '✓' },
  { feature: 'Resume builder', free: '—', pro: '—', career: '✓' },
  { feature: 'Mock interviews', free: '—', pro: '—', career: '✓' },
  { feature: 'Job search guidance', free: 'Not included', pro: 'Not included', career: 'Guidance, no guarantee' },
  { feature: 'Career coaching', free: '—', pro: '—', career: '1-on-1 support' },
];

const billingFaqs = [
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, the change takes effect at the end of your current billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer:
      'While we don\'t offer a timed free trial, our Free Plan gives you access to the first lesson of every course so you can experience our teaching style before committing. You can upgrade anytime.',
  },
  {
    question: 'What is your refund policy?',
    answer:
      'Refund requests are reviewed during the first 14 days of a paid plan. Contact support with your account email and we will explain the available options.',
  },
  {
    question: 'Will my price change in the future?',
    answer:
      'When you subscribe, your price is locked in for the duration of your subscription. If we adjust pricing in the future, existing subscribers keep their original rate for at least 12 months.',
  },
  {
    question: 'Do you offer student or military discounts?',
    answer:
      'When discounts are available, we list the requirements clearly. Contact support@marokandhumo.com to ask about current options.',
  },
];

const testimonials = [
  {
    name: 'Starter Student',
    role: 'Pro Student fit',
    location: 'Remote learning',
    quote: 'Pro Student fits learners who want structured lessons, quizzes, broker email practice, and load board exercises.',
  },
  {
    name: 'Career Switcher',
    role: 'Career Track fit',
    location: 'Career preparation',
    quote: 'Career Track fits learners who want assignment review, resume practice, interview preparation, and portfolio feedback.',
  },
  {
    name: 'Course Explorer',
    role: 'Free Plan fit',
    location: 'Course preview',
    quote: 'The Free Plan gives new learners a direct way to review first lessons and decide whether the training style matches their goals.',
  },
];

export function PricingPage() {
  const { user, navigate, pricingPlans } = useAppStore();
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const getPrice = (plan: (typeof pricingPlans)[0]) => {
    if (plan.price === 0) return 0;
    return isAnnual ? Math.round(plan.price * 10) : plan.price;
  };

  const handleCTA = (planSlug: string) => {
    if (planSlug === 'free') {
      if (user) {
        navigate('courses');
      } else {
        navigate('signup');
      }
    } else {
      if (user) {
        navigate('courses');
      } else {
        navigate('signup');
      }
    }
  };

  // 3D tilt handler for pricing cards
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, planId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;
    setHoveredPlan(planId);
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
    setHoveredPlan(null);
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Choose Your Learning Path
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Start free, upgrade when you&apos;re ready. No hidden fees, no
              surprises — just quality education.
            </p>
          </div>
        </div>
      </section>

      {/* Billing Toggle + Pricing Cards */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span
              className={`text-sm font-medium ${
                !isAnnual ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              aria-label="Toggle annual billing"
            />
            <span
              className={`text-sm font-medium ${
                isAnnual ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Save ~17%
              </Badge>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => {
              const price = getPrice(plan);
              const interval = isAnnual ? 'year' : 'month';

              return (
                <div
                  key={plan.id}
                  className={plan.isPopular ? 'gradient-border rounded-xl' : ''}
                  onMouseMove={(e) => handleMouseMove(e, plan.id)}
                  onMouseLeave={handleMouseLeave}
                  style={{ transition: 'transform 0.15s ease-out' }}
                >
                  <Card
                    className={`relative flex flex-col transition-all duration-300 ${
                      plan.isPopular
                        ? 'border-primary/30 bg-card shadow-lg shadow-primary/5 scale-[1.02]'
                        : 'border-border/50 bg-card/50'
                    }`}
                  >
                    {/* Most Popular ribbon with shimmer */}
                    {plan.isPopular && (
                      <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10">
                        <div className="relative">
                          <Badge className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground px-4 py-1 text-xs font-bold shadow-md shadow-primary/25 shimmer-badge">
                            <Check className="mr-1 h-3 w-3" />
                            Most Popular
                          </Badge>
                          {/* Ribbon tails */}
                          <div className="absolute -bottom-1 left-0 w-2 h-2 bg-primary/70 -rotate-45 -translate-x-1/2" />
                          <div className="absolute -bottom-1 right-0 w-2 h-2 bg-primary/70 rotate-45 translate-x-1/2" />
                        </div>
                      </div>
                    )}

                    <CardHeader className={`pb-2 text-center ${plan.isPopular ? 'pt-10' : 'pt-8'}`}>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="mt-3 flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">
                          ${price}
                        </span>
                        <span className="text-muted-foreground">
                          /{interval}
                        </span>
                      </div>
                      {plan.price > 0 && isAnnual && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Billed annually (${price}/{interval})
                        </p>
                      )}
                      {plan.price === 0 && (
                        <p className="mt-1 text-xs text-emerald-500 font-medium">Free forever</p>
                      )}
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col pt-4">
                      <ul className="flex-1 space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm group/feature"
                          >
                            <Check
                              className={`mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${
                                hoveredPlan === plan.id ? 'animate-[check-pop_0.3s_ease-out]' : ''
                              }`}
                            />
                            <span className="text-muted-foreground group-hover/feature:text-foreground transition-colors">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`mt-8 w-full transition-all ${
                          plan.isPopular
                            ? 'shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                            : 'hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                        variant={plan.isPopular ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => handleCTA(plan.slug)}
                      >
                        {plan.price === 0
                          ? 'Get Started'
                          : `Start ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Enterprise */}
          <div className="mt-8">
            <Card className="border-dashed border-2 bg-card/30 hover:border-primary/20 transition-colors">
              <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enterprise / Teams</h3>
                    <p className="text-sm text-muted-foreground">
                      Custom pricing for teams of 5+. Includes dedicated
                      onboarding, team analytics, and priority support.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigate('contact')}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Compare Plans
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See exactly what&apos;s included in each plan
            </p>
          </div>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Feature</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center bg-primary/5 font-semibold">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>Pro Student</span>
                      <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0">Popular</Badge>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Career Track</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureComparison.map((row) => (
                  <TableRow key={row.feature} className="transition-colors hover:bg-muted/20">
                    <TableCell className="font-medium">
                      {row.feature}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {row.free === '—' ? (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      ) : row.free === '✓' ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">
                          {row.free}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm bg-primary/5">
                      {row.pro === '—' ? (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      ) : row.pro === '✓' ? (
                        <Check className="mx-auto h-4 w-4 text-primary font-bold" />
                      ) : (
                        <span className="text-muted-foreground">
                          {row.pro}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {row.career === '—' ? (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      ) : row.career === '✓' ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">
                          {row.career}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Plan Fit Guidance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Practical guidance to help compare plans by learning goal.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="border-border/50 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg card-glow"
              >
                <CardContent className="p-6">
                  <Quote className="mb-2 h-5 w-5 text-primary/30" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div className="mt-4 border-t pt-4">
                    <p className="font-semibold text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-primary">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Billing FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="mr-1 h-3 w-3" />
              Billing FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Questions About Billing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about payments
            </p>
          </div>
          <div className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              {billingFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`billing-faq-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  );
}
