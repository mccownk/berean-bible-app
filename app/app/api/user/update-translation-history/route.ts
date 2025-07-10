
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

    const body = await request.json();
    const { userId, translationId } = body;

    // Ensure user can only update their own history (or use session user if no userId provided)
    const targetUserId = userId || session.user.id;
    if (targetUserId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!translationId) {
      return NextResponse.json({ message: 'Translation ID is required' }, { status: 400 });
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { translationHistory: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update translation history: add new translation to the beginning, remove duplicates, keep only last 10
    const currentHistory = user.translationHistory || [];
    const newHistory = [
      translationId,
      ...currentHistory.filter(id => id !== translationId)
    ].slice(0, 10);

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        translationHistory: newHistory,
        // Also update the preferred translation to the most recent one
        preferredTranslation: translationId,
      },
      select: {
        translationHistory: true,
        preferredTranslation: true,
      },
    });

    return NextResponse.json({
      translationHistory: updatedUser.translationHistory,
      preferredTranslation: updatedUser.preferredTranslation,
      message: 'Translation history updated successfully'
    });

  } catch (error) {
    console.error('Error updating translation history:', error);
    return NextResponse.json(
      { 
        message: 'Failed to update translation history',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
