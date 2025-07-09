
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Trophy, 
  Flame, 
  Calendar,
  Clock,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import { formatTimeAgo, formatReadingTime } from '@/lib/utils';
import { AppLayout } from '@/components/layout/app-layout';

interface ProgressData {
  overview: {
    completedDays: number;
    totalDays: number;
    progressPercentage: number;
    averageReadingTime: number;
    currentStreak: number;
    longestStreak: number;
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
    completedAt: Date;
    readingTimeSeconds: number | null;
  }>;
  monthlyProgress: Record<string, number>;
  plan: {
    name: string;
    totalDays: number;
  };
}

interface ProgressContentProps {
  data: ProgressData;
}

export function ProgressContent({ data }: ProgressContentProps) {
  // Calculate days per week average
  const weeksActive = Math.max(1, Math.ceil(data.overview.completedDays / 7));
  const daysPerWeek = (data.overview.completedDays / weeksActive).toFixed(1);

  // Get recent months for chart
  const recentMonths = Object.entries(data.monthlyProgress)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  const maxMonthlyReading = Math.max(...Object.values(data.monthlyProgress));

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif">Progress Tracking</h1>
            <p className="text-muted-foreground">
              Your journey through the {data.plan.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {data.overview.progressPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.completedDays}
              </div>
              <div className="text-xs text-muted-foreground">
                of {data.overview.totalDays} total days
              </div>
              <Progress value={data.overview.progressPercentage} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.currentStreak}
              </div>
              <div className="text-xs text-muted-foreground">
                Longest: {data.overview.longestStreak} days
              </div>
              <div className="text-xs text-green-600 mt-1">
                {data.overview.currentStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Reading Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatReadingTime(data.overview.averageReadingTime)}
              </div>
              <div className="text-xs text-muted-foreground">
                per session
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {daysPerWeek} days/week average
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.achievements.length}
              </div>
              <div className="text-xs text-muted-foreground">
                earned so far
              </div>
              {data.achievements.length > 0 && (
                <div className="text-xs text-purple-600 mt-1">
                  Latest: {data.achievements[0].name}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMonths.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reading data yet</p>
                  <p className="text-sm">Complete your first reading to see progress!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMonths.map(([month, count]) => (
                    <div key={month} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">
                        {new Date(month + '-01').toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all duration-300"
                              style={{ width: `${(count / maxMonthlyReading) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm font-medium w-8 text-right">
                            {count}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.achievements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements yet</p>
                    <p className="text-sm">Keep reading to unlock achievements!</p>
                  </div>
                ) : (
                  data.achievements.map((achievement) => (
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

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentReadings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start reading to track your progress!</p>
                  </div>
                ) : (
                  data.recentReadings.map((reading) => (
                    <div key={reading.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Day {reading.day}</div>
                        <div className="text-sm text-muted-foreground">
                          {reading.passages.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {formatTimeAgo(reading.completedAt)}
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
        </div>
      </div>
    </AppLayout>
  );
}
