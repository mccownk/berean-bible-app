
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ReadingContent } from '@/components/reading/reading-content';

export const dynamic = 'force-dynamic';

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
  
  if (isNaN(day) || day < 1 || day > 750) {
    redirect('/dashboard');
  }

  // Get the reading plan and specific day's reading
  const plan = await prisma.readingPlan.findFirst({
    where: { isActive: true },
    include: {
      dailyReadings: {
        where: { day },
        include: {
          notes: {
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!plan || !plan.dailyReadings[0]) {
    redirect('/dashboard');
  }

  const dailyReading = plan.dailyReadings[0];

  // Get or create user's progress for this reading
  let progress = await prisma.readingProgress.findUnique({
    where: {
      userId_planId_readingId: {
        userId: session.user.id,
        planId: plan.id,
        readingId: dailyReading.id
      }
    }
  });

  if (!progress) {
    progress = await prisma.readingProgress.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        readingId: dailyReading.id,
        currentCycle: 1,
        isCompleted: false
      }
    });
  }

  // Get adjacent readings for navigation
  const previousDay = day > 1 ? day - 1 : 750;
  const nextDay = day < 750 ? day + 1 : 1;

  const previousReading = await prisma.dailyReading.findFirst({
    where: { planId: plan.id, day: previousDay }
  });

  const nextReading = await prisma.dailyReading.findFirst({
    where: { planId: plan.id, day: nextDay }
  });

  const readingData = {
    plan: {
      id: plan.id,
      name: plan.name,
      totalDays: plan.totalDays
    },
    reading: {
      id: dailyReading.id,
      day: dailyReading.day,
      passages: dailyReading.passages,
      estimatedMinutes: dailyReading.estimatedMinutes
    },
    progress: {
      id: progress.id,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
      readingTimeSeconds: progress.readingTimeSeconds,
      currentCycle: progress.currentCycle
    },
    notes: dailyReading.notes.map(note => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    })),
    navigation: {
      previous: previousReading ? { day: previousReading.day } : null,
      next: nextReading ? { day: nextReading.day } : null
    }
  };

  return <ReadingContent data={readingData} />;
}
