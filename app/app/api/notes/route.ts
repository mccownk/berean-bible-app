
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

    const { readingId, content } = await request.json();

    if (!readingId || !content?.trim()) {
      return NextResponse.json({ message: 'Reading ID and content are required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        readingId,
        content: content.trim(),
        isPrivate: true
      }
    });

    return NextResponse.json({
      message: 'Note saved successfully',
      note: {
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });

  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const readingId = searchParams.get('readingId');

    const whereClause: any = { userId: session.user.id };
    if (readingId) {
      whereClause.readingId = readingId;
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        dailyReading: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      notes: notes.map(note => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        reading: {
          day: note.dailyReading.day,
          passages: [...(note.dailyReading.ntPassages || []), ...(note.dailyReading.otPassages || [])]
        }
      }))
    });

  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
