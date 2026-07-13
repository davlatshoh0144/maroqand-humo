'use client';

import { useState, useMemo, useCallback } from 'react';
import { brokerEmails } from '@/lib/data/broker-emails';
import { useAppStore } from '@/lib/store/app-store';
import type { BrokerEmail } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Mail,
  Send,
  ArrowLeft,
  Inbox,
  Circle,
  RefreshCw,
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  PenTool,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Reply,
  Archive,
  Trash2,
  MailOpen,
  MailX,
  Filter,
  Flag,
  Paperclip,
  CornerDownRight,
  Bold,
  Italic,
  Underline,
  List,
  Link2,
  Smile,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const personalityColors: Record<BrokerEmail['personality'], string> = {
  polite: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  busy: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  rude: 'bg-red-500/10 text-red-500 border-red-500/20',
  short_answer: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  negotiation: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  emotional: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const personalityLabels: Record<BrokerEmail['personality'], string> = {
  polite: 'Polite',
  busy: 'Busy',
  rude: 'Assertive',
  short_answer: 'Brief',
  negotiation: 'Negotiator',
  emotional: 'Urgent',
};

/** Priority indicator colors */
const priorityConfig: Record<string, { dotColor: string; label: string; borderColor: string }> = {
  high: { dotColor: 'bg-red-500', label: 'High', borderColor: 'border-l-red-500' },
  medium: { dotColor: 'bg-amber-500', label: 'Medium', borderColor: 'border-l-amber-500' },
  low: { dotColor: 'bg-emerald-500', label: 'Low', borderColor: 'border-l-emerald-500' },
};

/** Get priority from email personality */
function getPriority(email: BrokerEmail): 'high' | 'medium' | 'low' {
  if (email.personality === 'emotional' || email.personality === 'rude') return 'high';
  if (email.personality === 'busy' || email.personality === 'negotiation') return 'medium';
  return 'low';
}

/** Simulate whether email has attachments */
function hasAttachment(email: BrokerEmail): boolean {
  return email.subject.toLowerCase().includes('rate') ||
    email.subject.toLowerCase().includes('confirm') ||
    email.subject.toLowerCase().includes('bol') ||
    email.subject.toLowerCase().includes('documentation');
}

type SortMode = 'newest' | 'oldest' | 'unread';

interface ScoreBadge {
  label: string;
  score: number;
  color: string;
}

function evaluateReply(reply: string, original: BrokerEmail): ScoreBadge[] {
  const lower = reply.toLowerCase();
  const wordCount = reply.trim().split(/\s+/).length;

  const professionalTone = Math.min(100, 40 + (wordCount > 20 ? 30 : wordCount) +
    (lower.includes('please') ? 10 : 0) +
    (lower.includes('thank') ? 10 : 0) +
    (lower.includes('regards') || lower.includes('best') ? 10 : 0));

  const missingInfo = Math.max(0, 100 - (
    (lower.includes('rate') ? 0 : 20) +
    (lower.includes('pickup') || lower.includes('pick up') ? 0 : 15) +
    (lower.includes('delivery') || lower.includes('deliver') ? 0 : 15) +
    (lower.includes('equipment') || lower.includes('van') || lower.includes('reefer') || lower.includes('flatbed') ? 0 : 15) +
    (lower.includes('weight') || lower.includes('lbs') ? 0 : 10) +
    (wordCount < 30 ? 25 : 0)
  ));

  const negotiationQuality = original.personality === 'negotiation' || original.personality === 'rude'
    ? Math.min(100, 30 +
      (lower.includes('market') ? 15 : 0) +
      (lower.includes('rate') ? 15 : 0) +
      (lower.includes('$') ? 20 : 0) +
      (wordCount > 40 ? 20 : 0))
    : Math.min(100, 50 + (wordCount > 20 ? 20 : 0) + (lower.includes('rate') ? 15 : 0) + (lower.includes('$') ? 15 : 0));

  const grammar = Math.min(100, 60 + Math.min(wordCount, 30) +
    (reply === reply.charAt(0).toUpperCase() + reply.slice(1) ? 10 : 0));

  const dispatchAccuracy = Math.min(100, 40 +
    (lower.includes('mc') || lower.includes('dot') ? 15 : 0) +
    (lower.includes('bol') || lower.includes('bill of lading') ? 15 : 0) +
    (lower.includes('confirm') ? 10 : 0) +
    (lower.includes('insurance') ? 10 : 0) +
    (lower.includes('driver') ? 10 : 0));

  return [
    { label: 'Professional Tone', score: professionalTone, color: professionalTone >= 70 ? 'text-emerald-500' : 'text-amber-500' },
    { label: 'Missing Info', score: missingInfo, color: missingInfo >= 70 ? 'text-emerald-500' : 'text-red-500' },
    { label: 'Negotiation Quality', score: negotiationQuality, color: negotiationQuality >= 70 ? 'text-emerald-500' : 'text-amber-500' },
    { label: 'Grammar', score: grammar, color: grammar >= 70 ? 'text-emerald-500' : 'text-amber-500' },
    { label: 'Dispatch Accuracy', score: dispatchAccuracy, color: dispatchAccuracy >= 70 ? 'text-emerald-500' : 'text-amber-500' },
  ];
}

export function BrokerMail() {
  const { navigate } = useAppStore();
  const [emails, setEmails] = useState<BrokerEmail[]>(brokerEmails);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sentReplies, setSentReplies] = useState<Record<string, string[]>>({});
  const [scoreBadges, setScoreBadges] = useState<Record<string, ScoreBadge[]>>({});
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [mobileFullView, setMobileFullView] = useState(false);
  const [starredEmails, setStarredEmails] = useState<Set<string>>(new Set());
  const [flaggedEmails, setFlaggedEmails] = useState<Set<string>>(new Set());
  const [activeFormatTool, setActiveFormatTool] = useState<string | null>(null);

  const selectedEmail = useMemo(
    () => emails.find((e) => e.id === selectedEmailId) ?? null,
    [emails, selectedEmailId]
  );

  const unreadCount = emails.filter((e) => !e.read).length;

  const sortedEmails = useMemo(() => {
    const sorted = [...emails];
    switch (sortMode) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      case 'unread':
        return sorted.sort((a, b) => {
          if (a.read === b.read) return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          return a.read ? 1 : -1;
        });
      default:
        return sorted;
    }
  }, [emails, sortMode]);

  const threadEmails = useMemo(() => {
    if (!selectedEmail) return [];
    const threadId = selectedEmail.threadId;
    return emails.filter((e) => e.threadId === threadId);
  }, [emails, selectedEmail]);

  const handleSendReply = useCallback(() => {
    if (!selectedEmail || !replyText.trim()) {
      toast.error('Please write a reply before sending.');
      return;
    }

    const badges = evaluateReply(replyText, selectedEmail);
    setScoreBadges((prev) => ({ ...prev, [selectedEmail.id]: badges }));
    setSentReplies((prev) => ({
      ...prev,
      [selectedEmail.id]: [...(prev[selectedEmail.id] ?? []), replyText],
    }));

    const avgScore = Math.round(badges.reduce((a, b) => a + b.score, 0) / badges.length);
    toast.success(`Reply sent! Average score: ${avgScore}%`, { duration: 4000 });
    setReplyText('');
    setReplyDialogOpen(false);
  }, [selectedEmail, replyText]);

  const handleNewScenario = () => {
    const personalities: BrokerEmail['personality'][] = [
      'polite', 'busy', 'rude', 'short_answer', 'negotiation', 'emotional',
    ];
    const nextIdx = (scenarioIndex + 1) % personalities.length;
    setScenarioIndex(nextIdx);
    const nextEmail = emails.find((e) => e.personality === personalities[nextIdx]);
    if (nextEmail) {
      setSelectedEmailId(nextEmail.id);
      setReplyText('');
      setMobileFullView(true);
    }
    toast.info(`New scenario: ${personalityLabels[personalities[nextIdx]]} broker`);
  };

  const handleToggleRead = (emailId: string) => {
    setEmails((prev) =>
      prev.map((e) => e.id === emailId ? { ...e, read: !e.read } : e)
    );
    const email = emails.find((e) => e.id === emailId);
    if (email) {
      toast.success(email.read ? 'Marked as unread' : 'Marked as read');
    }
  };

  const handleDelete = (emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId));
    if (selectedEmailId === emailId) {
      setSelectedEmailId(null);
      setMobileFullView(false);
    }
    toast.success('Email archived');
  };

  const handleArchive = (emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId));
    if (selectedEmailId === emailId) {
      setSelectedEmailId(null);
      setMobileFullView(false);
    }
    toast.success('Email archived');
  };

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
    setReplyText('');
    setMobileFullView(true);
    // Mark as read when selected
    setEmails((prev) =>
      prev.map((e) => e.id === emailId ? { ...e, read: true } : e)
    );
  };

  const handleToggleStar = (emailId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStarredEmails((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) next.delete(emailId);
      else next.add(emailId);
      return next;
    });
  };

  const handleToggleFlag = (emailId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFlaggedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) next.delete(emailId);
      else next.add(emailId);
      return next;
    });
    const isFlagged = flaggedEmails.has(emailId);
    toast.success(isFlagged ? 'Flag removed' : 'Email flagged for follow-up');
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  };

  const sortLabels: Record<SortMode, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    unread: 'Unread First',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Broker Mail Practice
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Practice professional email communication with brokers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewScenario} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> New Scenario
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-0">
        {[
          { step: 1, label: 'Read Email', icon: Mail, done: !!selectedEmailId },
          { step: 2, label: 'Analyze', icon: Shield, done: selectedEmailId ? scoreBadges[selectedEmailId]?.length > 0 : false },
          { step: 3, label: 'Compose Reply', icon: PenTool, done: selectedEmailId ? (sentReplies[selectedEmailId]?.length ?? 0) > 0 : false },
          { step: 4, label: 'Scored', icon: CheckCircle2, done: selectedEmailId ? (sentReplies[selectedEmailId]?.length ?? 0) > 0 : false },
        ].map((s, i) => (
          <div key={s.step} className="flex items-center">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              s.done ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
            )}>
              <div className={cn(
                'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                s.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {s.done ? <Check className="h-3 w-3" /> : s.step}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < 3 && (
              <div className="step-connector w-6 sm:w-10 mx-1">
                <div className={cn('h-0.5 rounded-full transition-all', s.done ? 'bg-primary' : 'bg-muted/30')} style={{ width: s.done ? '100%' : '0%', transition: 'width 0.4s ease' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Layout - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-16rem)]">
        {/* Left Panel - Email List */}
        <Card className={`lg:col-span-2 flex flex-col overflow-hidden ${mobileFullView && selectedEmail ? 'hidden lg:flex' : 'flex'}`}>
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Inbox className="h-4 w-4" /> Inbox
                </CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {emails.length} of {brokerEmails.length} emails
              </span>
            </div>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Filter className="h-3 w-3" />
                    {sortLabels[sortMode]}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setSortMode('newest')}>
                    <ArrowDown className="h-3.5 w-3.5 mr-2" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortMode('oldest')}>
                    <ArrowUp className="h-3.5 w-3.5 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortMode('unread')}>
                    <MailX className="h-3.5 w-3.5 mr-2" />
                    Unread First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/50">
              {sortedEmails.map((email, emailIdx) => {
                const isSelected = email.id === selectedEmailId;
                const hasReply = sentReplies[email.id]?.length ?? 0 > 0;
                const priority = getPriority(email);
                const showAttachment = hasAttachment(email);
                const isStarred = starredEmails.has(email.id);
                const priorityCfg = priorityConfig[priority];
                const isSentByUser = sentReplies[email.id]?.length > 0;
                return (
                  <motion.button
                    key={email.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: emailIdx * 0.03 }}
                    onClick={() => handleSelectEmail(email.id)}
                    className={cn(
                      'w-full text-left p-3 transition-all border-l-3 email-card-lift',
                      isSelected
                        ? 'bg-primary/5 border-l-primary shadow-sm'
                        : 'hover:bg-muted/30 border-l-transparent',
                      !email.read ? 'bg-primary/[0.02]' : '',
                      isSentByUser ? 'email-sent' : 'email-received'
                    )}
                    style={{ borderLeftWidth: '3px', borderLeftColor: isSelected ? 'var(--primary)' : 'transparent' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Priority indicator dot */}
                        <span className={cn('h-2 w-2 rounded-full flex-shrink-0', priorityCfg.dotColor)} title={`${priorityCfg.label} priority`} />
                        {!email.read && (
                          <span className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                        {email.read && !priority && (
                          <span className="h-2.5 w-2.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm truncate ${!email.read ? 'font-bold' : 'font-medium'}`}>
                          {email.fromName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Star button */}
                        <button
                          onClick={(e) => handleToggleStar(email.id, e)}
                          className={cn(
                            'p-0.5 rounded transition-colors',
                            isStarred ? 'text-amber-400' : 'text-muted-foreground/30 hover:text-amber-400/60'
                          )}
                          aria-label={isStarred ? 'Unstar email' : 'Star email'}
                        >
                          <Star className={cn('h-3.5 w-3.5', isStarred && 'fill-amber-400')} />
                        </button>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimestamp(email.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${!email.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {email.subject}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate leading-relaxed">
                      {email.body.split('\n').find((l) => l.trim())?.slice(0, 60)}...
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge
                        variant="secondary"
                        className={`text-[9px] px-1 py-0 h-4 ${personalityColors[email.personality]}`}
                      >
                        {personalityLabels[email.personality]}
                      </Badge>
                      {/* Priority badge */}
                      <Badge
                        variant="secondary"
                        className={`text-[9px] px-1 py-0 h-4 ${
                          priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}
                      >
                        {priorityCfg.label}
                      </Badge>
                      {hasReply && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-500">
                          Replied
                        </Badge>
                      )}
                      {/* Attachment indicator */}
                      {showAttachment && (
                        <span title="Has attachments" aria-label="Has attachments">
                          <Paperclip className="h-3 w-3 text-muted-foreground/50" aria-hidden="true" />
                        </span>
                      )}
                      {/* Flag indicator */}
                      {flaggedEmails.has(email.id) && (
                        <span title="Flagged" aria-label="Flagged">
                          <Flag className="h-3 w-3 text-orange-500 fill-orange-500" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel - Email Preview */}
        <Card className={`lg:col-span-3 flex flex-col overflow-hidden ${mobileFullView && selectedEmail ? 'flex' : 'hidden lg:flex'}`}>
          {selectedEmail ? (
            <>
              {/* Email Header with Action Buttons */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Mobile back button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden mb-2 -ml-2 gap-1"
                      onClick={() => setMobileFullView(false)}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Inbox
                    </Button>
                    <CardTitle className="text-base leading-snug">{selectedEmail.subject}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                      <span className="text-sm text-muted-foreground">From: {selectedEmail.fromName}</span>
                      <span className="text-xs text-muted-foreground">({selectedEmail.from})</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${personalityColors[selectedEmail.personality]}`}
                      >
                        {personalityLabels[selectedEmail.personality]}
                      </Badge>
                      {/* Priority indicator in preview */}
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          getPriority(selectedEmail) === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          getPriority(selectedEmail) === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full mr-1', priorityConfig[getPriority(selectedEmail)].dotColor)} />
                        {priorityConfig[getPriority(selectedEmail)].label} Priority
                      </Badge>
                      {/* Attachment indicator */}
                      {hasAttachment(selectedEmail) && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Paperclip className="h-3 w-3" /> Attachment
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => setReplyDialogOpen(true)}
                    >
                      <Reply className="h-3.5 w-3.5" /> Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={(e) => handleToggleStar(selectedEmail.id, e)}
                      aria-label={starredEmails.has(selectedEmail.id) ? 'Unstar' : 'Star'}
                    >
                      <Star className={cn('h-4 w-4', starredEmails.has(selectedEmail.id) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={(e) => handleToggleFlag(selectedEmail.id, e)}
                      aria-label={flaggedEmails.has(selectedEmail.id) ? 'Remove flag' : 'Flag'}
                    >
                      <Flag className={cn('h-4 w-4', flaggedEmails.has(selectedEmail.id) ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground')} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => handleToggleRead(selectedEmail.id)}
                    >
                      {selectedEmail.read ? (
                        <><MailX className="h-3.5 w-3.5" /> Unread</>
                      ) : (
                        <><MailOpen className="h-3.5 w-3.5" /> Read</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => handleArchive(selectedEmail.id)}
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(selectedEmail.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1">
                <div className="p-5 space-y-4">
                  {/* Original email */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold ring-2 ring-background shadow-sm">
                        {selectedEmail.fromName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{selectedEmail.fromName}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(selectedEmail.timestamp)}</p>
                      </div>
                    </div>
                    <div className="ml-11 text-sm whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/50 font-[system-ui]">
                      {selectedEmail.body}
                    </div>
                  </div>

                  {/* Thread emails from same thread - indented with thread visualization */}
                  {threadEmails
                    .filter((e) => e.id !== selectedEmail.id)
                    .map((email, threadIdx) => (
                      <div key={email.id} className="space-y-2">
                        <Separator />
                        {/* Thread connector */}
                        <div className="flex items-start gap-2.5 ml-2">
                          <div className="flex flex-col items-center">
                            <CornerDownRight className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold ring-2 ring-background shadow-sm -ml-1">
                            {email.fromName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{email.fromName}</p>
                            <p className="text-xs text-muted-foreground">{formatTimestamp(email.timestamp)}</p>
                          </div>
                        </div>
                        <div className="ml-6 text-sm whitespace-pre-wrap leading-relaxed bg-muted/15 p-4 rounded-lg border border-border/40 border-l-2 border-l-muted-foreground/20 font-[system-ui]">
                          {email.body}
                        </div>
                      </div>
                    ))}

                  {/* Sent replies - indented as thread replies */}
                  {(sentReplies[selectedEmail.id] ?? []).map((reply, i) => (
                    <div key={i} className="space-y-2">
                      <Separator />
                      <div className="flex items-start gap-2.5 ml-2">
                        <div className="flex flex-col items-center">
                          <CornerDownRight className="h-4 w-4 text-primary/40" />
                        </div>
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-background shadow-sm -ml-1">
                          You
                        </div>
                        <div>
                          <p className="text-sm font-medium">Your Reply</p>
                          <p className="text-xs text-muted-foreground">Sent</p>
                        </div>
                      </div>
                      <div className="ml-6 text-sm whitespace-pre-wrap leading-relaxed bg-primary/5 border border-primary/10 border-l-2 border-l-primary/20 p-4 rounded-lg font-[system-ui]">
                        {reply}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Score Badges */}
              {scoreBadges[selectedEmail.id] && (
                <div className="px-4 py-2 border-t bg-muted/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground mr-1">Score:</span>
                    {scoreBadges[selectedEmail.id].map((badge, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={`text-[10px] gap-1 ${badge.score >= 70 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                      >
                        {badge.score >= 70 ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : (
                          <AlertTriangle className="h-2.5 w-2.5" />
                        )}
                        {badge.label}: {badge.score}%
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Reply Bar with Rich Formatting Toolbar */}
              <div className="p-4 border-t space-y-2">
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-0.5 pb-1 border-b border-border/30">
                  {[Bold, Italic, Underline].map((Icon, i) => (
                    <button
                      key={i}
                      className={cn(
                        'toolbar-btn h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground',
                        activeFormatTool === Icon.displayName && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => setActiveFormatTool(prev => prev === Icon.displayName ? null : Icon.displayName ?? null)}
                      title={Icon.displayName}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  <div className="w-px h-4 bg-border/30 mx-1" />
                  {[List, Link2, Smile].map((Icon, i) => (
                    <button
                      key={`extra-${i}`}
                      className="toolbar-btn h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                      title={Icon.displayName}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Write your professional reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="resize-y text-sm"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {replyText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    {replyText.trim().split(/\s+/).filter(Boolean).length < 30 && replyText.trim().length > 0 && (
                      <span className="text-[10px] text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Short reply
                      </span>
                    )}
                  </div>
                  <Button onClick={handleSendReply} disabled={!replyText.trim()} className="gap-1.5" size="sm">
                    <Send className="h-3.5 w-3.5" /> Send Reply
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30">
                <Mail className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">No email selected</p>
                <p className="text-muted-foreground/70 text-sm">Select an email from the inbox to start practicing</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Reply Dialog (Mobile & Desktop) */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="h-5 w-5 text-primary" />
              Reply to {selectedEmail?.fromName}
            </DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50">
                <p className="font-medium text-foreground text-xs mb-1">Re: {selectedEmail.subject}</p>
                <p className="text-xs line-clamp-3">{selectedEmail.body.slice(0, 200)}...</p>
              </div>
              <Textarea
                placeholder="Write your professional reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                className="resize-y"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {replyText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendReply} disabled={!replyText.trim()} className="gap-1.5">
              <Send className="h-3.5 w-3.5" /> Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
