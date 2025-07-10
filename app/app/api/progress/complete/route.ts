
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { 
      progressId, 
      section, 
      ntReadingTimeSeconds, 
      otReadingTimeSeconds, 
      totalReadingTimeSeconds,
      // Legacy support
      readingTimeSeconds 
    } = await request.json();

    if (!progressId) {
      return NextResponse.json({ message: 'Progress ID is required' }, { status: 400 });
    }

    // Get current progress
    const currentProgress = await prisma.readingProgress.findUnique({
      where: { id: progressId },
      include: { dailyReading: true }
    });

    if (!currentProgress) {
      return NextResponse.json({ message: 'Progress not found' }, { status: 404 });
    }

    let updateData: any = {};
    const now = new Date();

    if (section === 'nt') {
      // Complete only NT portion
      updateData = {
        ntCompleted: true,
        ntCompletedAt: now,
        ntReadingTimeSeconds: ntReadingTimeSeconds || null,
        totalReadingTimeSeconds: totalReadingTimeSeconds || null
      };
      
      // Check if both NT and OT are now completed
      if (currentProgress.otCompleted || !currentProgress.dailyReading.otPassages?.length) {
        updateData.isCompleted = true;
        updateData.completedAt = now;
      }
    } else if (section === 'ot') {
      // Complete only OT portion
      updateData = {
        otCompleted: true,
        otCompletedAt: now,
        otReadingTimeSeconds: otReadingTimeSeconds || null,
        totalReadingTimeSeconds: totalReadingTimeSeconds || null
      };
      
      // Check if both NT and OT are now completed
      if (currentProgress.ntCompleted || !currentProgress.dailyReading.ntPassages?.length) {
        updateData.isCompleted = true;
        updateData.completedAt = now;
      }
    } else {
      // Complete both sections (legacy behavior or explicit complete all)
      updateData = {
        ntCompleted: true,
        ntCompletedAt: now,
        ntReadingTimeSeconds: ntReadingTimeSeconds || null,
        otCompleted: true,
        otCompletedAt: now,
        otReadingTimeSeconds: otReadingTimeSeconds || null,
        isCompleted: true,
        completedAt: now,
        totalReadingTimeSeconds: totalReadingTimeSeconds || readingTimeSeconds || null,
        // Legacy support
        readingTimeSeconds: totalReadingTimeSeconds || readingTimeSeconds || null
      };
    }

    // Update reading progress
    const updatedProgress = await prisma.readingProgress.update({
      where: { id: progressId },
      data: updateData,
      include: {
        dailyReading: true
      }
    });

    // Update reading streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const streak = await prisma.readingStreak.findUnique({
      where: { userId: session.user.id }
    });

    if (streak) {
      const lastDate = streak.lastReadingDate ? new Date(streak.lastReadingDate) : null;
      if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
      }
      
      let newCurrentStreak = 1;
      
      if (lastDate) {
        const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          newCurrentStreak = streak.currentStreak + 1;
        } else if (daysDiff === 0) {
          // Same day (already read today)
          newCurrentStreak = streak.currentStreak;
        } else {
          // Gap in reading, reset streak
          newCurrentStreak = 1;
        }
      }
      
      await prisma.readingStreak.update({
        where: { userId: session.user.id },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: Math.max(streak.longestStreak, newCurrentStreak),
          lastReadingDate: today
        }
      });
    }

    // Check for achievements
    const userProgress = await prisma.readingProgress.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true
      }
    });

    const completedCount = userProgress.length;
    const achievements = await prisma.achievement.findMany();

    // Check for milestone achievements
    const milestoneAchievements = achievements.filter(a => 
      a.category === 'milestone' && completedCount >= a.requiredCount
    );

    // Check for streak achievements
    const currentStreak = await prisma.readingStreak.findUnique({
      where: { userId: session.user.id }
    });

    const streakAchievements = achievements.filter(a => 
      a.category === 'streak' && (currentStreak?.currentStreak || 0) >= a.requiredCount
    );

    // Award new achievements
    const allEligibleAchievements = [...milestoneAchievements, ...streakAchievements];
    
    for (const achievement of allEligibleAchievements) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId: session.user.id,
            achievementId: achievement.id
          }
        },
        update: {},
        create: {
          userId: session.user.id,
          achievementId: achievement.id
        }
      });
    }

    return NextResponse.json({
      message: 'Reading marked as complete',
      progress: updatedProgress,
      newAchievements: allEligibleAchievements.length
    });

  } catch (error) {
    console.error('Progress complete API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
