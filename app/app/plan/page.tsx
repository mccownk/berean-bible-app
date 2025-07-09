
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PlanContent } from '@/components/plan/plan-content';

export const dynamic = 'force-dynamic';

export default async function PlanPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  // Get the reading plan with all daily readings
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
    }
  });

  // Create a map of progress by reading ID
  const progressMap = new Map(userProgress.map(p => [p.readingId, p]));

  const planData = {
    plan: {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      totalDays: plan.totalDays
    },
    readings: plan.dailyReadings.map(reading => ({
      id: reading.id,
      day: reading.day,
      passages: reading.passages,
      estimatedMinutes: reading.estimatedMinutes,
      progress: progressMap.get(reading.id) ? {
        isCompleted: progressMap.get(reading.id)!.isCompleted,
        completedAt: progressMap.get(reading.id)!.completedAt,
        currentCycle: progressMap.get(reading.id)!.currentCycle
      } : null
    })),
    overview: {
      completedDays: userProgress.filter(p => p.isCompleted).length,
      totalDays: plan.totalDays,
      currentDay: userProgress.find(p => !p.isCompleted)?.dailyReading?.day || 1
    }
  };

  return <PlanContent data={planData} />;
}
