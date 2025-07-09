
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    // Get the active reading plan
    const plan = await prisma.readingPlan.findFirst({
      where: planId ? { id: planId } : { isActive: true },
      include: {
        dailyReadings: {
          orderBy: { day: 'asc' }
        }
      }
    });

    if (!plan) {
      return NextResponse.json({ message: 'Reading plan not found' }, { status: 404 });
    }

    // Get user's progress for this plan
    const userProgress = await prisma.readingProgress.findMany({
      where: {
        userId: session.user.id,
        planId: plan.id
      },
      include: {
        dailyReading: true
      }
    });

    // Calculate progress statistics
    const completedDays = userProgress.filter(p => p.isCompleted).length;
    const totalDays = plan.totalDays;
    const progressPercentage = Math.round((completedDays / totalDays) * 100);

    // Find current day (first incomplete day)
    const currentDay = userProgress.find(p => !p.isCompleted)?.dailyReading?.day || 1;
    const nextDay = currentDay < totalDays ? currentDay + 1 : 1;

    return NextResponse.json({
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        totalDays: plan.totalDays,
        isActive: plan.isActive
      },
      dailyReadings: plan.dailyReadings,
      progress: {
        completedDays,
        totalDays,
        progressPercentage,
        currentDay,
        nextDay
      },
      userProgress: userProgress.map(p => ({
        id: p.id,
        readingId: p.readingId,
        day: p.dailyReading.day,
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
        readingTimeSeconds: p.readingTimeSeconds,
        currentCycle: p.currentCycle
      }))
    });

  } catch (error) {
    console.error('Reading plan API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
