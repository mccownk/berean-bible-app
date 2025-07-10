
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchBiblePassageText, getMockBiblePassage, DEFAULT_BIBLE_ID } from '@/lib/bible-api';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const passages = searchParams.get('passages');
    
    if (!passages) {
      return NextResponse.json({ message: 'Passages parameter is required' }, { status: 400 });
    }

    const passageArray = passages.split(',').map(p => p.trim());
    
    // Get user's preferred translation
    let bibleId = DEFAULT_BIBLE_ID; // Default to BSB
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { preferredTranslation: true }
      });
      
      if (user?.preferredTranslation) {
        bibleId = user.preferredTranslation;
      }
    } catch (dbError) {
      console.error('Error fetching user translation preference:', dbError);
      // Continue with default translation
    }
    
    // Try to fetch from Bible API first with user's preferred translation
    let content = await fetchBiblePassageText(passageArray, bibleId);
    
    // If Bible API fails, use mock content for development
    if (!content) {
      content = getMockBiblePassage(passageArray);
    }

    return NextResponse.json({
      passages: passageArray,
      content,
      reference: passageArray.join(', '),
      translation: bibleId
    });

  } catch (error) {
    console.error('Bible passage API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
