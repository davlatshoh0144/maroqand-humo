'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Circle,
  Clock,
  MessageSquare,
  FileText,
  Plus,
  ArrowLeft,
  CalendarDays,
  BookOpen,
  Video,
  Share2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudyGroup {
  id: string;
  name: string;
  topic: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  nextSession: string;
  nextSessionDate: string;
  members: { name: string; initials: string; color: string }[];
  recentChat: { author: string; message: string; time: string }[];
  resources: { title: string; type: 'document' | 'video' | 'link' }[];
  createdBy: string;
}

// ─── Study Group Data ────────────────────────────────────────────────────────

const studyGroups: StudyGroup[] = [
  {
    id: 'sg-1',
    name: 'HOS Masters',
    topic: 'Hours of Service Regulations',
    description: 'Deep dive into HOS rules, exemptions, and real-world scenarios. We review ELD logs and discuss tricky compliance situations together.',
    memberCount: 8,
    maxMembers: 12,
    isActive: true,
    nextSession: 'Tonight at 7:00 PM EST',
    nextSessionDate: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    members: [
      { name: 'Alisher K.', initials: 'AK', color: 'bg-emerald-500/20 text-emerald-600' },
      { name: 'Sarah M.', initials: 'SM', color: 'bg-amber-500/20 text-amber-600' },
      { name: 'David R.', initials: 'DR', color: 'bg-sky-500/20 text-sky-600' },
      { name: 'Maria L.', initials: 'ML', color: 'bg-purple-500/20 text-purple-600' },
    ],
    recentChat: [
      { author: 'Alisher K.', message: 'Can someone explain the 7/3 split?', time: '2m ago' },
      { author: 'Sarah M.', message: 'Sure! 7 hours in sleeper + 3 off duty = 10hr rest', time: '1m ago' },
      { author: 'David R.', message: 'Does the 3-hour part pause the 14-hour clock?', time: 'Just now' },
    ],
    resources: [
      { title: 'HOS Quick Reference Card', type: 'document' },
      { title: 'FMCSA HOS Guide Video', type: 'video' },
    ],
    createdBy: 'Alisher K.',
  },
  {
    id: 'sg-2',
    name: 'Rate Negotiators',
    topic: 'Broker Rate Negotiation',
    description: 'Practice broker negotiations and learn strategies to maximize RPM. We role-play scenarios and review real rate con examples.',
    memberCount: 6,
    maxMembers: 10,
    isActive: true,
    nextSession: 'Tomorrow at 6:00 PM EST',
    nextSessionDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    members: [
      { name: 'Jake T.', initials: 'JT', color: 'bg-red-500/20 text-red-600' },
      { name: 'Nina P.', initials: 'NP', color: 'bg-emerald-500/20 text-emerald-600' },
      { name: 'Carlos H.', initials: 'CH', color: 'bg-amber-500/20 text-amber-600' },
    ],
    recentChat: [
      { author: 'Jake T.', message: 'Just got a $2.80 RPM offer on CHI-ATL. Thoughts?', time: '15m ago' },
      { author: 'Nina P.', message: 'That\'s decent for dry van. I\'d push for $3.00', time: '10m ago' },
    ],
    resources: [
      { title: 'Rate Negotiation Scripts', type: 'document' },
      { title: 'Market Rate Analysis Tool', type: 'link' },
    ],
    createdBy: 'Jake T.',
  },
  {
    id: 'sg-3',
    name: 'New Dispatcher Support',
    topic: 'Getting Started in Dispatch',
    description: 'A beginner-friendly group for those just starting their dispatch career. Ask questions, share tips, and learn the ropes together.',
    memberCount: 11,
    maxMembers: 15,
    isActive: false,
    nextSession: 'Wednesday at 5:00 PM EST',
    nextSessionDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    members: [
      { name: 'Emily S.', initials: 'ES', color: 'bg-teal-500/20 text-teal-600' },
      { name: 'Tom B.', initials: 'TB', color: 'bg-purple-500/20 text-purple-600' },
      { name: 'Rosa G.', initials: 'RG', color: 'bg-amber-500/20 text-amber-600' },
      { name: 'Mike W.', initials: 'MW', color: 'bg-sky-500/20 text-sky-600' },
    ],
    recentChat: [
      { author: 'Emily S.', message: 'What TMS should I learn first?', time: '1h ago' },
      { author: 'Tom B.', message: 'McLeod is most common. Start there!', time: '45m ago' },
    ],
    resources: [
      { title: 'Dispatcher Day 1 Checklist', type: 'document' },
    ],
    createdBy: 'Emily S.',
  },
  {
    id: 'sg-4',
    name: 'Load Board Pros',
    topic: 'Load Board Strategy & Scam Avoidance',
    description: 'Learn to identify good loads, spot red flags, and avoid double-brokering scams. We analyze real load board posts weekly.',
    memberCount: 7,
    maxMembers: 10,
    isActive: true,
    nextSession: 'Thursday at 8:00 PM EST',
    nextSessionDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    members: [
      { name: 'Ryan K.', initials: 'RK', color: 'bg-emerald-500/20 text-emerald-600' },
      { name: 'Anna F.', initials: 'AF', color: 'bg-red-500/20 text-red-600' },
    ],
    recentChat: [
      { author: 'Ryan K.', message: 'Found a load with "call for rate" — definitely a red flag', time: '5m ago' },
      { author: 'Anna F.', message: 'Yeah, those are almost always lowball offers', time: '2m ago' },
    ],
    resources: [
      { title: 'Scam Identification Guide', type: 'document' },
      { title: 'Broker Credit Score Tutorial', type: 'video' },
    ],
    createdBy: 'Ryan K.',
  },
  {
    id: 'sg-5',
    name: 'DOT Compliance Study Hall',
    topic: 'DOT Audits & Compliance',
    description: 'Prepare for DOT audits, review compliance requirements, and discuss CSA scores. Essential for safety-conscious dispatchers.',
    memberCount: 5,
    maxMembers: 8,
    isActive: false,
    nextSession: 'Friday at 4:00 PM EST',
    nextSessionDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    members: [
      { name: 'Lisa M.', initials: 'LM', color: 'bg-amber-500/20 text-amber-600' },
      { name: 'Ken D.', initials: 'KD', color: 'bg-emerald-500/20 text-emerald-600' },
    ],
    recentChat: [
      { author: 'Lisa M.', message: 'Anyone have a DOT audit checklist they can share?', time: '3h ago' },
    ],
    resources: [
      { title: 'DOT Audit Prep Checklist', type: 'document' },
      { title: 'CSA Score Improvement Plan', type: 'document' },
    ],
    createdBy: 'Lisa M.',
  },
  {
    id: 'sg-6',
    name: 'Night Owls Dispatch',
    topic: 'Night Shift Operations',
    description: 'Support group for night dispatchers. Share tips for staying alert, handling overnight issues, and maintaining work-life balance.',
    memberCount: 4,
    maxMembers: 8,
    isActive: false,
    nextSession: 'Saturday at 11:00 PM EST',
    nextSessionDate: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    members: [
      { name: 'Chris P.', initials: 'CP', color: 'bg-purple-500/20 text-purple-600' },
      { name: 'Dana W.', initials: 'DW', color: 'bg-sky-500/20 text-sky-600' },
    ],
    recentChat: [
      { author: 'Chris P.', message: '2 AM and driver calls with a flat tire in the middle of nowhere 😅', time: '6h ago' },
      { author: 'Dana W.', message: 'Been there! Always keep a list of 24/7 roadside services handy', time: '5h ago' },
    ],
    resources: [
      { title: '24/7 Roadside Services Directory', type: 'link' },
    ],
    createdBy: 'Chris P.',
  },
];

const topicOptions = [
  'Hours of Service Regulations',
  'Broker Rate Negotiation',
  'Getting Started in Dispatch',
  'Load Board Strategy',
  'DOT Compliance',
  'Freight Documentation',
  'Fleet Management',
  'Customer Relations',
  'Other',
];

// ─── Group Detail View ───────────────────────────────────────────────────────

function GroupDetailView({ group, onBack }: { group: StudyGroup; onBack: () => void }) {
  const { joinedGroupIds, toggleJoinedGroup } = useAppStore();
  const isJoined = joinedGroupIds.includes(group.id);

  const resourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-3.5 w-3.5 text-red-500" />;
      case 'link': return <Share2 className="h-3.5 w-3.5 text-sky-500" />;
      default: return <FileText className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to groups
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {group.isActive && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                <Circle className="h-2 w-2 fill-emerald-500" /> LIVE
              </Badge>
            )}
            <Badge variant="outline">{group.topic}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{group.description}</p>
        </div>
        <Button
          variant={isJoined ? 'outline' : 'default'}
          size="sm"
          className={cn('gap-1 shrink-0', isJoined && 'text-red-500 hover:text-red-600 hover:bg-red-500/10')}
          onClick={() => {
            toggleJoinedGroup(group.id);
            toast.success(isJoined ? `Left "${group.name}"` : `Joined "${group.name}"!`);
          }}
        >
          {isJoined ? <X className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          {isJoined ? 'Leave Group' : 'Join Group'}
        </Button>
      </div>

      {/* Next Session + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Session</p>
              <p className="text-sm font-semibold">{group.nextSession}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-semibold">{group.memberCount} / {group.maxMembers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resources</p>
              <p className="text-sm font-semibold">{group.resources.length} shared</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Members */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Members</h3>
        <div className="flex flex-wrap gap-2">
          {group.members.map((member, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5">
              <Avatar className="h-6 w-6">
                <AvatarFallback className={cn('text-[10px] font-bold', member.color)}>{member.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground">{member.name}</span>
              {i === 0 && <Badge className="text-[8px] h-4 px-1 bg-primary/10 text-primary border-primary/20">Creator</Badge>}
            </div>
          ))}
          {group.memberCount > group.members.length && (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/50 px-3 py-1.5 text-sm text-muted-foreground">
              +{group.memberCount - group.members.length} more
            </div>
          )}
        </div>
      </div>

      {/* Recent Chat */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" /> Recent Chat
        </h3>
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            {group.recentChat.map((chat, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                  {chat.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{chat.author}</span>
                    <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-sm text-foreground/70">{chat.message}</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border/30">
              <div className="flex gap-2">
                <Input placeholder="Type a message..." className="text-sm" />
                <Button size="sm" onClick={() => toast.info('Group chat is managed from live cohort sessions.')}>Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shared Resources */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Shared Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {group.resources.map((resource, i) => (
            <Card key={i} className="border-border/50 hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                  {resourceIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{resource.title}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{resource.type}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function StudyGroups() {
  const { joinedGroupIds, toggleJoinedGroup } = useAppStore();
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showMyGroups, setShowMyGroups] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTopic, setNewGroupTopic] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const myGroups = studyGroups.filter((g) => joinedGroupIds.includes(g.id));
  const activeGroups = showMyGroups ? myGroups : studyGroups;

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !newGroupTopic) {
      toast.error('Please fill in the group name and topic');
      return;
    }
    toast.success(`Study group "${newGroupName}" created!`);
    setCreateDialogOpen(false);
    setNewGroupName('');
    setNewGroupTopic('');
    setNewGroupDesc('');
  };

  if (selectedGroup) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <GroupDetailView group={selectedGroup} onBack={() => setSelectedGroup(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-primary/5 border border-emerald-500/10 p-6 md:p-8"
      >
        <div className="absolute top-4 right-4 opacity-10">
          <Users className="h-24 w-24 text-emerald-500" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Live Study Groups</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            Join virtual study rooms, collaborate with peers, and learn together. Active groups are live right now!
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4 text-emerald-500" /> {studyGroups.length} groups
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500" /> {studyGroups.filter((g) => g.isActive).length} active now
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4 text-amber-500" /> {myGroups.length} joined
            </span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        <Button
          variant={showMyGroups ? 'default' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={() => setShowMyGroups(!showMyGroups)}
        >
          <Users className="h-3.5 w-3.5" />
          My Groups ({myGroups.length})
        </Button>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Create a Study Group
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Group Name</label>
                <Input
                  placeholder="e.g., Weekend Dispatch Warriors"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Topic</label>
                <Select value={newGroupTopic} onValueChange={setNewGroupTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    {topicOptions.map((topic) => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  placeholder="What will your group study?"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleCreateGroup}>
                <Plus className="h-4 w-4 mr-1" /> Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* My Groups Section (always visible if user has joined groups) */}
      {myGroups.length > 0 && !showMyGroups && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-500" /> My Groups
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group, i) => (
              <GroupCard key={group.id} group={group} index={i} onSelect={setSelectedGroup} />
            ))}
          </div>
          <Separator className="my-6" />
        </motion.div>
      )}

      {/* All Groups */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          {showMyGroups ? (
            <><Users className="h-4 w-4 text-emerald-500" /> My Groups</>
          ) : (
            <><Users className="h-4 w-4 text-primary" /> All Study Groups</>
          )}
        </h2>
        {activeGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/30 mb-4">
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No groups {showMyGroups ? 'joined' : 'available'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {showMyGroups ? 'Join a group to see it here' : 'Check back later for new groups'}
            </p>
            {showMyGroups && (
              <Button variant="outline" size="sm" onClick={() => setShowMyGroups(false)}>
                Browse all groups
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {activeGroups.map((group, i) => (
                <GroupCard key={group.id} group={group} index={i} onSelect={setSelectedGroup} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Group Card Sub-Component ────────────────────────────────────────────────

function GroupCard({ group, index, onSelect }: { group: StudyGroup; index: number; onSelect: (g: StudyGroup) => void }) {
  const { joinedGroupIds, toggleJoinedGroup } = useAppStore();
  const isJoined = joinedGroupIds.includes(group.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="group h-full hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/50 cursor-pointer" onClick={() => onSelect(group)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {group.isActive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Circle className="h-2 w-2 fill-emerald-500" /> LIVE
                  </span>
                )}
              </div>
              <CardTitle className="text-base font-bold">{group.name}</CardTitle>
              <Badge variant="outline" className="mt-1 text-[10px]">{group.topic}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 -mt-1 -mr-2"
              onClick={(e) => {
                e.stopPropagation();
                toggleJoinedGroup(group.id);
                toast.success(isJoined ? `Left "${group.name}"` : `Joined "${group.name}"!`);
              }}
            >
              {isJoined ? (
                <Users className="h-4 w-4 text-emerald-500" />
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">{group.description}</p>

          {/* Members row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1.5">
                {group.members.slice(0, 3).map((m, i) => (
                  <Avatar key={i} className="h-5 w-5 ring-1 ring-card">
                    <AvatarFallback className={cn('text-[7px] font-bold', m.color)}>{m.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground ml-1">
                {group.memberCount}/{group.maxMembers}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {group.nextSession.split(' at ')[0]}
            </span>
          </div>

          {/* Recent chat preview */}
          {group.recentChat.length > 0 && (
            <div className="rounded-lg bg-muted/30 p-2 space-y-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-2.5 w-2.5" /> Recent chat
              </p>
              {group.recentChat.slice(0, 2).map((chat, i) => (
                <p key={i} className="text-[10px] text-foreground/50 truncate">
                  <span className="font-medium text-foreground/60">{chat.author.split(' ')[0]}:</span> {chat.message}
                </p>
              ))}
            </div>
          )}

          {/* Resources count */}
          {group.resources.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <FileText className="h-3 w-3" /> {group.resources.length} resource{group.resources.length > 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
