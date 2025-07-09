
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchBiblePassageText, getMockBiblePassage } from '@/lib/esv-api';

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
    
    // Try to fetch from ESV API first
    let content = await fetchBiblePassageText(passageArray);
    
    // If ESV API fails, use mock content for development
    if (!content) {
      content = getMockBiblePassage(passageArray);
    }

    return NextResponse.json({
      passages: passageArray,
      content,
      reference: passageArray.join(', ')
    });

  } catch (error) {
    console.error('Bible passage API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
