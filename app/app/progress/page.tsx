
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ProgressContent } from '@/components/progress/progress-content';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  // Get user's progress data
  const [userProgress, readingStreak, achievements, plan] = await Promise.all([
    prisma.readingProgress.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true
      },
      include: {
        dailyReading: true
      },
      orderBy: { completedAt: 'desc' }
    }),
    prisma.readingStreak.findUnique({
      where: { userId: session.user.id }
    }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' }
    }),
    prisma.readingPlan.findFirst({
      where: { isActive: true }
    })
  ]);

  if (!plan) {
    return <div>No active reading plan found</div>;
  }

  // Calculate statistics
  const completedDays = userProgress.length;
  const totalDays = plan.totalDays;
  const progressPercentage = (completedDays / totalDays) * 100;

  // Calculate reading time stats
  const readingTimes = userProgress
    .filter(p => p.readingTimeSeconds)
    .map(p => p.readingTimeSeconds!);
  
  const averageReadingTime = readingTimes.length > 0 
    ? readingTimes.reduce((sum, time) => sum + time, 0) / readingTimes.length
    : 0;

  // Get monthly progress
  const monthlyProgress = userProgress.reduce((acc, progress) => {
    const month = new Date(progress.completedAt!).toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const progressData = {
    overview: {
      completedDays,
      totalDays,
      progressPercentage,
      averageReadingTime: Math.round(averageReadingTime / 60), // Convert to minutes
      currentStreak: readingStreak?.currentStreak || 0,
      longestStreak: readingStreak?.longestStreak || 0
    },
    achievements: achievements.map(a => ({
      id: a.id,
      name: a.achievement.name,
      description: a.achievement.description,
      icon: a.achievement.icon,
      category: a.achievement.category,
      earnedAt: a.earnedAt
    })),
    recentReadings: userProgress.slice(0, 10).map(p => ({
      id: p.id,
      day: p.dailyReading.day,
      passages: p.dailyReading.passages,
      completedAt: p.completedAt!,
      readingTimeSeconds: p.readingTimeSeconds
    })),
    monthlyProgress,
    plan: {
      name: plan.name,
      totalDays: plan.totalDays
    }
  };

  return <ProgressContent data={progressData} />;
}
