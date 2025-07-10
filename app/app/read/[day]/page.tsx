
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
  
  if (isNaN(day) || day < 1 || day > 1260) {
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
        currentPhase: dailyReading.phase || 1,
        otCycle: dailyReading.otCycle || 1,
        isCompleted: false,
        ntCompleted: false,
        otCompleted: false
      }
    });
  }

  // Get adjacent readings for navigation
  const previousDay = day > 1 ? day - 1 : 1260;
  const nextDay = day < 1260 ? day + 1 : 1;

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
      phase: dailyReading.phase,
      // New Testament readings
      ntPassages: dailyReading.ntPassages || [],
      ntEstimatedMinutes: dailyReading.ntEstimatedMinutes,
      ntRepetitionType: dailyReading.ntRepetitionType,
      ntRepetitionCount: dailyReading.ntRepetitionCount,
      // Old Testament readings
      otPassages: dailyReading.otPassages || [],
      otEstimatedMinutes: dailyReading.otEstimatedMinutes,
      otCycle: dailyReading.otCycle,
      // Combined
      totalEstimatedMinutes: dailyReading.totalEstimatedMinutes,
      // Legacy support (fallback to old fields if they exist)
      passages: [...(dailyReading.ntPassages || []), ...(dailyReading.otPassages || [])],
      estimatedMinutes: dailyReading.totalEstimatedMinutes
    },
    progress: {
      id: progress.id,
      // Combined progress
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
      totalReadingTimeSeconds: progress.totalReadingTimeSeconds,
      currentPhase: progress.currentPhase || 1,
      otCycle: progress.otCycle || 1,
      // Individual progress
      ntCompleted: progress.ntCompleted || false,
      ntCompletedAt: progress.ntCompletedAt,
      ntReadingTimeSeconds: progress.ntReadingTimeSeconds,
      otCompleted: progress.otCompleted || false,
      otCompletedAt: progress.otCompletedAt,
      otReadingTimeSeconds: progress.otReadingTimeSeconds,
      // Legacy support
      readingTimeSeconds: progress.totalReadingTimeSeconds,
      currentCycle: progress.otCycle || 1
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
