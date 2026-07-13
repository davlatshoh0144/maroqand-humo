'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { normalizeRole } from '@/lib/auth/access-control';
import type { Discussion, DiscussionReply } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Plus,
  Pin,
  ThumbsUp,
  Clock,
  GraduationCap,
  Search,
  Send,
  ArrowLeft,
  ChevronRight,
  Users,
  HelpCircle,
  Megaphone,
  ArrowUpDown,
  MessageCircle,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type DiscussionCategory = 'all' | 'question' | 'discussion' | 'study-group' | 'announcement';
type SortOption = 'newest' | 'most-replies' | 'most-helpful';

// Extend Discussion with category for filtering
interface DiscussionWithCategory extends Discussion {
  category: DiscussionCategory;
  helpfulCount: number;
}

// Default community threads used when no persisted discussions exist
const INITIAL_DISCUSSIONS: DiscussionWithCategory[] = [
  {
    id: 'disc-001',
    courseId: 'course-1',
    lessonId: 'lesson-1-1',
    userId: 'instructor-1',
    userName: 'Alisher Karimov',
    title: 'Welcome to Dispatch Fundamentals!',
    content:
      'Welcome everyone! This is the place to ask questions, share insights, and discuss anything related to dispatch fundamentals. Don\'t hesitate to ask — there are no silly questions in this industry. What brought you to dispatching?',
    isPinned: true,
    isAnnouncement: true,
    category: 'announcement',
    helpfulCount: 5,
    createdAt: '2026-01-01T10:00:00Z',
    replies: [
      {
        id: 'reply-001',
        discussionId: 'disc-001',
        userId: 'community-student-1',
        userName: 'Bekzod R.',
        content: 'Thank you, Alisher! I\'m transitioning from a driving career to dispatching. Excited to learn the desk side of the business!',
        isHelpful: false,
        isInstructor: false,
        createdAt: '2026-01-02T08:30:00Z',
      },
      {
        id: 'reply-002',
        discussionId: 'disc-001',
        userId: 'instructor-1',
        userName: 'Alisher Karimov',
        content: 'Great transition, Bekzod! Having driving experience gives you a huge advantage — you already understand the road side. Now you\'ll learn how to manage it from the desk.',
        isHelpful: true,
        isInstructor: true,
        createdAt: '2026-01-02T09:15:00Z',
      },
    ],
  },
  {
    id: 'disc-002',
    courseId: 'course-2',
    userId: 'community-student-2',
    userName: 'Nodira A.',
    title: 'How to handle a broker who won\'t respond to emails?',
    content:
      'I\'ve been trying to get a rate confirmation from a broker for 3 days. I\'ve sent 2 emails and called once but no response. The load is supposed to pick up tomorrow. What should I do? Should I keep waiting or look for another load?',
    isPinned: false,
    isAnnouncement: false,
    category: 'question',
    helpfulCount: 3,
    createdAt: '2026-01-04T14:00:00Z',
    replies: [
      {
        id: 'reply-003',
        discussionId: 'disc-002',
        userId: 'instructor-2',
        userName: 'Nodira Azimova',
        content: 'Three days with no response on a load picking up tomorrow is a red flag. Call again — if no answer, leave a voicemail stating you need confirmation by end of business today or you\'ll need to release the truck. Always protect your driver\'s time.',
        isHelpful: true,
        isInstructor: true,
        createdAt: '2026-01-04T15:30:00Z',
      },
    ],
  },
  {
    id: 'disc-003',
    courseId: 'course-4',
    userId: 'community-student-3',
    userName: 'Timur R.',
    title: 'Split sleeper berth — can someone explain in simple terms?',
    content:
      'I understand the 10-hour off-duty requirement, but the split sleeper berth provision confuses me. Can someone explain when and how to use it with a real example? The FMCSA website explanation is hard to follow.',
    isPinned: false,
    isAnnouncement: false,
    category: 'question',
    helpfulCount: 2,
    createdAt: '2026-01-03T11:00:00Z',
    replies: [],
  },
  {
    id: 'disc-004',
    courseId: 'course-3',
    userId: 'community-student-4',
    userName: 'Dilshod K.',
    title: 'Study group for Load Board Training — Week 2',
    content:
      'Anyone want to form a study group for the Load Board Training course? We\'re starting Week 2 and I think discussing the rate analysis lessons together would be really helpful. Let me know if interested!',
    isPinned: false,
    isAnnouncement: false,
    category: 'study-group',
    helpfulCount: 4,
    createdAt: '2026-01-05T09:00:00Z',
    replies: [
      {
        id: 'reply-004',
        discussionId: 'disc-004',
        userId: 'community-student-1',
        userName: 'Bekzod R.',
        content: 'I\'m in! I\'ve been struggling with the RPM calculations. Would love to go through some examples together.',
        isHelpful: false,
        isInstructor: false,
        createdAt: '2026-01-05T10:30:00Z',
      },
    ],
  },
  {
    id: 'disc-005',
    courseId: 'course-1',
    userId: 'community-student-5',
    userName: 'Gulnora M.',
    title: 'Best practices for dispatcher-driver communication',
    content:
      'I\'ve been dispatching for a few months and finding that my drivers sometimes get frustrated with how I communicate pickup details. What format do you use to relay load information? Any templates or tips would be appreciated.',
    isPinned: false,
    isAnnouncement: false,
    category: 'discussion',
    helpfulCount: 6,
    createdAt: '2026-01-06T16:00:00Z',
    replies: [
      {
        id: 'reply-005',
        discussionId: 'disc-005',
        userId: 'instructor-1',
        userName: 'Alisher Karimov',
        content: 'Great question! I use a standard template: PU location, delivery location, PU time, PO#, commodity, weight, and special instructions. Always text AND email the details. Drivers appreciate having it in writing they can reference later.',
        isHelpful: true,
        isInstructor: true,
        createdAt: '2026-01-06T17:30:00Z',
      },
    ],
  },
];

// Category badge config with colored pills
const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType; pillColor: string }> = {
  question: { label: 'Question', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400', icon: HelpCircle, pillColor: 'bg-amber-500 text-white' },
  discussion: { label: 'Discussion', color: 'bg-primary/10 text-primary border-primary/20', icon: MessageSquare, pillColor: 'bg-primary text-primary-foreground' },
  'study-group': { label: 'Study Group', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400', icon: Users, pillColor: 'bg-emerald-500 text-white' },
  announcement: { label: 'Announcement', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400', icon: Megaphone, pillColor: 'bg-rose-500 text-white' },
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function DiscussionList() {
  const { discussions, user, courses, addDiscussion, addDiscussionReply, toggleDiscussionPin, navigate } =
    useAppStore();

  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<DiscussionCategory>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newCategory, setNewCategory] = useState<DiscussionCategory>('discussion');
  const [replyText, setReplyText] = useState('');
  const [helpfulReplies, setHelpfulReplies] = useState<Record<string, number>>({});

  // Debounced search
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  // Merge store discussions with seed discussions
  const allDiscussions = useMemo(() => {
    const storeIds = new Set(discussions.map((d) => d.id));
    const merged: DiscussionWithCategory[] = [
      ...INITIAL_DISCUSSIONS.filter((d) => !storeIds.has(d.id)),
    ];
    // Add store discussions with default category
    for (const d of discussions) {
      if (!storeIds.has(d.id) || !INITIAL_DISCUSSIONS.find((id) => id.id === d.id)) {
        merged.push({
          ...d,
          category: d.isAnnouncement ? 'announcement' : 'discussion',
          helpfulCount: d.replies.filter((r) => r.isHelpful).length,
        });
      }
    }
    return merged;
  }, [discussions]);

  const filteredDiscussions = useMemo(() => {
    let result = allDiscussions;

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((d) => d.category === categoryFilter);
    }

    // Course filter
    if (courseFilter !== 'all') {
      result = result.filter((d) => d.courseId === courseFilter);
    }

    // Search (using debounced value)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q) ||
          d.userName.toLowerCase().includes(q)
      );
    }

    // Sort
    return result.sort((a, b) => {
      // Pinned always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortOption) {
        case 'most-replies':
          return b.replies.length - a.replies.length;
        case 'most-helpful':
          return b.helpfulCount - a.helpfulCount;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [allDiscussions, categoryFilter, courseFilter, debouncedSearch, sortOption]);

  const selectedDiscussion = useMemo(
    () => allDiscussions.find((d) => d.id === selectedDiscussionId) ?? null,
    [allDiscussions, selectedDiscussionId]
  );

  const handleCreateDiscussion = () => {
    if (!user) {
      toast.error('Please log in to create a discussion.');
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please fill in the title and content.');
      return;
    }

    const discussion: Discussion = {
      id: `disc-${Date.now()}`,
      courseId: newCourseId || undefined,
      userId: user.id,
      userName: user.name,
      title: newTitle.trim(),
      content: newContent.trim(),
      isPinned: false,
      isAnnouncement: newCategory === 'announcement',
      createdAt: new Date().toISOString(),
      replies: [],
    };

    addDiscussion(discussion);
    setNewDiscussionOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewCourseId('');
    setNewCategory('discussion');
    toast.success('Discussion created!', { description: 'Your discussion has been posted.' });
  };

  const handleReply = () => {
    if (!user || !selectedDiscussion) return;
    if (!replyText.trim()) {
      toast.error('Please write a reply.');
      return;
    }

    const reply: DiscussionReply = {
      id: `reply-${Date.now()}`,
      discussionId: selectedDiscussion.id,
      userId: user.id,
      userName: user.name,
      content: replyText.trim(),
      isHelpful: false,
      isInstructor: normalizeRole(user.role) === 'instructor' || normalizeRole(user.role) === 'admin',
      createdAt: new Date().toISOString(),
    };

    addDiscussionReply(selectedDiscussion.id, reply);
    setReplyText('');
    toast.success('Reply posted!');
  };

  const handleMarkHelpful = (replyId: string) => {
    setHelpfulReplies((prev) => ({
      ...prev,
      [replyId]: (prev[replyId] || 0) + 1,
    }));
    toast.success('Marked as helpful!');
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffHrs < 168) return `${Math.floor(diffHrs / 24)}d ago`;
    return d.toLocaleDateString();
  };

  const getCategoryBadge = (category: string, isAnnouncement?: boolean) => {
    const cat = isAnnouncement ? 'announcement' : category;
    const config = categoryConfig[cat] || categoryConfig.discussion;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 gap-0.5 ${config.color}`}>
        <Icon className="h-2.5 w-2.5" />
        {config.label}
      </Badge>
    );
  };

  const getColoredPill = (category: string, isAnnouncement?: boolean) => {
    const cat = isAnnouncement ? 'announcement' : category;
    const config = categoryConfig[cat] || categoryConfig.discussion;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-medium ${config.pillColor}`}>
        <Icon className="h-2.5 w-2.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Discussions
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Ask questions, share insights, and help fellow students
          </p>
        </div>
        <Button onClick={() => setNewDiscussionOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Discussion
        </Button>
      </div>

      {/* Category Filter Tabs + Search + Sort */}
      <div className="space-y-3">
        {/* Category tabs */}
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as DiscussionCategory)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
            <TabsTrigger value="question" className="text-xs px-3 gap-1">
              <HelpCircle className="h-3 w-3" /> Questions
            </TabsTrigger>
            <TabsTrigger value="discussion" className="text-xs px-3 gap-1">
              <MessageSquare className="h-3 w-3" /> Discussions
            </TabsTrigger>
            <TabsTrigger value="study-group" className="text-xs px-3 gap-1">
              <Users className="h-3 w-3" /> Study Groups
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search + Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most-replies">Most Replies</SelectItem>
              <SelectItem value="most-helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Discussion List */}
        <div className="lg:col-span-1 space-y-2">
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2 pr-2"
            >
              {/* Pinned section at top */}
              {filteredDiscussions.some((d) => d.isPinned) && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2 px-1">
                    <Pin className="h-3 w-3" /> Pinned
                  </div>
                  {filteredDiscussions.filter((d) => d.isPinned).map((discussion) => {
                const isSelected = discussion.id === selectedDiscussionId;
                return (
                  <motion.div key={discussion.id} variants={itemVariants}>
                    <button
                      onClick={() => setSelectedDiscussionId(discussion.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all hover-lift pinned-section ${
                        isSelected
                          ? 'border-primary/30 bg-primary/5 shadow-sm'
                          : 'hover:bg-muted/30 hover:border-border/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* User avatar */}
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-[10px] bg-amber-500/10 text-amber-600">
                            {discussion.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {/* Category pill */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {getColoredPill(discussion.category, discussion.isAnnouncement)}
                          </div>
                          <p className={`text-sm ${isSelected ? 'font-semibold' : 'font-medium'} line-clamp-2`}>
                            {discussion.title}
                          </p>
                          {/* Author + reply count + last active */}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                            <span>{discussion.userName}</span>
                            <span className="flex items-center gap-0.5 reply-count-badge bg-muted/50 rounded-full px-1.5 py-0.5">
                              <MessageCircle className="h-2.5 w-2.5" /> {discussion.replies.length}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {formatTime(discussion.createdAt)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </button>
                  </motion.div>
                );
              })}
                </div>
              )}

              {/* Regular (non-pinned) discussions */}
              {filteredDiscussions.filter((d) => !d.isPinned).map((discussion) => {
                const isSelected = discussion.id === selectedDiscussionId;
                return (
                  <motion.div key={discussion.id} variants={itemVariants}>
                    <button
                      onClick={() => setSelectedDiscussionId(discussion.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all hover-lift ${
                        isSelected
                          ? 'border-primary/30 bg-primary/5 shadow-sm'
                          : 'border-transparent hover:bg-muted/30 hover:border-border/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* User avatar */}
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {discussion.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {/* Category pill */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {getColoredPill(discussion.category, discussion.isAnnouncement)}
                          </div>
                          <p className={`text-sm ${isSelected ? 'font-semibold' : 'font-medium'} line-clamp-2`}>
                            {discussion.title}
                          </p>
                          {/* Author + reply count + last active */}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                            <span>{discussion.userName}</span>
                            <span className="flex items-center gap-0.5 reply-count-badge bg-muted/50 rounded-full px-1.5 py-0.5">
                              <MessageCircle className="h-2.5 w-2.5" /> {discussion.replies.length}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <ThumbsUp className="h-2.5 w-2.5" /> {discussion.helpfulCount}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {formatTime(discussion.createdAt)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </button>
                  </motion.div>
                );
              })}
              {filteredDiscussions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No discussions found.
                </div>
              )}
            </motion.div>
          </ScrollArea>
        </div>

        {/* Thread View */}
        <div className="lg:col-span-2">
          {selectedDiscussion ? (
            <Card className="h-[calc(100vh-24rem)] flex flex-col overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      {getCategoryBadge(selectedDiscussion.category, selectedDiscussion.isAnnouncement)}
                      {selectedDiscussion.isPinned && (
                        <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-500">
                          <Pin className="h-2.5 w-2.5 mr-0.5" /> Pinned
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base leading-tight">{selectedDiscussion.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                            {selectedDiscussion.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedDiscussion.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatTime(selectedDiscussion.createdAt)}
                      </span>
                      {/* Course badge */}
                      {selectedDiscussion.courseId && (
                        <Badge variant="secondary" className="text-[9px] bg-primary/5 text-primary border-primary/10">
                          {courses.find((c) => c.id === selectedDiscussion.courseId)?.title || 'Course'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {user && (normalizeRole(user.role) === 'instructor' || normalizeRole(user.role) === 'admin') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDiscussionPin(selectedDiscussion.id)}
                      className="text-xs gap-1"
                    >
                      <Pin className="h-3 w-3" /> {selectedDiscussion.isPinned ? 'Unpin' : 'Pin'}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Original Post */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {selectedDiscussion.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedDiscussion.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedDiscussion.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="ml-11 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedDiscussion.content}
                    </div>
                  </div>

                  <Separator />

                  {/* Replies */}
                  {selectedDiscussion.replies.map((reply, replyIndex) => (
                    <div key={reply.id} className="relative">
                      {/* Thread line */}
                      <div className="absolute left-[16px] top-0 bottom-0 w-px bg-border/50" />
                      <div className="flex items-start gap-3 ml-0 pl-0">
                        {/* Thread dot */}
                        <div className="relative z-10 mt-1">
                          <Avatar className={`h-8 w-8 border-2 ${
                            reply.isInstructor
                              ? 'border-primary/30 bg-primary/10'
                              : 'border-border/50 bg-muted'
                          }`}>
                            <AvatarFallback className={`text-xs font-bold ${
                              reply.isInstructor ? 'text-primary' : ''
                            }`}>
                              {reply.isInstructor ? (
                                <GraduationCap className="h-4 w-4" />
                              ) : (
                                reply.userName.charAt(0)
                              )}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{reply.userName}</p>
                            {reply.isInstructor && (
                              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20 gap-0.5">
                                <GraduationCap className="h-2.5 w-2.5" /> Instructor
                              </Badge>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatTime(reply.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-primary h-6 gap-1 px-2"
                              onClick={() => handleMarkHelpful(reply.id)}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {reply.isHelpful ? 'Helpful' : 'Mark Helpful'}
                              {(helpfulReplies[reply.id] || 0) > 0 && (
                                <span className="ml-0.5 text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-0">
                                  {(reply.isHelpful ? 1 : 0) + helpfulReplies[reply.id]}
                                </span>
                              )}
                            </Button>
                            {reply.isHelpful && !helpfulReplies[reply.id] && (
                              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-0.5">
                                <ThumbsUp className="h-2.5 w-2.5" /> Helpful
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {replyIndex < selectedDiscussion.replies.length - 1 && (
                        <Separator className="mt-3 ml-11" />
                      )}
                    </div>
                  ))}

                  {selectedDiscussion.replies.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No replies yet. Be the first to respond!
                    </p>
                  )}
                </div>
              </ScrollArea>

              {/* Reply Form */}
              <div className="p-4 border-t space-y-3">
                <Textarea
                  placeholder="Write your reply... (Markdown supported)"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="resize-y"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Supports basic Markdown formatting</p>
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={!replyText.trim() || !user}
                    className="gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Reply
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[calc(100vh-24rem)] flex items-center justify-center">
              <div className="text-center space-y-3">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto opacity-30" />
                <p className="text-muted-foreground">Select a discussion to view the thread</p>
                <p className="text-xs text-muted-foreground">Or create a new one using the button above</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Discussion Dialog */}
      <Dialog open={newDiscussionOpen} onOpenChange={setNewDiscussionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Start New Discussion</DialogTitle>
            <DialogDescription>
              Share a question, insight, or start a study group with fellow students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={newCategory} onValueChange={(v) => setNewCategory(v as DiscussionCategory)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">❓ Question</SelectItem>
                  <SelectItem value="discussion">💬 Discussion</SelectItem>
                  <SelectItem value="study-group">👥 Study Group</SelectItem>
                  <SelectItem value="announcement">📢 Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Course (optional)</label>
              <Select value={newCourseId} onValueChange={setNewCourseId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What would you like to discuss?"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your question, insight, or experience... (Markdown supported)"
                rows={5}
                className="mt-1 resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: You can use **bold**, *italic*, and `code` formatting
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNewDiscussionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateDiscussion}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Post Discussion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
