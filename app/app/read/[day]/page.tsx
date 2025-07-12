import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ReadingContent } from '@/components/reading/reading-content';

export const dynamic = 'force-dynamic';

// Simple daily reading plan (first 10 days as example)
const dailyReadings = {
  1: { nt: ['Matthew 1'], ot: ['Genesis 1-2'], estimatedMinutes: 15 },
  2: { nt: ['Matthew 2'], ot: ['Genesis 3-4'], estimatedMinutes: 15 },
  3: { nt: ['Matthew 3'], ot: ['Genesis 5-6'], estimatedMinutes: 15 },
  4: { nt: ['Matthew 4'], ot: ['Genesis 7-8'], estimatedMinutes: 15 },
  5: { nt: ['Matthew 5:1-20'], ot: ['Genesis 9-10'], estimatedMinutes: 15 },
  6: { nt: ['Matthew 5:21-48'], ot: ['Genesis 11-12'], estimatedMinutes: 15 },
  7: { nt: ['Matthew 6'], ot: ['Genesis 13-14'], estimatedMinutes: 15 },
  8: { nt: ['Matthew 7'], ot: ['Genesis 15-16'], estimatedMinutes: 15 },
  9: { nt: ['Matthew 8'], ot: ['Genesis 17-18'], estimatedMinutes: 15 },
  10: { nt: ['Matthew 9'], ot: ['Genesis 19-20'], estimatedMinutes: 15 },
  // Add more days as needed...
};

interface ReadingPageProps {
  params: {
    day: string;
  };
}

export default async function ReadingPage({ params }: ReadingPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  const day = parseInt(params.day);
  
  if (isNaN(day) || day < 1 || day > 365) {
    redirect('/dashboard');
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    redirect('/');
  }

  // Get today's reading
  const todaysReading = dailyReadings[day] || {
    nt: ['Matthew 1'],
    ot: ['Genesis 1'],
    estimatedMinutes: 15
  };

  // Check if user completed this day
  const isCompleted = user.completedReadings.includes(day);

  const readingData = {
    plan: {
      id: 'berean-plan',
      name: 'Berean Bible Reading Plan',
      totalDays: 365
    },
    reading: {
      id: `day-${day}`,
      day: day,
      phase: Math.ceil(day / 90), // 4 phases per year
      ntPassages: todaysReading.nt,
      ntEstimatedMinutes: Math.ceil(todaysReading.estimatedMinutes / 2),
      otPassages: todaysReading.ot,
      otEstimatedMinutes: Math.ceil(todaysReading.estimatedMinutes / 2),
      totalEstimatedMinutes: todaysReading.estimatedMinutes,
      passages: [...todaysReading.nt, ...todaysReading.ot],
      estimatedMinutes: todaysReading.estimatedMinutes
    },
    progress: {
      id: `progress-${day}`,
      isCompleted: isCompleted,
      completedAt: isCompleted ? new Date() : null,
      totalReadingTimeSeconds: null,
      currentPhase: Math.ceil(day / 90),
      ntCompleted: isCompleted,
      ntCompletedAt: isCompleted ? new Date() : null,
      otCompleted: isCompleted,
      otCompletedAt: isCompleted ? new Date() : null,
      readingTimeSeconds: null,
      currentCycle: 1
    },
    notes: [],
    navigation: {
      previous: day > 1 ? { day: day - 1 } : null,
      next: day < 365 ? { day: day + 1 } : null
    }
  };

  return <ReadingContent data={readingData} />;
}
