'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  PenTool,
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
  FileText,
  Calendar,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppStore } from '@/lib/store/app-store';
import { toast } from 'sonner';
import type { CourseNote } from '@/lib/types';

type SortOption = 'recent' | 'course' | 'lesson';

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function renderMarkdownText(text: string) {
  // Simple markdown-like rendering: bold, italic, lists
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // List items
    if (line.startsWith('- ')) {
      return (
        <li key={i} className="ml-4 list-disc text-sm text-foreground/80">
          {renderInlineFormatting(line.slice(2))}
        </li>
      );
    }
    // Numbered list items
    const numMatch = line.match(/^(\d+)\.\s/);
    if (numMatch) {
      return (
        <li key={i} className="ml-4 list-decimal text-sm text-foreground/80">
          {renderInlineFormatting(line.slice(numMatch[0].length))}
        </li>
      );
    }
    // Empty line
    if (line.trim() === '') {
      return <div key={i} className="h-2" />;
    }
    // Regular text
    return (
      <p key={i} className="text-sm text-foreground/80">
        {renderInlineFormatting(line)}
      </p>
    );
  });
}

function renderInlineFormatting(text: string) {
  // Process bold and italic
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);

    let firstMatch:
      | { type: 'bold' | 'italic'; text: string; index: number; length: number }
      | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = {
        type: 'bold',
        text: boldMatch[1],
        index: boldMatch.index,
        length: boldMatch[0].length,
      };
    }

    if (
      italicMatch &&
      italicMatch.index !== undefined &&
      (!firstMatch || italicMatch.index < firstMatch.index)
    ) {
      // Make sure it's not part of a bold match
      if (!boldMatch || italicMatch.index !== boldMatch.index) {
        firstMatch = {
          type: 'italic',
          text: italicMatch[1],
          index: italicMatch.index,
          length: italicMatch[0].length,
        };
      }
    }

    if (firstMatch) {
      // Add text before match
      if (firstMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, firstMatch.index)}</span>);
      }
      // Add formatted text
      if (firstMatch.type === 'bold') {
        parts.push(
          <strong key={key++} className="font-semibold text-foreground">
            {firstMatch.text}
          </strong>
        );
      } else {
        parts.push(
          <em key={key++} className="italic text-foreground/90">
            {firstMatch.text}
          </em>
        );
      }
      remaining = remaining.slice(firstMatch.index + firstMatch.length);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return parts;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export function CourseNotes() {
  const { courseNotes, addCourseNote, updateCourseNote, deleteCourseNote, navigate } =
    useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCourseId, setNewNoteCourseId] = useState('');
  const [newNoteLessonTitle, setNewNoteLessonTitle] = useState('');

  // Group notes by course
  const courses = useMemo(() => {
    const map: Record<
      string,
      { courseName: string; notes: (typeof courseNotes)[0][] }
    > = {};
    courseNotes.forEach((note) => {
      if (!map[note.courseId]) {
        map[note.courseId] = { courseName: note.courseName, notes: [] };
      }
      map[note.courseId].notes.push(note);
    });
    return map;
  }, [courseNotes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let notes = [...courseNotes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.content.toLowerCase().includes(q) ||
          n.lessonTitle.toLowerCase().includes(q) ||
          n.courseName.toLowerCase().includes(q)
      );
    }

    switch (sortOption) {
      case 'recent':
        notes.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'course':
        notes.sort((a, b) => a.courseName.localeCompare(b.courseName));
        break;
      case 'lesson':
        notes.sort((a, b) => a.lessonTitle.localeCompare(b.lessonTitle));
        break;
    }

    return notes;
  }, [courseNotes, searchQuery, sortOption]);

  // Stats
  const totalNotes = courseNotes.length;
  const notesThisWeek = courseNotes.filter((n) => {
    const weekAgo = Date.now() - 7 * 86400000;
    return new Date(n.createdAt).getTime() > weekAgo;
  }).length;
  const coursesWithNotes = Object.keys(courses).length;

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const handleEditNote = (noteId: string) => {
    const note = courseNotes.find((n) => n.id === noteId);
    if (note) {
      setSelectedNote(noteId);
      setEditContent(note.content);
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedNote && editContent.trim()) {
      updateCourseNote(selectedNote, editContent.trim());
      toast.success('Note updated successfully');
      setEditDialogOpen(false);
      setSelectedNote(null);
      setEditContent('');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setSelectedNote(noteId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNote) {
      deleteCourseNote(selectedNote);
      toast.success('Note deleted');
      setDeleteDialogOpen(false);
      setSelectedNote(null);
    }
  };

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) return;
    const courseList = Object.entries(courses);
    const courseId = newNoteCourseId || (courseList[0]?.[0] ?? 'course-1');
    const courseName =
      courseList.find(([id]) => id === courseId)?.[1].courseName ??
      'Dispatch Fundamentals';

    addCourseNote({
      courseId,
      courseName,
      lessonId: `lesson-${Date.now()}`,
      lessonTitle: newNoteLessonTitle.trim() || 'General Note',
      content: newNoteContent.trim(),
    });

    toast.success('Note added successfully');
    setIsCreating(false);
    setNewNoteContent('');
    setNewNoteCourseId('');
    setNewNoteLessonTitle('');
  };

  // Empty state
  if (courseNotes.length === 0 && !searchQuery) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <PenTool className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Study Notes</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Take notes while learning to reinforce key concepts and build your
            personal reference guide for dispatching.
          </p>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Note
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <PenTool className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Study Notes</h1>
            <p className="text-sm text-muted-foreground">
              Your personal study journal across all courses
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalNotes}</p>
              <p className="text-xs text-muted-foreground">Total Notes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notesThisWeek}</p>
              <p className="text-xs text-muted-foreground">Notes This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{coursesWithNotes}</p>
              <p className="text-xs text-muted-foreground">Courses with Notes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by content, lesson, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={sortOption}
          onValueChange={(v) => setSortOption(v as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="course">By Course</SelectItem>
            <SelectItem value="lesson">By Lesson</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes grouped by course (when sorting by course) */}
      {sortOption === 'course' && !searchQuery ? (
        <div className="space-y-4">
          {Object.entries(courses)
            .sort(([, a], [, b]) => a.courseName.localeCompare(b.courseName))
            .map(([courseId, { courseName, notes }]) => {
              const isExpanded = expandedCourses[courseId] !== false;
              return (
                <Collapsible
                  key={courseId}
                  open={isExpanded}
                  onOpenChange={() => toggleCourse(courseId)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <BookOpen className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base">
                              {courseName}
                            </CardTitle>
                          </div>
                          <Badge variant="secondary">{notes.length}</Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4 px-4">
                        <motion.div
                          className="space-y-3"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <AnimatePresence mode="popLayout">
                            {notes.map((note) => (
                              <NoteCard
                                key={note.id}
                                note={note}
                                onEdit={handleEditNote}
                                onDelete={handleDeleteNote}
                                onGoToLesson={() =>
                                  navigate(
                                    'lesson',
                                    note.courseId,
                                    note.lessonId
                                  )
                                }
                              />
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
        </div>
      ) : (
        /* Flat list for recent/lesson sorting or search */
        <ScrollArea className="max-h-[calc(100vh-320px)]">
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No notes found matching &quot;{searchQuery}&quot;
                  </p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onGoToLesson={() =>
                      navigate('lesson', note.courseId, note.lessonId)
                    }
                  />
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </ScrollArea>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update your study note content below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder="Write your note... (supports **bold**, *italic*, and - lists)"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Note Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Note</DialogTitle>
            <DialogDescription>
              Add a new study note to your journal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Course</label>
              <Select
                value={newNoteCourseId}
                onValueChange={setNewNoteCourseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(courses).map(([id, { courseName }]) => (
                    <SelectItem key={id} value={id}>
                      {courseName}
                    </SelectItem>
                  ))}
                  <SelectItem value="course-1">Dispatch Fundamentals</SelectItem>
                  <SelectItem value="course-2">HOS / ELD Basics</SelectItem>
                  <SelectItem value="course-3">Load Board Mastery</SelectItem>
                  <SelectItem value="course-4">Broker Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Lesson Title
              </label>
              <Input
                placeholder="e.g., Introduction to Dispatching"
                value={newNoteLessonTitle}
                onChange={(e) => setNewNoteLessonTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Note Content
              </label>
              <Textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={8}
                className="font-mono text-sm"
                placeholder="Write your note... (supports **bold**, *italic*, and - lists)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateNote}
              disabled={!newNoteContent.trim()}
            >
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onGoToLesson,
}: {
  note: CourseNote;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onGoToLesson: () => void;
}) {
  return (
    <motion.div layout variants={cardVariants} exit="exit">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs gap-1">
                <BookOpen className="h-3 w-3" />
                {note.courseName}
              </Badge>
              <Badge variant="secondary" className="text-xs gap-1">
                <Hash className="h-3 w-3" />
                {note.lessonTitle}
              </Badge>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(note.id)}
                aria-label="Edit note"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(note.id)}
                aria-label="Delete note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Note Content */}
          <div className="mb-3">{renderMarkdownText(note.content)}</div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatRelativeTime(note.updatedAt)}
                {note.updatedAt !== note.createdAt && ' (edited)'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-primary hover:text-primary"
              onClick={onGoToLesson}
            >
              Go to Lesson
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
