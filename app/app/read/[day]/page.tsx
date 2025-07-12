import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ReadingContent } from '@/components/reading/reading-content';

export const dynamic = 'force-dynamic';

// Berean Bible Reading Plan - First 30 days (expand as needed)
const dailyReadings = {
  1: { nt: ['1 John 1-5'], ot: ['Genesis 1-3'], estimatedMinutes: 20 },
  2: { nt: ['2 John'], ot: ['Genesis 4-6'], estimatedMinutes: 18 },
  3: { nt: ['3 John'], ot: ['Genesis 7-9'], estimatedMinutes: 18 },
  4: { nt: ['Jude'], ot: ['Genesis 10-12'], estimatedMinutes: 18 },
  5: { nt: ['Revelation 1-2'], ot: ['Genesis 13-15'], estimatedMinutes: 20 },
  6: { nt: ['Revelation 3-4'], ot: ['Genesis 16-18'], estimatedMinutes: 20 },
  7: { nt: ['Revelation 5-6'], ot: ['Genesis 19-21'], estimatedMinutes: 20 },
  8: { nt: ['Revelation 7-8'], ot: ['Genesis 22-24'], estimatedMinutes: 20 },
  9: { nt: ['Revelation 9-10'], ot: ['Genesis 25-27'], estimatedMinutes: 20 },
  10: { nt: ['Revelation 11-12'], ot: ['Genesis 28-30'], estimatedMinutes: 20 },
  // Add more days as needed...
  // You can expand this to 365 days with the full Berean plan
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
  const isCompleted = (user.completedReadings || []).includes(day);

  const readingData = {
    plan: {
      id: 'berean-plan',
      name: 'Berean Bible Reading Plan',
      totalDays: 365
    },
    reading: {
      id: `day-${day}`,
      day: day,
      phase: Math.ceil(day / 90),
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
