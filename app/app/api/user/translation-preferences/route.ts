
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
    const userId = searchParams.get('userId') || session.user.id;

    // Ensure user can only access their own preferences (or admin access)
    if (userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredLanguage: true,
        preferredTranslation: true,
        secondaryTranslation: true,
        translationHistory: true,
        favoriteTranslations: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      preferredLanguage: user.preferredLanguage,
      preferredTranslation: user.preferredTranslation,
      secondaryTranslation: user.secondaryTranslation,
      translationHistory: user.translationHistory,
      favoriteTranslations: user.favoriteTranslations,
      message: 'Translation preferences fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching translation preferences:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch translation preferences',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      preferredLanguage,
      preferredTranslation,
      secondaryTranslation,
      favoriteTranslations
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(preferredLanguage && { preferredLanguage }),
        ...(preferredTranslation && { preferredTranslation }),
        ...(secondaryTranslation !== undefined && { secondaryTranslation }),
        ...(favoriteTranslations && { favoriteTranslations }),
      },
      select: {
        preferredLanguage: true,
        preferredTranslation: true,
        secondaryTranslation: true,
        translationHistory: true,
        favoriteTranslations: true,
      },
    });

    return NextResponse.json({
      ...updatedUser,
      message: 'Translation preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating translation preferences:', error);
    return NextResponse.json(
      { 
        message: 'Failed to update translation preferences',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
