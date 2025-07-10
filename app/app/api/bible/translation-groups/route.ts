
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTranslationGroups } from '@/lib/translation-discovery';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get translation groups
    const groups = await getTranslationGroups();

    return NextResponse.json({
      groups,
      count: groups.length,
      message: 'Translation groups fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching translation groups:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch translation groups',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
