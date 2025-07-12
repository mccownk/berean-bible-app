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

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    redirect('/');
  }

  // Simple dashboard data using User model
  const dashboardData = {
    plan: {
      id: 'berean-plan',
      name: 'Berean Bible Reading Plan',
      description: 'Daily Scripture examination',
      totalDays: 365
    },
    progress: {
      completedDays: user.completedReadings.length,
      totalDays: 365,
      progressPercentage: Math.round((user.completedReadings.length / 365) * 100),
      currentDay: user.currentDay,
      currentReading: {
        id: `day-${user.currentDay}`,
        day: user.currentDay,
        passages: ['Today\'s Reading'],
        estimatedMinutes: 15
      }
    },
    streak: {
      currentStreak: user.readingStreak,
      longestStreak: user.longestStreak,
      lastReadingDate: user.lastReadingDate
    },
    achievements: [],
    recentReadings: []
  };

  return <DashboardContent data={dashboardData} />;
}
