
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllAvailableTranslations } from '@/lib/translation-discovery';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get all available translations
    const translations = await getAllAvailableTranslations();

    return NextResponse.json({
      translations,
      count: translations.length,
      message: 'Translations fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch translations',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
