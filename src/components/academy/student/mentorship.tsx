'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Star,
  Clock,
  MessageSquare,
  Calendar,
  ChevronRight,
  X,
  Search,
  Users,
  Award,
  CheckCircle2,
  Video,
  Phone,
  Mail,
  MapPin,
  Zap,
  Heart,
  ThumbsUp,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  menteeCount: number;
  availability: 'available' | 'limited' | 'full';
  bio: string;
  experience: string;
  strengths: string[];
  timeSlots: string[];
  isOnline: boolean;
}

interface MentorReview {
  id: string;
  mentorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

const mentors: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Alisher Karimov',
    avatar: 'AK',
    title: 'Senior Dispatch Instructor',
    specialization: 'Load Board Strategy & Rate Negotiation',
    rating: 4.9,
    reviewCount: 47,
    menteeCount: 12,
    availability: 'available',
    bio: '15+ years in trucking dispatch. Former dispatch manager at a top-50 carrier. Specializes in teaching students how to maximize RPM through strategic load board searching and broker negotiation.',
    experience: '15 years dispatch experience',
    strengths: ['Rate Negotiation', 'Load Board Strategy', 'Broker Relations', 'RPM Optimization'],
    timeSlots: ['Mon 9:00 AM', 'Mon 2:00 PM', 'Wed 10:00 AM', 'Wed 3:00 PM', 'Fri 9:00 AM'],
    isOnline: true,
  },
  {
    id: 'mentor-2',
    name: 'Sarah Mitchell',
    avatar: 'SM',
    title: 'HOS Compliance Specialist',
    specialization: 'HOS Regulations & ELD Compliance',
    rating: 4.8,
    reviewCount: 38,
    menteeCount: 8,
    availability: 'available',
    bio: 'Former DOT inspector with 10 years of experience. Helps dispatchers understand HOS rules inside and out, avoid violations, and maintain perfect compliance records.',
    experience: '10 years DOT + 5 years consulting',
    strengths: ['HOS Regulations', 'ELD Compliance', 'DOT Inspections', 'Safety Protocols'],
    timeSlots: ['Tue 10:00 AM', 'Tue 2:00 PM', 'Thu 11:00 AM', 'Thu 4:00 PM'],
    isOnline: true,
  },
  {
    id: 'mentor-3',
    name: 'Dmitri Volkov',
    avatar: 'DV',
    title: 'Fleet Operations Manager',
    specialization: 'Fleet Management & Driver Coordination',
    rating: 4.7,
    reviewCount: 29,
    menteeCount: 6,
    availability: 'limited',
    bio: 'Manages a fleet of 45 trucks across the Midwest. Expert in driver scheduling, vehicle maintenance planning, and maximizing fleet utilization. Teaches practical fleet operations skills.',
    experience: '12 years fleet management',
    strengths: ['Fleet Scheduling', 'Driver Management', 'Maintenance Planning', 'Route Optimization'],
    timeSlots: ['Wed 9:00 AM', 'Fri 2:00 PM'],
    isOnline: false,
  },
  {
    id: 'mentor-4',
    name: 'Maria Santos',
    avatar: 'MS',
    title: 'Broker Relations Coach',
    specialization: 'Broker Communication & Client Building',
    rating: 4.9,
    reviewCount: 52,
    menteeCount: 15,
    availability: 'available',
    bio: 'Former top-producing freight broker turned mentor. Has built carrier networks from scratch and teaches dispatchers how to build lasting broker relationships that generate repeat business.',
    experience: '8 years brokerage + 4 years coaching',
    strengths: ['Broker Communication', 'Client Relations', 'Email Etiquette', 'Deal Closing'],
    timeSlots: ['Mon 11:00 AM', 'Tue 9:00 AM', 'Wed 1:00 PM', 'Thu 10:00 AM', 'Fri 11:00 AM'],
    isOnline: true,
  },
  {
    id: 'mentor-5',
    name: 'James O\'Brien',
    avatar: 'JO',
    title: 'Owner-Operator Advisor',
    specialization: 'Business Planning & Financial Management',
    rating: 4.6,
    reviewCount: 21,
    menteeCount: 4,
    availability: 'limited',
    bio: 'Owner-operator for 20 years before transitioning to consulting. Helps new dispatchers and owner-operators understand the financial side of trucking — from factoring to tax planning.',
    experience: '20 years owner-operator + 3 years consulting',
    strengths: ['Business Planning', 'Cost Analysis', 'Factoring', 'Tax Strategies'],
    timeSlots: ['Thu 2:00 PM', 'Fri 10:00 AM'],
    isOnline: false,
  },
  {
    id: 'mentor-6',
    name: 'Nina Patel',
    avatar: 'NP',
    title: 'Advanced Dispatch Trainer',
    specialization: 'Multi-Truck Dispatch & Scaling Operations',
    rating: 4.8,
    reviewCount: 34,
    menteeCount: 9,
    availability: 'available',
    bio: 'Dispatches 8 trucks simultaneously and teaches advanced multi-truck dispatch techniques. Expert in TMS systems, load planning across multiple time zones, and emergency problem resolution.',
    experience: '7 years multi-truck dispatch',
    strengths: ['Multi-Truck Dispatch', 'TMS Systems', 'Load Planning', 'Crisis Management'],
    timeSlots: ['Mon 10:00 AM', 'Tue 3:00 PM', 'Wed 9:00 AM', 'Thu 1:00 PM', 'Fri 3:00 PM'],
    isOnline: true,
  },
];

const mentorReviews: MentorReview[] = [
  { id: 'mr-1', mentorId: 'mentor-1', authorName: 'Alex K.', authorAvatar: 'AK', rating: 5, comment: 'Alisher taught me how to negotiate rates like a pro. My RPM increased by 30% after just 3 sessions!', date: '2 days ago' },
  { id: 'mr-2', mentorId: 'mentor-1', authorName: 'David L.', authorAvatar: 'DL', rating: 5, comment: 'Incredible mentor. Patient, knowledgeable, and always available when I need help.', date: '1 week ago' },
  { id: 'mr-3', mentorId: 'mentor-2', authorName: 'Tom R.', authorAvatar: 'TR', rating: 5, comment: 'Sarah\'s DOT experience is invaluable. She helped me understand HOS rules I\'d been confused about for months.', date: '3 days ago' },
  { id: 'mr-4', mentorId: 'mentor-4', authorName: 'Rachel M.', authorAvatar: 'RM', rating: 5, comment: 'Maria transformed my broker communication skills. I went from generic emails to landing repeat contracts.', date: '5 days ago' },
  { id: 'mr-5', mentorId: 'mentor-4', authorName: 'Carlos G.', authorAvatar: 'CG', rating: 4, comment: 'Great sessions on deal closing. Highly recommend for anyone struggling with broker negotiations.', date: '2 weeks ago' },
  { id: 'mr-6', mentorId: 'mentor-6', authorName: 'Emma W.', authorAvatar: 'EW', rating: 5, comment: 'Nina helped me scale from 2 to 6 trucks in 6 months. Her TMS optimization tips alone were worth it.', date: '1 week ago' },
  { id: 'mr-7', mentorId: 'mentor-3', authorName: 'Mike S.', authorAvatar: 'MS', rating: 4, comment: 'Dmitri\'s fleet management insights are practical and actionable. Very experienced.', date: '3 weeks ago' },
  { id: 'mr-8', mentorId: 'mentor-5', authorName: 'Lisa P.', authorAvatar: 'LP', rating: 5, comment: 'James helped me understand factoring and cash flow management. Essential knowledge for any owner-operator.', date: '1 month ago' },
];

const availabilityConfig = {
  available: { label: 'Available', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  limited: { label: 'Limited Slots', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  full: { label: 'Full', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

export function Mentorship() {
  const { assignedMentorId, assignMentor, removeMentor } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'limited'>('all');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const assignedMentor = useMemo(() => {
    if (!assignedMentorId) return null;
    return mentors.find((m) => m.id === assignedMentorId) || null;
  }, [assignedMentorId]);

  const filteredMentors = useMemo(() => {
    let result = mentors;
    if (selectedAvailability !== 'all') {
      result = result.filter((m) => m.availability === selectedAvailability);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.specialization.toLowerCase().includes(q) ||
          m.strengths.some((s) => s.toLowerCase().includes(q))
      );
    }
    return result;
  }, [searchQuery, selectedAvailability]);

  const handleRequestMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setRequestMessage('');
    setRequestSent(false);
    setRequestDialogOpen(true);
  };

  const handleSendRequest = () => {
    if (!selectedMentor) return;
    assignMentor(selectedMentor.id);
    setRequestSent(true);
    setTimeout(() => {
      setRequestDialogOpen(false);
    }, 1500);
  };

  const handleScheduleSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSelectedSlot(null);
    setScheduleDialogOpen(true);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= Math.round(rating)
                ? 'text-amber-500 fill-amber-500'
                : 'text-muted-foreground/20'
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
            <GraduationCap className="h-32 w-32" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Mentorship Program</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Connect with experienced dispatch professionals for 1-on-1 guidance. Get personalized coaching to accelerate your trucking career.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground"><strong className="text-foreground">{mentors.length}</strong> Expert Mentors</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground"><strong className="text-foreground">4.8</strong> Average Rating</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground"><strong className="text-foreground">220+</strong> Sessions Completed</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* My Mentor Section */}
        {assignedMentor && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold text-primary">My Mentor</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {assignedMentor.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {assignedMentor.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-card" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{assignedMentor.name}</h3>
                      <p className="text-xs text-muted-foreground">{assignedMentor.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(assignedMentor.rating, 'sm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2 items-start">
                    <Button size="sm" className="gap-1.5" onClick={() => handleScheduleSession(assignedMentor)}>
                      <Calendar className="h-3.5 w-3.5" />
                      Schedule Session
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => removeMentor()}
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialization, or strength..."
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

          <div className="flex flex-wrap gap-2">
            {(['all', 'available', 'limited'] as const).map((avail) => (
              <Button
                key={avail}
                variant={selectedAvailability === avail ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedAvailability(avail)}
              >
                {avail === 'all' ? 'All Mentors' : avail === 'available' ? '🟢 Available' : '🟡 Limited'}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Mentor Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredMentors.map((mentor) => {
            const isAssigned = assignedMentorId === mentor.id;
            const availConfig = availabilityConfig[mentor.availability];
            const mentorReviewList = mentorReviews.filter((r) => r.mentorId === mentor.id);

            return (
              <motion.div key={mentor.id} variants={cardVariants}>
                <Card className={cn(
                  'h-full transition-all hover:shadow-md',
                  isAssigned && 'ring-1 ring-primary/30'
                )}>
                  <CardContent className="p-5">
                    {/* Mentor Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {mentor.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {mentor.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{mentor.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{mentor.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(mentor.rating, 'sm')}
                        </div>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div className="mb-3">
                      <Badge variant="outline" className="text-[10px] bg-primary/5">
                        <Zap className="h-2.5 w-2.5 mr-1" />
                        {mentor.specialization}
                      </Badge>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{mentor.bio}</p>

                    {/* Strengths */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mentor.strengths.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {s}
                        </Badge>
                      ))}
                      {mentor.strengths.length > 3 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          +{mentor.strengths.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {mentor.menteeCount} mentees
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {mentor.reviewCount} reviews
                      </span>
                    </div>

                    {/* Availability */}
                    <div className="mb-4">
                      <Badge variant="outline" className={cn('text-[10px]', availConfig.color)}>
                        {mentor.availability === 'available' && '🟢'}
                        {mentor.availability === 'limited' && '🟡'}
                        {mentor.availability === 'full' && '🔴'}
                        {availConfig.label}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isAssigned ? (
                        <>
                          <Button size="sm" className="flex-1 gap-1" onClick={() => handleScheduleSession(mentor)}>
                            <Calendar className="h-3.5 w-3.5" />
                            Schedule
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chat
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleRequestMentor(mentor)}
                          disabled={mentor.availability === 'full'}
                        >
                          <GraduationCap className="h-3.5 w-3.5" />
                          {mentor.availability === 'full' ? 'Full' : 'Request Mentor'}
                        </Button>
                      )}
                    </div>

                    {/* Reviews Preview */}
                    {mentorReviewList.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-[10px] font-medium text-muted-foreground mb-2">Recent Reviews</p>
                        {mentorReviewList.slice(0, 2).map((review) => (
                          <div key={review.id} className="mb-2 last:mb-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px] bg-muted">{review.authorAvatar}</AvatarFallback>
                              </Avatar>
                              <span className="text-[10px] font-medium">{review.authorName}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      'h-2 w-2',
                                      star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/20'
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-16">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No mentors found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedAvailability('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Mentor Reviews Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">What Mentees Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mentorReviews.slice(0, 6).map((review, idx) => {
              const mentor = mentors.find((m) => m.id === review.mentorId);
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-muted">{review.authorAvatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span className="text-xs font-medium">{review.authorName}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">{review.date}</span>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-3 w-3',
                                star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/20'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      {mentor && (
                        <p className="text-[10px] text-primary mt-2">
                          Mentor: {mentor.name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* How Mentorship Works */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              How Mentorship Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-semibold text-sm mb-1">Request a Mentor</h4>
                <p className="text-xs text-muted-foreground">Browse mentors and send a request with your goals and availability.</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-semibold text-sm mb-1">Schedule Sessions</h4>
                <p className="text-xs text-muted-foreground">Book 1-on-1 video calls or chat sessions at times that work for you.</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-semibold text-sm mb-1">Level Up</h4>
                <p className="text-xs text-muted-foreground">Get personalized guidance and feedback to advance your dispatch career.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Mentor Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {requestSent ? 'Request Sent!' : `Request ${selectedMentor?.name}`}
            </DialogTitle>
            <DialogDescription>
              {requestSent
                ? 'Your mentor will review your request and get back to you soon.'
                : `Tell ${selectedMentor?.name} why you'd like to be their mentee and what you hope to learn.`}
            </DialogDescription>
          </DialogHeader>
          {!requestSent ? (
            <>
              {selectedMentor && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {selectedMentor.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{selectedMentor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedMentor.specialization}</p>
                  </div>
                </div>
              )}
              <Textarea
                placeholder="I'd like to learn about... My goals are... I'm available for sessions on..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendRequest} disabled={!requestMessage.trim()}>
                  Send Request
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-col items-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </motion.div>
              <p className="mt-3 font-medium">You&apos;re now connected with {selectedMentor?.name}!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Session Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule a Session
            </DialogTitle>
            <DialogDescription>
              Pick an available time slot with {selectedMentor?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Sessions are 45 minutes • Video call or phone</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Time Slots</p>
                <div className="grid grid-cols-1 gap-2">
                  {selectedMentor.timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'justify-start gap-2',
                        selectedSlot === slot && 'ring-2 ring-primary/30'
                      )}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 gap-1.5">
                  <Video className="h-3.5 w-3.5" />
                  Video Call
                </Button>
                <Button variant="outline" className="flex-1 gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Phone Call
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setScheduleDialogOpen(false)} disabled={!selectedSlot}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
