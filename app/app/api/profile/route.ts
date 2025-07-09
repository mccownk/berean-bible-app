
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { 
      name, 
      notificationsEnabled, 
      theme, 
      fontSize, 
      preferredReadingTime,
      preferredTimeOfDay,
      preferredStartTime
    } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        notificationsEnabled,
        theme,
        fontSize,
        preferredReadingTime,
        preferredTimeOfDay,
        preferredStartTime
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        preferences: {
          notificationsEnabled: updatedUser.notificationsEnabled,
          theme: updatedUser.theme,
          fontSize: updatedUser.fontSize,
          preferredReadingTime: updatedUser.preferredReadingTime,
          preferredTimeOfDay: updatedUser.preferredTimeOfDay,
          preferredStartTime: updatedUser.preferredStartTime
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
