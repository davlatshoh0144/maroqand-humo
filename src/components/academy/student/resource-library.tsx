'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Search,
  Star,
  Download,
  FileText,
  FileSpreadsheet,
  Video,
  File,
  Clock,
  TrendingUp,
  Filter,
  X,
  ChevronRight,
  Eye,
  ArrowUpDown,
  BookOpen,
  ClipboardList,
  FileCheck,
  PlayCircle,
  FileIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';

type ResourceCategory = 'Templates' | 'Checklists' | 'Reference Guides' | 'Forms' | 'Videos';
type FileType = 'PDF' | 'Excel' | 'Word' | 'Video' | 'ZIP';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  fileType: FileType;
  fileSize: string;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  addedAt: string;
  tags: string[];
  popular: boolean;
  recentlyAdded: boolean;
}

const categoryConfig: Record<ResourceCategory, { icon: React.ElementType; color: string; emoji: string }> = {
  'Templates': { icon: FileText, color: 'bg-primary/10 text-primary border-primary/20', emoji: '📄' },
  'Checklists': { icon: ClipboardList, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', emoji: '✅' },
  'Reference Guides': { icon: BookOpen, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', emoji: '📖' },
  'Forms': { icon: FileCheck, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', emoji: '📝' },
  'Videos': { icon: PlayCircle, color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', emoji: '🎬' },
};

const fileTypeConfig: Record<FileType, { icon: React.ElementType; color: string }> = {
  'PDF': { icon: FileText, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  'Excel': { icon: FileSpreadsheet, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  'Word': { icon: FileText, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  'Video': { icon: Video, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  'ZIP': { icon: File, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
};

const resources: Resource[] = [
  {
    id: 'res-1',
    title: 'Rate Confirmation Template',
    description: 'Professional rate confirmation template with all essential fields. Customize for broker agreements, includes terms and conditions section.',
    category: 'Templates',
    fileType: 'Word',
    fileSize: '45 KB',
    downloadCount: 1243,
    rating: 4.8,
    ratingCount: 89,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    tags: ['rate con', 'agreement', 'broker'],
    popular: true,
    recentlyAdded: true,
  },
  {
    id: 'res-2',
    title: 'Pre-Trip Inspection Checklist',
    description: 'Comprehensive DOT-compliant pre-trip inspection checklist covering all vehicle components. Print-ready format for daily use.',
    category: 'Checklists',
    fileType: 'PDF',
    fileSize: '120 KB',
    downloadCount: 2156,
    rating: 4.9,
    ratingCount: 156,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    tags: ['inspection', 'DOT', 'safety', 'compliance'],
    popular: true,
    recentlyAdded: false,
  },
  {
    id: 'res-3',
    title: 'HOS Quick Reference Card',
    description: 'Laminated-card style reference for Hours of Service rules including 11/14/70-hour limits, split sleeper, and adverse weather exceptions.',
    category: 'Reference Guides',
    fileType: 'PDF',
    fileSize: '85 KB',
    downloadCount: 1876,
    rating: 4.7,
    ratingCount: 112,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    tags: ['HOS', 'ELD', 'compliance', 'FMCSA'],
    popular: true,
    recentlyAdded: false,
  },
  {
    id: 'res-4',
    title: 'Load Board Evaluation Worksheet',
    description: 'Excel spreadsheet for evaluating loads from load boards. Calculates RPM, estimates profit, and flags potential issues automatically.',
    category: 'Templates',
    fileType: 'Excel',
    fileSize: '230 KB',
    downloadCount: 934,
    rating: 4.6,
    ratingCount: 67,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    tags: ['load board', 'RPM', 'profit', 'calculation'],
    popular: false,
    recentlyAdded: true,
  },
  {
    id: 'res-5',
    title: 'Broker Email Templates Pack',
    description: '12 professional email templates for common broker communications: initial outreach, rate negotiation, follow-up, problem resolution, and more.',
    category: 'Templates',
    fileType: 'Word',
    fileSize: '78 KB',
    downloadCount: 1567,
    rating: 4.8,
    ratingCount: 98,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    tags: ['email', 'broker', 'communication', 'templates'],
    popular: true,
    recentlyAdded: false,
  },
  {
    id: 'res-6',
    title: 'New Dispatcher Onboarding Checklist',
    description: 'Complete onboarding checklist for new dispatchers. Covers essential knowledge, tools setup, first-week tasks, and 30/60/90-day milestones.',
    category: 'Checklists',
    fileType: 'PDF',
    fileSize: '95 KB',
    downloadCount: 823,
    rating: 4.5,
    ratingCount: 54,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    tags: ['onboarding', 'new dispatcher', 'training'],
    popular: false,
    recentlyAdded: true,
  },
  {
    id: 'res-7',
    title: 'Freight Rate Negotiation Guide',
    description: 'In-depth guide covering negotiation strategies, market analysis techniques, and real-world scripts for getting better rates from brokers.',
    category: 'Reference Guides',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    downloadCount: 1089,
    rating: 4.7,
    ratingCount: 78,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    tags: ['negotiation', 'rates', 'broker', 'RPM'],
    popular: false,
    recentlyAdded: false,
  },
  {
    id: 'res-8',
    title: 'Bill of Lading Form (Blank)',
    description: 'Standard blank BOL form with all required fields per FMCSA regulations. Fillable PDF format for digital or print use.',
    category: 'Forms',
    fileType: 'PDF',
    fileSize: '55 KB',
    downloadCount: 2341,
    rating: 4.6,
    ratingCount: 134,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    tags: ['BOL', 'bill of lading', 'shipping', 'FMCSA'],
    popular: true,
    recentlyAdded: false,
  },
  {
    id: 'res-9',
    title: 'Load Dispatch Workflow Video',
    description: 'Step-by-step video walkthrough of the complete load dispatch process — from receiving a load tender to confirming delivery. 22 minutes.',
    category: 'Videos',
    fileType: 'Video',
    fileSize: '145 MB',
    downloadCount: 756,
    rating: 4.9,
    ratingCount: 45,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    tags: ['dispatch', 'workflow', 'tutorial', 'video'],
    popular: false,
    recentlyAdded: true,
  },
  {
    id: 'res-10',
    title: 'Carrier Compliance Checklist',
    description: 'Annual compliance checklist for carriers covering DOT authority, insurance, drug testing, vehicle maintenance, and driver qualification files.',
    category: 'Checklists',
    fileType: 'PDF',
    fileSize: '110 KB',
    downloadCount: 645,
    rating: 4.4,
    ratingCount: 38,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    tags: ['compliance', 'DOT', 'carrier', 'regulations'],
    popular: false,
    recentlyAdded: false,
  },
  {
    id: 'res-11',
    title: 'Detention Time Tracker Spreadsheet',
    description: 'Track detention hours at shippers/receivers with automatic billing calculations. Includes rate per hour and total amount owed columns.',
    category: 'Templates',
    fileType: 'Excel',
    fileSize: '156 KB',
    downloadCount: 578,
    rating: 4.5,
    ratingCount: 42,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    tags: ['detention', 'billing', 'tracking', 'accessorial'],
    popular: false,
    recentlyAdded: true,
  },
  {
    id: 'res-12',
    title: 'FMCSA Regulations Quick Guide',
    description: 'Summarized reference of key FMCSA regulations that every dispatcher should know. Covers HOS, ELD mandate, CDL requirements, and more.',
    category: 'Reference Guides',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    downloadCount: 1698,
    rating: 4.8,
    ratingCount: 103,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    tags: ['FMCSA', 'regulations', 'compliance', 'HOS'],
    popular: true,
    recentlyAdded: false,
  },
  {
    id: 'res-13',
    title: 'Rate Negotiation Role-Play Video',
    description: 'Watch a professional dispatcher negotiate rates with a broker in real-time. Includes commentary and strategy breakdown. 18 minutes.',
    category: 'Videos',
    fileType: 'Video',
    fileSize: '120 MB',
    downloadCount: 432,
    rating: 4.7,
    ratingCount: 31,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    tags: ['negotiation', 'video', 'role-play', 'broker'],
    popular: false,
    recentlyAdded: false,
  },
  {
    id: 'res-14',
    title: 'Shipper/Receiver Setup Form',
    description: 'New shipper or receiver onboarding form template. Captures facility details, appointment requirements, loading/unloading procedures, and contact info.',
    category: 'Forms',
    fileType: 'Word',
    fileSize: '62 KB',
    downloadCount: 389,
    rating: 4.3,
    ratingCount: 27,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    tags: ['shipper', 'receiver', 'onboarding', 'facility'],
    popular: false,
    recentlyAdded: true,
  },
  {
    id: 'res-15',
    title: 'Trucking Dispatch Resource Bundle',
    description: 'Complete bundle including rate con template, BOL form, HOS reference, broker email templates, and checklists. All in one ZIP download.',
    category: 'Templates',
    fileType: 'ZIP',
    fileSize: '5.2 MB',
    downloadCount: 912,
    rating: 4.6,
    ratingCount: 73,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    tags: ['bundle', 'templates', 'forms', 'starter kit'],
    popular: false,
    recentlyAdded: false,
  },
];

function StarRating({
  rating,
  onRate,
  size = 'sm',
  interactive = false,
}: {
  rating: number;
  onRate?: (r: number) => void;
  size?: 'sm' | 'md';
  interactive?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={cn('transition-colors', interactive && 'cursor-pointer hover:scale-110')}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate?.(star)}
          type="button"
        >
          <Star
            className={cn(
              starSize,
              star <= displayRating
                ? 'text-amber-500 fill-amber-500'
                : 'text-muted-foreground/20'
            )}
          />
        </button>
      ))}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type SortOption = 'popular' | 'rating' | 'recent' | 'downloads' | 'title';

export function ResourceLibrary() {
  const { rateResource, getResourceRating, trackResourceDownload, downloadedResourceIds } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'All'>('All');
  const [selectedFileType, setSelectedFileType] = useState<FileType | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'recent'>('all');

  const filteredResources = useMemo(() => {
    let result = resources;

    // Tab filter
    if (activeTab === 'popular') {
      result = result.filter((r) => r.popular);
    } else if (activeTab === 'recent') {
      result = result.filter((r) => r.recentlyAdded);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    // File type filter
    if (selectedFileType !== 'All') {
      result = result.filter((r) => r.fileType === selectedFileType);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result = [...result].sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
        result = [...result].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'downloads':
        result = [...result].sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'title':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedFileType, sortBy, activeTab]);

  const popularResources = useMemo(
    () => [...resources].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 4),
    []
  );

  const recentResources = useMemo(
    () => [...resources].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 4),
    []
  );

  const handleDownload = (resource: Resource) => {
    trackResourceDownload(resource.id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const categories: (ResourceCategory | 'All')[] = ['All', 'Templates', 'Checklists', 'Reference Guides', 'Forms', 'Videos'];
  const fileTypes: (FileType | 'All')[] = ['All', 'PDF', 'Excel', 'Word', 'Video', 'ZIP'];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 sm:p-8"
        >
          <div className="absolute top-4 right-4 opacity-5">
            <FolderOpen className="h-32 w-32" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Resource Library</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Downloadable templates, checklists, guides, and videos to support your dispatch education. All resources are free for enrolled students.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground"><strong className="text-foreground">{resources.length}</strong> Resources</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground"><strong className="text-foreground">4.7</strong> Average Rating</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground"><strong className="text-foreground">{formatNumber(resources.reduce((acc, r) => acc + r.downloadCount, 0))}</strong> Downloads</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Popular & Recent Quick Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Popular Resources */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Popular Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {popularResources.map((res, idx) => {
                    const catConfig = categoryConfig[res.category];
                    const ftConfig = fileTypeConfig[res.fileType];
                    return (
                      <div
                        key={res.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab('all');
                          setSearchQuery(res.title.split(' ').slice(0, 2).join(' '));
                        }}
                      >
                        <span className="text-xs font-bold text-muted-foreground w-4 text-center">{idx + 1}</span>
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', ftConfig.color)}>
                          <ftConfig.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{res.title}</p>
                          <p className="text-[10px] text-muted-foreground">{formatNumber(res.downloadCount)} downloads</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[9px] shrink-0', catConfig.color)}>
                          {res.fileType}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recently Added */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Recently Added
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recentResources.map((res) => {
                    const catConfig = categoryConfig[res.category];
                    const ftConfig = fileTypeConfig[res.fileType];
                    return (
                      <div
                        key={res.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab('all');
                          setSearchQuery(res.title.split(' ').slice(0, 2).join(' '));
                        }}
                      >
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', ftConfig.color)}>
                          <ftConfig.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{res.title}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(res.addedAt)}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[9px] shrink-0', catConfig.color)}>
                          {catConfig.emoji} {res.category}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Tab Buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all' as const, label: 'All Resources' },
              { key: 'popular' as const, label: '🔥 Popular' },
              { key: 'recent' as const, label: '🕐 New' },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedCategory('All');
                  setSelectedFileType('All');
                }}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Search + Filters Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources by title, description, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ResourceCategory | 'All')}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat === 'All' ? 'All Categories' : `${categoryConfig[cat as ResourceCategory]?.emoji || ''} ${cat}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedFileType} onValueChange={(v) => setSelectedFileType(v as FileType | 'All')}>
                <SelectTrigger className="w-[120px] h-9 text-xs">
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent>
                  {fileTypes.map((ft) => (
                    <SelectItem key={ft} value={ft} className="text-xs">
                      {ft === 'All' ? 'All Types' : ft}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular" className="text-xs">Most Popular</SelectItem>
                  <SelectItem value="rating" className="text-xs">Top Rated</SelectItem>
                  <SelectItem value="recent" className="text-xs">Most Recent</SelectItem>
                  <SelectItem value="downloads" className="text-xs">Most Downloads</SelectItem>
                  <SelectItem value="title" className="text-xs">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters indicator */}
          {(searchQuery || selectedCategory !== 'All' || selectedFileType !== 'All') && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Showing {filteredResources.length} of {resources.length} resources</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedFileType('All');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Resource Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredResources.map((resource) => {
            const catConfig = categoryConfig[resource.category];
            const ftConfig = fileTypeConfig[resource.fileType];
            const userRating = getResourceRating(resource.id);
            const isDownloaded = downloadedResourceIds.includes(resource.id);

            return (
              <motion.div key={resource.id} variants={cardVariants}>
                <Card className="h-full transition-all hover:shadow-md group">
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Top: Category + File Type */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className={cn('text-[10px]', catConfig.color)}>
                        {catConfig.emoji} {resource.category}
                      </Badge>
                      <Badge variant="secondary" className={cn('text-[10px] gap-1', ftConfig.color)}>
                        <ftConfig.icon className="h-2.5 w-2.5" />
                        {resource.fileType}
                      </Badge>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {resource.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                          +{resource.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating
                        rating={userRating || resource.rating}
                        onRate={(r) => rateResource(resource.id, r)}
                        size="sm"
                        interactive
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {userRating ? `Your rating` : `${resource.rating} (${resource.ratingCount})`}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {formatNumber(resource.downloadCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(resource.addedAt)}
                      </span>
                      <span>{resource.fileSize}</span>
                    </div>

                    {/* Download Button */}
                    <Button
                      size="sm"
                      className={cn(
                        'w-full gap-1.5',
                        isDownloaded
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-600'
                          : ''
                      )}
                      variant={isDownloaded ? 'outline' : 'default'}
                      onClick={() => handleDownload(resource)}
                    >
                      {isDownloaded ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          View Again
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          Download {resource.fileType}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredResources.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No resources found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedFileType('All');
                setActiveTab('all');
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
