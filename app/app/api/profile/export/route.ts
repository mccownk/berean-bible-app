
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

    // Get user's complete data
    const [user, progress, notes, achievements, streak] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          timezone: true,
          preferredReadingTime: true,
          notificationsEnabled: true,
          theme: true,
          fontSize: true
        }
      }),
      prisma.readingProgress.findMany({
        where: { userId: session.user.id },
        include: {
          dailyReading: {
            select: {
              day: true,
              passages: true,
              estimatedMinutes: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.note.findMany({
        where: { userId: session.user.id },
        include: {
          dailyReading: {
            select: {
              day: true,
              passages: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        include: {
          achievement: {
            select: {
              name: true,
              description: true,
              category: true
            }
          }
        },
        orderBy: { earnedAt: 'asc' }
      }),
      prisma.readingStreak.findUnique({
        where: { userId: session.user.id }
      })
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name: user?.name,
        email: user?.email,
        joinDate: user?.createdAt,
        preferences: {
          timezone: user?.timezone,
          preferredReadingTime: user?.preferredReadingTime,
          notificationsEnabled: user?.notificationsEnabled,
          theme: user?.theme,
          fontSize: user?.fontSize
        }
      },
      readingProgress: progress.map(p => ({
        day: p.dailyReading.day,
        passages: p.dailyReading.passages,
        estimatedMinutes: p.dailyReading.estimatedMinutes,
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
        readingTimeSeconds: p.readingTimeSeconds,
        currentCycle: p.currentCycle,
        createdAt: p.createdAt
      })),
      notes: notes.map(n => ({
        day: n.dailyReading.day,
        passages: n.dailyReading.passages,
        content: n.content,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      })),
      achievements: achievements.map(a => ({
        name: a.achievement.name,
        description: a.achievement.description,
        category: a.achievement.category,
        earnedAt: a.earnedAt
      })),
      streak: {
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        lastReadingDate: streak?.lastReadingDate
      },
      statistics: {
        totalDaysCompleted: progress.filter(p => p.isCompleted).length,
        totalNotes: notes.length,
        totalAchievements: achievements.length,
        averageReadingTime: progress.filter(p => p.readingTimeSeconds).length > 0 
          ? Math.round(progress.filter(p => p.readingTimeSeconds).reduce((sum, p) => sum + (p.readingTimeSeconds || 0), 0) / progress.filter(p => p.readingTimeSeconds).length)
          : 0
      }
    };

    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="berean-data-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

    return response;

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
