
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  // Get user's reading plan and progress
  const plan = await prisma.readingPlan.findFirst({
    where: { isActive: true },
    include: {
      dailyReadings: {
        orderBy: { day: 'asc' }
      }
    }
  });

  if (!plan) {
    return <div>No active reading plan found</div>;
  }

  // Get user's progress
  const userProgress = await prisma.readingProgress.findMany({
    where: {
      userId: session.user.id,
      planId: plan.id
    },
    include: {
      dailyReading: true
    },
    orderBy: {
      completedAt: 'desc'
    }
  });

  // Get reading streak
  const readingStreak = await prisma.readingStreak.findUnique({
    where: { userId: session.user.id }
  });

  // Get achievements
  const achievements = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' }
  });

  // Calculate statistics
  const completedDays = userProgress.filter(p => p.isCompleted).length;
  const totalDays = plan.totalDays;
  const recentReadings = userProgress
    .filter(p => p.isCompleted)
    .slice(0, 5);

  // Find current day
  const currentDay = userProgress.find(p => !p.isCompleted)?.dailyReading?.day || 1;
  const currentReading = plan.dailyReadings.find(d => d.day === currentDay);

  const dashboardData = {
    plan: {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      totalDays: plan.totalDays
    },
    progress: {
      completedDays,
      totalDays,
      progressPercentage: Math.round((completedDays / totalDays) * 100),
      currentDay,
      currentReading: currentReading ? {
        id: currentReading.id,
        day: currentReading.day,
        passages: currentReading.passages,
        estimatedMinutes: currentReading.estimatedMinutes
      } : null
    },
    streak: {
      currentStreak: readingStreak?.currentStreak || 0,
      longestStreak: readingStreak?.longestStreak || 0,
      lastReadingDate: readingStreak?.lastReadingDate || null
    },
    achievements: achievements.map(a => ({
      id: a.id,
      name: a.achievement.name,
      description: a.achievement.description,
      icon: a.achievement.icon,
      category: a.achievement.category,
      earnedAt: a.earnedAt
    })),
    recentReadings: recentReadings.map(r => ({
      id: r.id,
      day: r.dailyReading.day,
      passages: r.dailyReading.passages,
      completedAt: r.completedAt,
      readingTimeSeconds: r.readingTimeSeconds
    }))
  };

  return <DashboardContent data={dashboardData} />;
}
