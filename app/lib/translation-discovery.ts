
const API_BIBLE_BASE_URL = 'https://api.scripture.api.bible/v1';

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  description?: string;
  category: 'popular' | 'traditional' | 'modern' | 'specialized' | 'historical';
  source: 'esv' | 'api_bible';
  type?: string;
  updatedAt?: string;
}

export interface TranslationGroup {
  category: string;
  label: string;
  translations: BibleTranslation[];
}

// Cache for translations to avoid repeated API calls
let translationCache: BibleTranslation[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Popular and commonly used translations that should be prioritized
const POPULAR_TRANSLATION_IDS = new Set([
  'ESV', // ESV API
  'bba9f40183526463-01', // BSB
  'de4e12af7f28f599-01', // KJV
  'de4e12af7f28f599-02', // KJV Protestant
  '9879dbb7cfe39e4d-04', // WEB Protestant
  '06125adad2d5898a-01', // ASV
  '01b29f4b342acc35-01', // LSV
  '65eec8e0b60e656b-01', // FBV
]);

// Translation categories for better organization
function categorizeTranslation(translation: any): 'popular' | 'traditional' | 'modern' | 'specialized' | 'historical' {
  const abbrev = translation.abbreviation?.toUpperCase();
  const name = translation.name?.toLowerCase() || '';
  
  // Popular modern translations
  if (POPULAR_TRANSLATION_IDS.has(translation.id) || abbrev === 'ESV') {
    return 'popular';
  }
  
  // Traditional/Historical translations
  if (abbrev?.includes('KJV') || abbrev === 'ASV' || abbrev === 'RV' || 
      name.includes('king james') || name.includes('authorised') || 
      name.includes('american standard') || name.includes('revised version')) {
    return 'traditional';
  }
  
  // Modern translations
  if (abbrev === 'WEB' || abbrev === 'WEBBE' || abbrev === 'LSV' || 
      abbrev === 'FBV' || abbrev === 'BSB' || name.includes('literal standard') ||
      name.includes('world english') || name.includes('free bible')) {
    return 'modern';
  }
  
  // Specialized versions (Messianic, Jewish, etc.)
  if (name.includes('messianic') || name.includes('jewish') || name.includes('orthodox') ||
      name.includes('septuagint') || abbrev?.includes('OJB') || abbrev?.includes('TOJB')) {
    return 'specialized';
  }
  
  // Historical/Academic
  if (name.includes('douay') || name.includes('rheims') || name.includes('geneva') ||
      name.includes('byzantine') || name.includes('majority text') || 
      name.includes('targum') || name.includes('1885') || name.includes('1917')) {
    return 'historical';
  }
  
  return 'modern'; // Default fallback
}

async function fetchAllEnglishTranslations(): Promise<BibleTranslation[]> {
  try {
    const response = await fetch(`${API_BIBLE_BASE_URL}/bibles`, {
      headers: {
        'api-key': process.env.BIBLE_API_KEY || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Bible API Error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    // Filter for English translations and transform them
    const englishBibles: BibleTranslation[] = data.data
      .filter((bible: any) => bible.language.id === 'eng')
      .map((bible: any) => ({
        id: bible.id,
        name: bible.name,
        abbreviation: bible.abbreviation,
        language: bible.language,
        description: bible.description || bible.descriptionLocal,
        category: categorizeTranslation(bible),
        source: 'api_bible' as const,
        type: bible.type,
        updatedAt: bible.updatedAt
      }));

    // Add ESV from ESV API as the first translation
    const esvTranslation: BibleTranslation = {
      id: 'ESV',
      name: 'English Standard Version',
      abbreviation: 'ESV',
      language: { 
        id: 'eng', 
        name: 'English', 
        nameLocal: 'English',
        script: 'Latin',
        scriptDirection: 'LTR'
      },
      description: 'Modern literal translation - Primary source via ESV API',
      category: 'popular',
      source: 'esv',
      type: 'text'
    };

    // Combine ESV with API.Bible translations
    const allTranslations = [esvTranslation, ...englishBibles];
    
    // Sort by category priority and then alphabetically
    const categoryOrder = { popular: 0, modern: 1, traditional: 2, specialized: 3, historical: 4 };
    allTranslations.sort((a, b) => {
      const catA = categoryOrder[a.category];
      const catB = categoryOrder[b.category];
      
      if (catA !== catB) {
        return catA - catB;
      }
      
      // Within same category, prioritize popular translations first
      if (a.category === 'popular' && b.category === 'popular') {
        if (a.id === 'ESV') return -1;
        if (b.id === 'ESV') return 1;
        if (POPULAR_TRANSLATION_IDS.has(a.id) && !POPULAR_TRANSLATION_IDS.has(b.id)) return -1;
        if (!POPULAR_TRANSLATION_IDS.has(a.id) && POPULAR_TRANSLATION_IDS.has(b.id)) return 1;
      }
      
      return a.abbreviation.localeCompare(b.abbreviation);
    });

    return allTranslations;
  } catch (error) {
    console.error('Error fetching available translations:', error);
    return [];
  }
}

export async function getAllAvailableTranslations(forceRefresh = false): Promise<BibleTranslation[]> {
  const now = Date.now();
  
  // Return cached data if it's still valid and not forcing refresh
  if (!forceRefresh && translationCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return translationCache;
  }
  
  // Fetch fresh data
  const translations = await fetchAllEnglishTranslations();
  
  // Update cache
  translationCache = translations;
  cacheTimestamp = now;
  
  return translations;
}

export async function getTranslationGroups(forceRefresh = false): Promise<TranslationGroup[]> {
  const translations = await getAllAvailableTranslations(forceRefresh);
  
  const groups: TranslationGroup[] = [
    {
      category: 'popular',
      label: 'Popular Translations',
      translations: translations.filter(t => t.category === 'popular')
    },
    {
      category: 'modern',
      label: 'Modern Translations',
      translations: translations.filter(t => t.category === 'modern')
    },
    {
      category: 'traditional',
      label: 'Traditional Translations',
      translations: translations.filter(t => t.category === 'traditional')
    },
    {
      category: 'specialized',
      label: 'Specialized Translations',
      translations: translations.filter(t => t.category === 'specialized')
    },
    {
      category: 'historical',
      label: 'Historical Translations',
      translations: translations.filter(t => t.category === 'historical')
    }
  ].filter(group => group.translations.length > 0); // Only include non-empty groups
  
  return groups;
}

export async function getTranslationById(id: string): Promise<BibleTranslation | null> {
  const translations = await getAllAvailableTranslations();
  return translations.find(t => t.id === id) || null;
}

export async function getPopularTranslations(): Promise<BibleTranslation[]> {
  const translations = await getAllAvailableTranslations();
  return translations.filter(t => t.category === 'popular');
}

export function getTranslationDisplayName(translation: BibleTranslation): string {
  return `${translation.abbreviation} - ${translation.name}`;
}

export function isESVTranslation(bibleId: string): boolean {
  return bibleId === 'ESV' || bibleId === 'esv';
}

// Fallback translations if API fails
export function getFallbackTranslations(): BibleTranslation[] {
  return [
    {
      id: 'ESV',
      name: 'English Standard Version',
      abbreviation: 'ESV',
      language: { 
        id: 'eng', 
        name: 'English', 
        nameLocal: 'English',
        script: 'Latin',
        scriptDirection: 'LTR'
      },
      description: 'Modern literal translation - Primary source via ESV API',
      category: 'popular',
      source: 'esv'
    },
    {
      id: 'bba9f40183526463-01',
      name: 'Berean Standard Bible',
      abbreviation: 'BSB',
      language: { 
        id: 'eng', 
        name: 'English', 
        nameLocal: 'English',
        script: 'Latin',
        scriptDirection: 'LTR'
      },
      description: 'Berean Standard Bible',
      category: 'popular',
      source: 'api_bible'
    },
    {
      id: 'de4e12af7f28f599-01',
      name: 'King James (Authorised) Version',
      abbreviation: 'KJV',
      language: { 
        id: 'eng', 
        name: 'English', 
        nameLocal: 'English',
        script: 'Latin',
        scriptDirection: 'LTR'
      },
      description: 'Classic English translation from 1611',
      category: 'traditional',
      source: 'api_bible'
    },
    {
      id: '9879dbb7cfe39e4d-04',
      name: 'World English Bible',
      abbreviation: 'WEB',
      language: { 
        id: 'eng', 
        name: 'English', 
        nameLocal: 'English',
        script: 'Latin',
        scriptDirection: 'LTR'
      },
      description: 'Public domain modern English translation',
      category: 'modern',
      source: 'api_bible'
    }
  ];
}

// Utility to clear translation cache (useful for testing or manual refresh)
export function clearTranslationCache(): void {
  translationCache = null;
  cacheTimestamp = 0;
}
