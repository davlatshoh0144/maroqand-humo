'use client';

import { useState } from 'react';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Twitter,
  Linkedin,
  Youtube,
  HelpCircle,
  Globe,
  Building2,
  Truck,
  Users,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAppStore } from '@/lib/store/app-store';
import { toast } from 'sonner';

const MESSAGE_MAX_LENGTH = 1000;

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    detail: 'support@marokandhumo.com',
    subtitle: 'We reply as soon as possible',
  },
  {
    icon: Phone,
    title: 'Support',
    detail: 'Online support',
    subtitle: 'Email is the best way to reach us',
  },
  {
    icon: MapPin,
    title: 'Location',
    detail: 'Tashkent, Uzbekistan',
    subtitle: 'Online-first academy',
  },
  {
    icon: Clock,
    title: 'Support Window',
    detail: 'Business days',
    subtitle: 'Response times may vary',
  },
];

const officeHours = [
  { day: 'Monday', hours: '9:00 AM – 6:00 PM EST', available: true },
  { day: 'Tuesday', hours: '9:00 AM – 6:00 PM EST', available: true },
  { day: 'Wednesday', hours: '9:00 AM – 6:00 PM EST', available: true },
  { day: 'Thursday', hours: '9:00 AM – 6:00 PM EST', available: true },
  { day: 'Friday', hours: '9:00 AM – 5:00 PM EST', available: true },
  { day: 'Saturday', hours: '10:00 AM – 2:00 PM EST', available: true },
  { day: 'Sunday', hours: 'Closed', available: false },
];

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
  { icon: MessageSquare, label: 'Discord', href: '#' },
];

const faqs = [
  {
    question: 'How do I reset my password?',
    answer:
      'Click on the "Forgot Password" link on the login page. Enter your email address and we\'ll send you a password reset link within a few minutes. If you don\'t see it, check your spam folder.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'Refund requests are reviewed during the first 14 days of a paid plan. Contact support with your account email and we will explain the available options.',
  },
  {
    question: 'How do I access my certificate?',
    answer:
      'Once you complete a course, your certificate is generated and added to your Certificates page. You can download it or share the verification link, but employer acceptance is up to each employer.',
  },
  {
    question: 'Do you offer group or corporate plans?',
    answer:
      'Absolutely. We offer custom pricing for teams of 5 or more. Contact us at support@marokandhumo.com with the subject "Corporate Inquiry" and we\'ll create a tailored plan for your organization.',
  },
  {
    question: 'Is there a mobile app?',
    answer:
      'Our platform is fully responsive and works great on mobile browsers. A dedicated mobile app is on our roadmap — stay tuned for updates.',
  },
  {
    question: 'How do I contact an instructor?',
    answer:
      'Pro Student and Career Track members can post questions in course discussion forums, where instructors actively respond. For direct inquiries, use the contact form and select "Instructor Question" as the subject.',
  },
  {
    question: 'Do I need a CDL to take dispatch courses?',
    answer:
      'No. Our dispatch courses are designed for people who want to become freight dispatchers, not drivers. You don\'t need a Commercial Driver\'s License (CDL) — just a computer, internet connection, and willingness to learn.',
  },
  {
    question: 'What equipment do I need to work as a dispatcher?',
    answer:
      'You\'ll need a reliable computer (or laptop), high-speed internet, a headset with microphone, and a quiet workspace. Our "Dispatch Workstation Setup" lesson covers this in detail, including recommended software and tools.',
  },
  {
    question: 'Can I work as a dispatcher from outside the US?',
    answer:
      'Some dispatch workflows can be remote, but requirements vary by employer, carrier, broker, country, and contract. Our courses help you practice US dispatch communication, time zones, and workflow basics.',
  },
  {
    question: 'How long does it take to complete a full course track?',
    answer:
      'Suggested pacing depends on the course depth and your schedule. Many learners study part-time, and all materials are available on-demand so you can move at a realistic pace.',
  },
  {
    question: 'Will the courses help me pass FMCSA compliance requirements?',
    answer:
      'Our compliance and safety courses cover FMCSA regulations and HOS rules for educational purposes. We are not affiliated with FMCSA or any government agency. Our courses help you understand these regulations, but they are not a substitute for official certification or legal advice.',
  },
  {
    question: 'Is Marokand Humo affiliated with DAT, Samsara, Gmail, FMCSA, or DOT?',
    answer:
      'No. Marokand Humo Academy is training software for dispatch practice. It is not affiliated with, endorsed by, or sponsored by DAT, Samsara, Gmail, FMCSA, DOT, or any government agency.',
  },
  {
    question: 'What is the Broker Mail practice tool?',
    answer:
      'Broker Mail is an interactive simulation tool that lets you practice broker communication. You write emails to simulated brokers with different communication styles and get practice responses to build professional writing habits.',
  },
];

export function ContactPage() {
  const { submitLead } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [requestData, setRequestData] = useState({
    name: '',
    email: '',
    courseInterest: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);

  const charCount = formData.message.length;
  const isNearLimit = charCount > MESSAGE_MAX_LENGTH * 0.8;
  const isOverLimit = charCount > MESSAGE_MAX_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit) {
      toast.error('Message is too long. Please shorten it.');
      return;
    }
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    submitLead({
      type: 'contact',
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });

    toast.success('Message sent successfully!', {
      description: "We'll review your message and reply when available.",
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    submitLead({
      type: 'request_info',
      name: requestData.name.trim(),
      email: requestData.email.trim(),
      courseInterest: requestData.courseInterest.trim(),
      message: requestData.message.trim(),
    });
    toast.success('Information request saved', {
      description: 'We will follow up with course details when available.',
    });
    setRequestData({ name: '', email: '', courseInterest: '', message: '' });
    setIsRequestSubmitting(false);
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Contact Us
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Have a question, feedback, or need help? We&apos;re here for you.
              Reach out and our team will respond promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="message">Message</Label>
                        <span
                          className={`text-xs transition-colors ${
                            isOverLimit
                              ? 'text-destructive font-medium'
                              : isNearLimit
                                ? 'text-amber-500'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {charCount}/{MESSAGE_MAX_LENGTH}
                        </span>
                      </div>
                      <Textarea
                        id="message"
                        placeholder="Tell us how we can help..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                        className={isOverLimit ? 'border-destructive focus-visible:border-destructive' : ''}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={isSubmitting || isOverLimit}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Request information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="request-name">Name</Label>
                        <Input
                          id="request-name"
                          placeholder="Your full name"
                          value={requestData.name}
                          onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="request-email">Email</Label>
                        <Input
                          id="request-email"
                          type="email"
                          placeholder="you@example.com"
                          value={requestData.email}
                          onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="request-course">Course interest</Label>
                      <Input
                        id="request-course"
                        placeholder="Dispatch Fundamentals, Broker Communication, or team training"
                        value={requestData.courseInterest}
                        onChange={(e) => setRequestData({ ...requestData, courseInterest: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="request-message">Questions</Label>
                      <Textarea
                        id="request-message"
                        placeholder="Tell us what you want to learn or ask..."
                        rows={4}
                        value={requestData.message}
                        onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isRequestSubmitting}>
                      {isRequestSubmitting ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Request Information
                    </Button>
                  </form>
                </CardContent>
              </Card>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 lg:col-span-2">
              {contactInfo.map((info, i) => (
                <Card
                  key={info.title}
                  className="border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-md group"
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                      <info.icon className="h-6 w-6 animate-icon-bounce" style={{ animationDelay: `${i * 0.3}s` }} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{info.title}</h3>
                      <p className="mt-1 text-sm font-medium">{info.detail}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {info.subtitle}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Social Links */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Follow Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                  {socialLinks.map((social) => (
                    <Button
                      key={social.label}
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 social-icon-hover"
                      asChild
                    >
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                      >
                        <social.icon className="h-4 w-4" />
                      </a>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <MapPin className="mr-1 h-3 w-3" />
              Location
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Headquarters
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Based in Tashkent, serving dispatchers worldwide
            </p>
          </div>
          <Card className="overflow-hidden">
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary/5 via-muted/30 to-primary/5 flex items-center justify-center">
              {/* SVG Map Illustration */}
              <svg
                viewBox="0 0 400 200"
                className="w-full max-w-md h-auto opacity-30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                {/* Simplified world map outline */}
                <ellipse cx="200" cy="100" rx="180" ry="80" className="text-primary/20" />
                {/* Uzbekistan region indicator */}
                <circle cx="260" cy="70" r="8" className="fill-primary/40 stroke-primary/60" />
                <circle cx="260" cy="70" r="3" className="fill-primary" />
                {/* Connecting lines */}
                <line x1="260" y1="70" x2="260" y2="30" className="stroke-primary/30" />
                <line x1="260" y1="30" x2="280" y2="20" className="stroke-primary/30" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Marokand Humo Academy</p>
                  <p className="text-sm text-muted-foreground">Tashkent, Uzbekistan</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  <Globe className="mr-1 h-3 w-3" /> Online-first · Global Access
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Office Hours Table */}
            <div>
              <Badge variant="secondary" className="mb-4">
                <Clock className="mr-1 h-3 w-3" />
                Office Hours
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mt-2">
                When We&apos;re Available
              </h2>
              <p className="mt-3 text-muted-foreground">
                Our support team operates on Eastern Standard Time (EST/UTC-5).
                Outside business hours, email inquiries are handled next business day.
              </p>
              <Card className="mt-6">
                <CardContent className="p-0">
                  {officeHours.map((item, idx) => (
                    <div key={item.day}>
                      <div
                        className={`flex items-center justify-between px-4 py-3 ${
                          idx % 2 === 0 ? 'bg-muted/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              item.available ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                            }`}
                          />
                          <span className="text-sm font-medium">{item.day}</span>
                        </div>
                        <span
                          className={`text-sm ${
                            item.available ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {item.hours}
                        </span>
                      </div>
                      {idx < officeHours.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Available
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  Closed
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  EST (UTC-5)
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                <Truck className="mr-1 h-3 w-3" />
                Academy Focus
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mt-2">
                What We Support
              </h2>
              <p className="mt-3 text-muted-foreground">
                A quick view of what the platform is designed to support.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { icon: Users, label: 'Learning Mode', value: 'Guided' },
                  { icon: GraduationCap, label: 'Course Evidence', value: 'Portfolio' },
                  { icon: Truck, label: 'Training Focus', value: 'Dispatch' },
                  { icon: Clock, label: 'Support Style', value: 'Async' },
                ].map((stat) => (
                  <Card key={stat.label} className="border-border/50">
                    <CardContent className="p-4 text-center">
                      <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="mr-1 h-3 w-3" />
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Quick answers to common questions about our trucking dispatch academy
            </p>
          </div>
          <div className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
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
