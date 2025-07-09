
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  Flame, 
  Trophy, 
  Clock, 
  Target,
  ArrowRight,
  Award
} from 'lucide-react';
import { formatDate, formatTimeAgo, formatReadingTime, getCurrentPhase } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

interface DashboardData {
  plan: {
    id: string;
    name: string;
    description: string | null;
    totalDays: number;
  };
  progress: {
    completedDays: number;
    totalDays: number;
    progressPercentage: number;
    currentDay: number;
    currentReading: {
      id: string;
      day: number;
      passages: string[];
      estimatedMinutes: number | null;
    } | null;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastReadingDate: Date | null;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string | null;
    category: string;
    earnedAt: Date;
  }>;
  recentReadings: Array<{
    id: string;
    day: number;
    passages: string[];
    completedAt: Date | null;
    readingTimeSeconds: number | null;
  }>;
}

interface DashboardContentProps {
  data: DashboardData;
}

export function DashboardContent({ data }: DashboardContentProps) {
  const router = useRouter();

  const handleContinueReading = () => {
    if (data.progress.currentReading) {
      router.push(`/read/${data.progress.currentDay}`);
    }
  };

  const currentPhase = getCurrentPhase(data.progress.currentDay);

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif">Dashboard</h1>
            <p className="text-muted-foreground">
              Your daily Scripture examination journey
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Current Phase</div>
            <div className="font-semibold">{currentPhase}</div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.progress.completedDays}/{data.progress.totalDays}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {data.progress.progressPercentage}% complete
              </div>
              <Progress value={data.progress.progressPercentage} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.streak.currentStreak}</div>
              <div className="text-xs text-muted-foreground">
                {data.streak.currentStreak === 1 ? 'day' : 'days'} in a row
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Longest: {data.streak.longestStreak} days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.achievements.length}</div>
              <div className="text-xs text-muted-foreground">
                {data.achievements.length === 1 ? 'achievement' : 'achievements'} earned
              </div>
              {data.achievements.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Latest: {data.achievements[0].name}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Reading */}
        {data.progress.currentReading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Today's Reading - Day {data.progress.currentDay}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {data.progress.currentReading.passages.join(', ')}
                  </h3>
                  {data.progress.currentReading.estimatedMinutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatReadingTime(data.progress.currentReading.estimatedMinutes)}
                    </div>
                  )}
                </div>
                <Button onClick={handleContinueReading} className="w-full sm:w-auto">
                  Continue Reading
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Readings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Readings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentReadings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No readings completed yet</p>
                    <p className="text-sm">Start your journey today!</p>
                  </div>
                ) : (
                  data.recentReadings.map((reading, index) => (
                    <div key={reading.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Day {reading.day}</div>
                        <div className="text-sm text-muted-foreground">
                          {reading.passages.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {reading.completedAt && formatTimeAgo(reading.completedAt)}
                        </div>
                        {reading.readingTimeSeconds && (
                          <div className="text-xs text-muted-foreground">
                            {formatReadingTime(Math.round(reading.readingTimeSeconds / 60))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.achievements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements yet</p>
                    <p className="text-sm">Complete your first reading!</p>
                  </div>
                ) : (
                  data.achievements.slice(0, 5).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {achievement.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {achievement.category}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(achievement.earnedAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
