'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Linkedin, Twitter, Mail, MapPin, Phone, Send, ArrowUp, Github, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store/app-store';

const footerLinks = {
  courses: [
    { label: 'Dispatch Fundamentals', action: 'course-1' as const },
    { label: 'Broker Communication', action: 'course-2' as const },
    { label: 'Load Board Training', action: 'course-3' as const },
    { label: 'HOS / ELD Basics', action: 'course-4' as const },
    { label: 'DOT Compliance', action: 'course-5' as const },
  ],
  resources: [
    { label: 'Blog', view: 'contact' as const },
    { label: 'Documentation', view: 'contact' as const },
    { label: 'Help Center', view: 'contact' as const },
    { label: 'Community', view: 'contact' as const },
  ],
  company: [
    { label: 'About Us', view: 'about' as const },
    { label: 'Careers', view: 'contact' as const },
    { label: 'Contact', view: 'contact' as const },
    { label: 'Partners', view: 'about' as const },
  ],
  legal: [
    { label: 'Privacy Policy', view: 'privacy' as const },
    { label: 'Terms of Service', view: 'terms' as const },
    { label: 'Refund Policy', view: 'refund' as const },
  ],
};

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: '#', hoverBg: 'hover:bg-blue-600/10 hover:text-blue-600' },
  { icon: Twitter, label: 'Twitter', href: '#', hoverBg: 'hover:bg-sky-500/10 hover:text-sky-500' },
  { icon: Github, label: 'GitHub', href: '#', hoverBg: 'hover:bg-gray-600/10 hover:text-gray-600' },
  { icon: Globe, label: 'Website', href: '#', hoverBg: 'hover:bg-primary/10 hover:text-primary' },
  { icon: Mail, label: 'Email', href: 'mailto:info@marokandhumo.com', hoverBg: 'hover:bg-orange-500/10 hover:text-orange-500' },
];

const partnerNames = ['US Logistics Operations', 'Freight Brokerages', 'Fleet Operators', '3PL Companies', 'Trucking Carriers'];

export function Footer() {
  const { navigate, submitLead } = useAppStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      submitLead({ type: 'newsletter', email: email.trim() });
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto bg-muted/30">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Logo & Tagline */}
          <div className="col-span-2">
            <button
              onClick={() => navigate('landing')}
              className="mb-4 flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-80 focus-ring p-0.5"
              aria-label="Go to homepage"
            >
              <Image
                src="/logo-simple.png"
                alt="Marokand Humo"
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-sm text-foreground">
                  MAROKAND HUMO
                </span>
                <span className="text-[11px] text-primary font-medium tracking-wider uppercase">
                  Academy
                </span>
              </div>
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] text-balance">
              Practical USA Truck Dispatch Training for the next generation of dispatchers.
            </p>

            {/* Contact info */}
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="mailto:info@marokandhumo.com"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4 focus-ring rounded-sm"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                info@marokandhumo.com
              </a>
              <a
                href="tel:+18005551234"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4 focus-ring rounded-sm"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                +1 (800) 555-1234
              </a>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                Samarkand, Uzbekistan
              </span>
            </div>

            {/* Social icons with hover animations */}
            <div className="mt-4 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all duration-200 ${social.hoverBg} focus-ring hover:scale-110 hover:shadow-sm`}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Courses</h3>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate('course-detail', link.action)}
                    className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4 focus-ring rounded-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4 focus-ring rounded-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4 focus-ring rounded-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter with gradient border */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Newsletter</h3>
            <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
              Get dispatch tips and course updates.
            </p>
            <div className="rounded-lg p-px bg-gradient-to-br from-primary/30 via-primary/10 to-primary/30">
              <form onSubmit={handleSubscribe} className="flex gap-2 bg-card rounded-[7px] p-1.5">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-sm focus-ring border-0 bg-transparent"
                  aria-label="Email for newsletter"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 shrink-0 transition-all duration-150 focus-ring gap-1"
                  aria-label="Subscribe"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
            {subscribed && (
              <p className="mt-2 text-sm font-medium text-primary animate-fade-in">
                Subscribed! Check your inbox.
              </p>
            )}
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline underline-offset-4 focus-ring rounded-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Partner/Trust badges section */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-3 text-center">Our training is designed for</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {partnerNames.map((name) => (
              <span
                key={name}
                className="text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200 tracking-wide"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-simple.png"
              alt="Marokand Humo"
              width={20}
              height={20}
              className="h-5 w-auto opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Marokand Humo Academy. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Back to top button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="gap-1.5 text-muted-foreground hover:text-foreground transition-all hover:-translate-y-0.5"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span className="text-xs">Back to top</span>
            </Button>

            <span className="text-sm text-muted-foreground-secondary hidden sm:inline">
              •
            </span>

            {/* Made in Uzbekistan badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors duration-150">
              Made in Uzbekistan <span aria-label="Uzbekistan flag">🇺🇿</span>
            </span>

            <span className="text-sm text-muted-foreground-secondary hidden sm:inline">
              •
            </span>

            <p className="text-sm text-muted-foreground hidden sm:inline">
              Dedicated to future dispatchers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
