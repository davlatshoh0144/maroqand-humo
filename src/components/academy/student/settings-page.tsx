'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Settings,
  User,
  BookOpen,
  Bell,
  Palette,
  Shield,
  AlertTriangle,
  Save,
  Clock,
  Target,
  Sun,
  Moon,
  Monitor,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppStore } from '@/lib/store/app-store';
import { toast } from 'sonner';
import type { UserPreferences } from '@/lib/types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
];

export function SettingsPage() {
  const { user, userPreferences, updateUserPreferences } = useAppStore();
  const [prefs, setPrefs] = useState<UserPreferences>({ ...userPreferences });
  const [hasChanges, setHasChanges] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updatePref = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateUserPreferences(prefs);
    setHasChanges(false);
    toast.success('Settings saved successfully');
  };

  const handleResetProgress = () => {
    setResetDialogOpen(false);
    toast.success('Progress reset request recorded');
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false);
    toast.success('Account deletion request recorded');
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your preferences and account settings
          </p>
        </div>
      </div>

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Settings */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="section-icon-hover h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Upload Area */}
              <div className="flex items-center gap-4">
                <div className="avatar-upload-area h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/10">
                  <User className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">Click or drag to upload</p>
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-xs gap-1.5">
                    <Palette className="h-3 w-3" /> Upload Photo
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={prefs.name || user?.name || ''}
                    onChange={(e) => updatePref('name', e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={prefs.bio}
                  onChange={(e) => updatePref('bio', e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={prefs.timezone}
                  onValueChange={(v) => updatePref('timezone', v)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Preferences */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="section-icon-hover h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Learning Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your learning experience
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Study Timer Duration (min)
                  </Label>
                  <Select
                    value={String(prefs.studyTimerDuration)}
                    onValueChange={(v) =>
                      updatePref('studyTimerDuration', Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    Daily Goal (hours)
                  </Label>
                  <Select
                    value={String(prefs.dailyGoalHours)}
                    onValueChange={(v) =>
                      updatePref('dailyGoalHours', Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="3">3 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="5">5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preferred Course Difficulty</Label>
                <Select
                  value={prefs.preferredDifficulty}
                  onValueChange={(v) =>
                    updatePref(
                      'preferredDifficulty',
                      v as UserPreferences['preferredDifficulty']
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] px-1">
                          Beginner
                        </Badge>
                        New to dispatching
                      </span>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] px-1">
                          Intermediate
                        </Badge>
                        Some experience
                      </span>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1">
                          Advanced
                        </Badge>
                        Experienced dispatcher
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Auto-play Next Lesson</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically start the next lesson when current one ends
                  </p>
                </div>
                <Switch
                  checked={prefs.autoPlayNextLesson}
                  onCheckedChange={(v) => updatePref('autoPlayNextLesson', v)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="section-icon-hover h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose what notifications you receive
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  checked={prefs.emailNotifications}
                  onCheckedChange={(v) =>
                    updatePref('emailNotifications', v)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Achievement Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when you earn new badges
                  </p>
                </div>
                <Switch
                  checked={prefs.achievementAlerts}
                  onCheckedChange={(v) =>
                    updatePref('achievementAlerts', v)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Course Update Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Know when courses get new content
                  </p>
                </div>
                <Switch
                  checked={prefs.courseUpdateAlerts}
                  onCheckedChange={(v) =>
                    updatePref('courseUpdateAlerts', v)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Discussion Reply Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone replies to your discussions
                  </p>
                </div>
                <Switch
                  checked={prefs.discussionReplyAlerts}
                  onCheckedChange={(v) =>
                    updatePref('discussionReplyAlerts', v)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="section-icon-hover h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Palette className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Appearance</CardTitle>
                  <CardDescription>
                    Customize how the platform looks for you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: 'light' as const,
                      icon: Sun,
                      label: 'Light',
                    },
                    {
                      value: 'dark' as const,
                      icon: Moon,
                      label: 'Dark',
                    },
                    {
                      value: 'system' as const,
                      icon: Monitor,
                      label: 'System',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                        prefs.theme === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => updatePref('theme', option.value)}
                      type="button"
                    >
                      <option.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select
                  value={prefs.fontSize}
                  onValueChange={(v) =>
                    updatePref('fontSize', v as UserPreferences['fontSize'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Sidebar Collapsed by Default</p>
                  <p className="text-xs text-muted-foreground">
                    Start with the sidebar collapsed on each visit
                  </p>
                </div>
                <Switch
                  checked={prefs.sidebarCollapsedDefault}
                  onCheckedChange={(v) =>
                    updatePref('sidebarCollapsedDefault', v)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="section-icon-hover h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Privacy</CardTitle>
                  <CardDescription>
                    Control your profile visibility and data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      prefs.profileVisibility === 'public'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updatePref('profileVisibility', 'public')}
                    type="button"
                  >
                    <Eye className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Public</p>
                      <p className="text-[11px] text-muted-foreground">
                        Visible to everyone
                      </p>
                    </div>
                  </button>
                  <button
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      prefs.profileVisibility === 'private'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updatePref('profileVisibility', 'private')}
                    type="button"
                  >
                    <EyeOff className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Private</p>
                      <p className="text-[11px] text-muted-foreground">
                        Only you can see
                      </p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Show on Leaderboard</p>
                  <p className="text-xs text-muted-foreground">
                    Display your name and progress on the public leaderboard
                  </p>
                </div>
                <Switch
                  checked={prefs.showOnLeaderboard}
                  onCheckedChange={(v) =>
                    updatePref('showOnLeaderboard', v)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={sectionVariants}>
          <Card className="border-destructive/30 danger-zone-pulse">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="section-icon-hover h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base text-destructive">
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions — proceed with caution
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium">Reset All Progress</p>
                  <p className="text-xs text-muted-foreground">
                    Clear all your learning progress, quiz attempts, and
                    achievements. This cannot be undone.
                  </p>
                </div>
                <AlertDialog
                  open={resetDialogOpen}
                  onOpenChange={setResetDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 shrink-0 gap-1.5"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Progress
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your learning progress,
                        quiz scores, achievements, and notes. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetProgress}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data. This
                    cannot be undone.
                  </p>
                </div>
                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="shrink-0 gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete Your Account?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account, all your
                        courses, progress, certificates, and any other data
                        associated with your account. This action is irreversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          variants={sectionVariants}
          className="sticky bottom-4 z-10"
        >
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border shadow-lg">
            <div>
              {hasChanges ? (
                <p className="text-sm text-amber-500 font-medium">
                  You have unsaved changes
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All changes saved
                </p>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
