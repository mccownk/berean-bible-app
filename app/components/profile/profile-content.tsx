
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCustomTheme } from '@/components/theme-provider';
import { getPopularTranslations } from '@/lib/bible-api';
import { 
  User, 
  Settings, 
  Bell, 
  Palette, 
  Type, 
  Clock,
  LogOut,
  Save,
  Loader2,
  BookOpen
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
    preferences: {
      timezone: string | null;
      preferredReadingTime: number | null;
      preferredTimeOfDay: string | null;
      preferredStartTime: string | null;
      notificationsEnabled: boolean;
      theme: string | null;
      fontSize: string | null;
      preferredTranslation: string | null;
    };
  };
}

interface ProfileContentProps {
  data: ProfileData;
}

export function ProfileContent({ data }: ProfileContentProps) {
  const { update } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const { theme, setTheme: setAppTheme, mounted } = useCustomTheme();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(data.user.name || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(data.user.preferences.notificationsEnabled);
  const [currentTheme, setCurrentTheme] = useState(data.user.preferences.theme || 'light');
  const [fontSize, setFontSize] = useState(data.user.preferences.fontSize || 'medium');
  const [preferredReadingTime, setPreferredReadingTime] = useState(
    data.user.preferences.preferredReadingTime || 15
  );
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState(
    data.user.preferences.preferredTimeOfDay || 'Morning'
  );
  const [preferredStartTime, setPreferredStartTime] = useState(
    data.user.preferences.preferredStartTime || '09:00'
  );
  const [preferredTranslation, setPreferredTranslation] = useState(
    data.user.preferences.preferredTranslation || 'bba9f40183526463-01'
  );

  // Get available translations
  const availableTranslations = getPopularTranslations();

  // Apply user's saved theme when component mounts
  useEffect(() => {
    if (mounted && data.user.preferences.theme) {
      const savedTheme = data.user.preferences.theme;
      setAppTheme(savedTheme);
      setCurrentTheme(savedTheme);
    }
  }, [mounted, setAppTheme]);

  // Sync current theme state with actual theme
  useEffect(() => {
    if (mounted) {
      setCurrentTheme(theme);
    }
  }, [theme, mounted]);

  // Handle theme change immediately
  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
    setAppTheme(newTheme);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          notificationsEnabled,
          theme: currentTheme,
          fontSize,
          preferredReadingTime,
          preferredTimeOfDay,
          preferredStartTime,
          preferredTranslation
        }),
      });

      if (response.ok) {
        await update({ name });
        toast({
          title: "Profile updated",
          description: "Your preferences have been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/profile/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `berean-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Data exported",
          description: "Your reading data has been downloaded.",
        });
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account and reading preferences
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={data.user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm text-muted-foreground">
                {formatDate(data.user.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reading Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Reading Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Preferred Reading Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={preferredReadingTime}
                  onChange={(e) => setPreferredReadingTime(Number(e.target.value))}
                  min="5"
                  max="60"
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">minutes per day</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Time of Day Preference</Label>
              <Select value={preferredTimeOfDay} onValueChange={setPreferredTimeOfDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Afternoon">Afternoon</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Start Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={preferredStartTime}
                  onChange={(e) => setPreferredStartTime(e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  for your daily reading
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={currentTheme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="sepia">Sepia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Bible Translation
              </Label>
              <Select value={preferredTranslation} onValueChange={setPreferredTranslation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Bible translation" />
                </SelectTrigger>
                <SelectContent>
                  {availableTranslations.map((translation) => (
                    <SelectItem key={translation.id} value={translation.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{translation.abbreviation}</span>
                        <span className="text-xs text-muted-foreground">
                          {translation.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose your preferred Bible translation for reading
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Reading Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when it's time for your daily reading
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download your reading progress and notes
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSaveProfile} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </AppLayout>
  );
}
