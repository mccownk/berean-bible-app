
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBiblePassageText, getBiblePassage } from '@/lib/bible-api';
import { getMockBiblePassage } from '@/lib/esv-api';
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
    const translationParam = searchParams.get('translation');
    
    if (!passages) {
      return NextResponse.json({ message: 'Passages parameter is required' }, { status: 400 });
    }

    const passageArray = passages.split(',').map(p => p.trim());
    
    // Determine which translation to use (priority: URL param > user preference > default)
    let bibleId = 'ESV'; // Default to ESV
    
    if (translationParam) {
      // Use translation from URL parameter
      bibleId = translationParam;
    } else {
      // Fallback to user's preferred translation
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
    }
    
    // Use unified Bible service that routes to appropriate API
    const response = await getBiblePassage(passageArray, 'text', bibleId);
    
    if (!response) {
      // If both APIs fail, use mock content for development
      const content = getMockBiblePassage(passageArray);
      return NextResponse.json({
        passages: passageArray,
        content,
        reference: passageArray.join(', '),
        translation: bibleId
      });
    }

    return NextResponse.json({
      passages: passageArray,
      content: response.passages[0],
      reference: response.reference,
      translation: response.translation
    });

  } catch (error) {
    console.error('Bible passage API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
